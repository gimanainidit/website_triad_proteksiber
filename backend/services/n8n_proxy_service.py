from datetime import datetime
from typing import Any, Dict

from n8n_service import N8NIntegration

class N8NProxyService:
    def __init__(self):
        self.integration = N8NIntegration()

    async def trigger_workflow(self, webhook_path: str, data: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        # Simple proxy that forwards to n8n
        payload = {"user_id": user_id, "data": data}
        return await self.integration.trigger_workflow_webhook(webhook_path, payload)

    async def create_workflow(self, workflow_data: Dict[str, Any]) -> Dict[str, Any]:
        return await self.integration.create_telegram_content_workflow()

    async def get_workflows(self) -> Dict[str, Any]:
        return await self.integration.get_workflows()

    async def get_workflow_executions(self, workflow_id: str, limit: int = 10) -> Dict[str, Any]:
        return await self.integration.get_workflow_executions(workflow_id, limit)
