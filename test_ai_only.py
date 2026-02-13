#!/usr/bin/env python3
"""
Test only AI generation features with proper timeouts
"""
import requests
import json
import uuid
import tempfile
import os
from pathlib import Path

# Get backend URL from frontend .env file
def get_backend_url():
    frontend_env_path = Path("/app/frontend/.env")
    if frontend_env_path.exists():
        with open(frontend_env_path, 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    return "http://localhost:8001"

BASE_URL = get_backend_url()
API_BASE = f"{BASE_URL}/api"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_success(message):
    print(f"{Colors.GREEN}✅ {message}{Colors.ENDC}")

def print_error(message):
    print(f"{Colors.RED}❌ {message}{Colors.ENDC}")

def print_info(message):
    print(f"{Colors.BLUE}ℹ️  {message}{Colors.ENDC}")

def test_ai_generation_types():
    """Test GET /api/ai/generation-types endpoint"""
    print(f"\n{Colors.BLUE}{Colors.BOLD}Testing AI Generation Types{Colors.ENDC}")
    
    try:
        response = requests.get(f"{API_BASE}/ai/generation-types", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print_success("AI generation types endpoint working!")
            return True
        else:
            print_error(f"Failed with status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print_error(f"Request failed: {str(e)}")
        return False

def test_ai_content_generation():
    """Test POST /api/ai/generate-content endpoint"""
    print(f"\n{Colors.BLUE}{Colors.BOLD}Testing AI Content Generation{Colors.ENDC}")
    
    try:
        form_data = {
            'prompt': 'Create a brief cybersecurity guide on password security',
            'material_type': 'guide',
            'title': 'Password Security Guide',
            'description': 'AI-generated guide on password security',
            'category': 'Security',
            'tags': 'password, security, guide',
            'save_as_resource': 'true'
        }
        
        print_info("Generating AI content (this may take 30-60 seconds)...")
        response = requests.post(
            f"{API_BASE}/ai/generate-content",
            data=form_data,
            timeout=120
        )
        
        if response.status_code == 200:
            data = response.json()
            print_success("AI content generation successful!")
            print_info(f"Generated content length: {len(data.get('content', ''))}")
            print_info(f"Word count: {data.get('word_count', 'N/A')}")
            print_info(f"Resource ID: {data.get('resource_id', 'N/A')}")
            return True, data.get('resource_id')
        else:
            print_error(f"Failed with status {response.status_code}: {response.text}")
            return False, None
            
    except Exception as e:
        print_error(f"Request failed: {str(e)}")
        return False, None

def test_ai_generate_from_resource(resource_id):
    """Test POST /api/ai/generate-from-resource/{resource_id} endpoint"""
    print(f"\n{Colors.BLUE}{Colors.BOLD}Testing AI Generate from Resource{Colors.ENDC}")
    
    try:
        form_data = {
            'generation_type': 'summary',
            'specific_prompt': 'Create a concise summary of this content',
            'save_as_new_resource': 'true',
            'new_title': 'Summary - Password Security',
            'new_category': 'Summary'
        }
        
        print_info("Generating content from existing resource...")
        response = requests.post(
            f"{API_BASE}/ai/generate-from-resource/{resource_id}",
            data=form_data,
            timeout=120
        )
        
        if response.status_code == 200:
            data = response.json()
            print_success("AI generation from resource successful!")
            print_info(f"Generated content length: {len(data.get('content', ''))}")
            print_info(f"New resource ID: {data.get('new_resource_id', 'N/A')}")
            return True, data.get('new_resource_id')
        else:
            print_error(f"Failed with status {response.status_code}: {response.text}")
            return False, None
            
    except Exception as e:
        print_error(f"Request failed: {str(e)}")
        return False, None

def test_ai_create_quiz(resource_id):
    """Test POST /api/ai/create-quiz/{resource_id} endpoint"""
    print(f"\n{Colors.BLUE}{Colors.BOLD}Testing AI Quiz Creation{Colors.ENDC}")
    
    try:
        form_data = {
            'question_count': '3',
            'difficulty': 'beginner',
            'save_as_resource': 'true'
        }
        
        print_info("Creating quiz from resource...")
        response = requests.post(
            f"{API_BASE}/ai/create-quiz/{resource_id}",
            data=form_data,
            timeout=120
        )
        
        if response.status_code == 200:
            data = response.json()
            print_success("AI quiz creation successful!")
            print_info(f"Quiz content length: {len(data.get('quiz_content', ''))}")
            print_info(f"Question count: {data.get('question_count')}")
            print_info(f"Quiz resource ID: {data.get('quiz_resource_id', 'N/A')}")
            return True, data.get('quiz_resource_id')
        else:
            print_error(f"Failed with status {response.status_code}: {response.text}")
            return False, None
            
    except Exception as e:
        print_error(f"Request failed: {str(e)}")
        return False, None

def test_error_handling():
    """Test error handling with invalid resource ID"""
    print(f"\n{Colors.BLUE}{Colors.BOLD}Testing Error Handling{Colors.ENDC}")
    
    fake_id = str(uuid.uuid4())
    
    try:
        form_data = {
            'generation_type': 'summary',
            'specific_prompt': 'Create a summary'
        }
        
        response = requests.post(
            f"{API_BASE}/ai/generate-from-resource/{fake_id}",
            data=form_data,
            timeout=30
        )
        
        if response.status_code == 404:
            print_success("Error handling working - 404 for non-existent resource")
            return True
        else:
            print_error(f"Expected 404, got {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Request failed: {str(e)}")
        return False

def cleanup_resources(resource_ids):
    """Clean up test resources"""
    print(f"\n{Colors.BLUE}{Colors.BOLD}Cleaning up test resources{Colors.ENDC}")
    
    for resource_id in resource_ids:
        if resource_id:
            try:
                response = requests.delete(f"{API_BASE}/admin/resources/{resource_id}", timeout=10)
                if response.status_code == 200:
                    print_success(f"Deleted resource {resource_id}")
                else:
                    print_error(f"Failed to delete {resource_id}: {response.status_code}")
            except Exception as e:
                print_error(f"Error deleting {resource_id}: {str(e)}")

def main():
    print(f"{Colors.BOLD}{Colors.BLUE}")
    print("=" * 60)
    print("TRIAD AI Generation Features Test")
    print("=" * 60)
    print(f"{Colors.ENDC}")
    
    test_results = {}
    resource_ids = []
    
    # Test 1: AI Generation Types
    test_results['generation_types'] = test_ai_generation_types()
    
    # Test 2: AI Content Generation
    content_success, content_resource_id = test_ai_content_generation()
    test_results['content_generation'] = content_success
    if content_resource_id:
        resource_ids.append(content_resource_id)
    
    # Test 3: Generate from Resource (only if we have a resource)
    if content_resource_id:
        summary_success, summary_resource_id = test_ai_generate_from_resource(content_resource_id)
        test_results['generate_from_resource'] = summary_success
        if summary_resource_id:
            resource_ids.append(summary_resource_id)
    
    # Test 4: Quiz Creation (only if we have a resource)
    if content_resource_id:
        quiz_success, quiz_resource_id = test_ai_create_quiz(content_resource_id)
        test_results['quiz_creation'] = quiz_success
        if quiz_resource_id:
            resource_ids.append(quiz_resource_id)
    
    # Test 5: Error Handling
    test_results['error_handling'] = test_error_handling()
    
    # Cleanup
    cleanup_resources(resource_ids)
    
    # Summary
    print(f"\n{Colors.BOLD}{Colors.BLUE}")
    print("=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    print(f"{Colors.ENDC}")
    
    passed = sum(1 for result in test_results.values() if result)
    total = len(test_results)
    
    for test_name, result in test_results.items():
        if result:
            print_success(f"{test_name}: PASSED")
        else:
            print_error(f"{test_name}: FAILED")
    
    print(f"\n{Colors.BOLD}Results: {passed}/{total} tests passed{Colors.ENDC}")
    
    if passed == total:
        print_success("🎉 All AI generation tests passed!")
        return True
    else:
        print_error(f"❌ {total - passed} tests failed")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)