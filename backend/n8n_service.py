import httpx
import json
import os
import uuid
from typing import Dict, Any, Optional
from dotenv import load_dotenv

class N8NIntegration:
    """Integration service for n8n workflow orchestration"""
    
    def __init__(self):
        load_dotenv()
        self.n8n_url = os.environ.get("N8N_API_URL")
        self.api_key = os.environ.get("N8N_API_KEY")
        
        if not self.n8n_url or not self.api_key:
            raise ValueError("N8N_API_URL and N8N_API_KEY must be set in environment variables")
        
        # Remove trailing slash if present
        self.n8n_url = self.n8n_url.rstrip('/')
        
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    
    async def create_telegram_content_workflow(self) -> Dict[str, Any]:
        """Create n8n workflow for Telegram → AI → Approval → Backend flow"""
        
        workflow_data = {
            "name": "TRIAD Telegram Content Generation",
            "nodes": [
                {
                    "parameters": {
                        "path": "telegram-content",
                        "options": {}
                    },
                    "id": "webhook-telegram",
                    "name": "Telegram Webhook",
                    "type": "n8n-nodes-base.webhook",
                    "position": [240, 300],
                    "webhookId": str(uuid.uuid4())
                },
                {
                    "parameters": {
                        "promptType": "define",
                        "text": "={{ $json.message }}",
                        "hasOutputParser": False,
                        "options": {
                            "systemMessage": "You are an expert cybersecurity educator creating educational materials. Generate comprehensive, practical, and well-structured cybersecurity content based on user prompts."
                        }
                    },
                    "id": "ai-generator",
                    "name": "AI Content Generator",
                    "type": "@n8n/n8n-nodes-langchain.lmChatOpenAi",
                    "position": [460, 300]
                },
                {
                    "parameters": {
                        "conditions": {
                            "options": {
                                "caseSensitive": True,
                                "leftValue": "",
                                "operation": "contains"
                            },
                            "conditions": [
                                {
                                    "id": "approval-check",
                                    "leftValue": "={{ $json.approval }}",
                                    "rightValue": "approved",
                                    "operation": "equal"
                                }
                            ]
                        }
                    },
                    "id": "approval-gate",
                    "name": "Approval Gate",
                    "type": "n8n-nodes-base.if",
                    "position": [680, 300]
                },
                {
                    "parameters": {
                        "url": f"{os.environ.get('REACT_APP_BACKEND_URL', 'https://website-sprint-dev.preview.emergentagent.com')}/api/n8n/webhook/content",
                        "sendHeaders": True,
                        "headerParameters": {
                            "parameters": [
                                {
                                    "name": "Authorization",
                                    "value": "Bearer n8n-webhook"
                                }
                            ]
                        },
                        "sendBody": True,
                        "bodyParameters": {
                            "parameters": [
                                {
                                    "name": "title",
                                    "value": "={{ $json.title }}"
                                },
                                {
                                    "name": "content",
                                    "value": "={{ $json.content }}"
                                },
                                {
                                    "name": "category",
                                    "value": "Telegram Generated"
                                },
                                {
                                    "name": "source",
                                    "value": "telegram-bot"
                                },
                                {
                                    "name": "material_type",
                                    "value": "={{ $json.material_type }}"
                                }
                            ]
                        }
                    },
                    "id": "backend-upload",
                    "name": "Upload to Backend",
                    "type": "n8n-nodes-base.httpRequest",
                    "position": [900, 240]
                },
                {
                    "parameters": {
                        "text": "Content approval rejected. Workflow stopped.",
                        "options": {}
                    },
                    "id": "rejection-notice",
                    "name": "Approval Rejected",
                    "type": "n8n-nodes-base.noOp",
                    "position": [900, 360]
                }
            ],
            "connections": {
                "Telegram Webhook": {
                    "main": [
                        [
                            {
                                "node": "AI Content Generator",
                                "type": "main",
                                "index": 0
                            }
                        ]
                    ]
                },
                "AI Content Generator": {
                    "main": [
                        [
                            {
                                "node": "Approval Gate",
                                "type": "main",
                                "index": 0
                            }
                        ]
                    ]
                },
                "Approval Gate": {
                    "main": [
                        [
                            {
                                "node": "Upload to Backend",
                                "type": "main",
                                "index": 0
                            }
                        ],
                        [
                            {
                                "node": "Approval Rejected",
                                "type": "main",
                                "index": 0
                            }
                        ]
                    ]
                }
            },
            "active": True,
            "settings": {
                "executionOrder": "v1"
            },
            "staticData": None,
            "tags": [
                {
                    "createdAt": "2026-02-13T08:00:00.000Z",
                    "updatedAt": "2026-02-13T08:00:00.000Z",
                    "id": "telegram-content-generation",
                    "name": "telegram-content-generation"
                }
            ]
        }
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.n8n_url}/api/v1/workflows",
                    headers=self.headers,
                    json=workflow_data
                )
                
                if response.status_code == 201:
                    return {
                        "success": True,
                        "workflow": response.json(),
                        "message": "Telegram content workflow created successfully"
                    }
                else:
                    return {
                        "success": False,
                        "error": f"Failed to create workflow: {response.status_code} - {response.text}",
                        "status_code": response.status_code
                    }
        except Exception as e:
            return {
                "success": False,
                "error": f"Error creating workflow: {str(e)}"
            }
    
    async def get_workflows(self) -> Dict[str, Any]:
        """Get all workflows from n8n instance"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{self.n8n_url}/api/v1/workflows",
                    headers=self.headers
                )
                
                if response.status_code == 200:
                    workflows = response.json()
                    return {
                        "success": True,
                        "workflows": workflows.get("data", []),
                        "count": len(workflows.get("data", []))
                    }
                else:
                    return {
                        "success": False,
                        "error": f"Failed to get workflows: {response.status_code} - {response.text}"
                    }
        except Exception as e:
            return {
                "success": False,
                "error": f"Error getting workflows: {str(e)}"
            }
    
    async def trigger_workflow_webhook(self, webhook_path: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Trigger a workflow via webhook"""
        try:
            webhook_url = f"{self.n8n_url}/webhook/{webhook_path}"
            
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    webhook_url,
                    json=data,
                    headers={"Content-Type": "application/json"}
                )
                
                if response.status_code == 200:
                    return {
                        "success": True,
                        "result": response.json(),
                        "message": "Workflow triggered successfully"
                    }
                else:
                    return {
                        "success": False,
                        "error": f"Failed to trigger workflow: {response.status_code} - {response.text}",
                        "status_code": response.status_code
                    }
        except Exception as e:
            return {
                "success": False,
                "error": f"Error triggering workflow: {str(e)}"
            }
    
    async def execute_workflow(self, workflow_id: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute workflow by ID with input data"""
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{self.n8n_url}/api/v1/workflows/{workflow_id}/execute",
                    headers=self.headers,
                    json={
                        "data": input_data
                    }
                )
                
                if response.status_code == 201:
                    return {
                        "success": True,
                        "execution": response.json(),
                        "message": "Workflow execution started"
                    }
                else:
                    return {
                        "success": False,
                        "error": f"Failed to execute workflow: {response.status_code} - {response.text}"
                    }
        except Exception as e:
            return {
                "success": False,
                "error": f"Error executing workflow: {str(e)}"
            }
    
    async def get_workflow_executions(self, workflow_id: str, limit: int = 10) -> Dict[str, Any]:
        """Get execution history for a workflow"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{self.n8n_url}/api/v1/executions",
                    headers=self.headers,
                    params={
                        "filter": json.dumps({"workflowId": workflow_id}),
                        "limit": limit
                    }
                )
                
                if response.status_code == 200:
                    executions = response.json()
                    return {
                        "success": True,
                        "executions": executions.get("data", []),
                        "count": len(executions.get("data", []))
                    }
                else:
                    return {
                        "success": False,
                        "error": f"Failed to get executions: {response.status_code} - {response.text}"
                    }
        except Exception as e:
            return {
                "success": False,
                "error": f"Error getting executions: {str(e)}"
            }
    
    async def health_check(self) -> Dict[str, Any]:
        """Check n8n instance health and connectivity"""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    f"{self.n8n_url}/healthz",
                    headers=self.headers
                )
                
                return {
                    "success": response.status_code == 200,
                    "status_code": response.status_code,
                    "url": self.n8n_url,
                    "api_key_configured": bool(self.api_key),
                    "response": response.text if response.status_code != 200 else "Healthy"
                }
        except Exception as e:
            return {
                "success": False,
                "error": f"Health check failed: {str(e)}",
                "url": self.n8n_url
            }