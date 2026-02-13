#!/usr/bin/env python3
"""
Simple AI endpoint test to isolate timeout issues
"""
import requests
import json

BASE_URL = "https://website-sprint-dev.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

def test_simple_ai_generation():
    """Test AI generation with minimal data"""
    print("Testing simple AI generation...")
    
    try:
        form_data = {
            'prompt': 'Create a short cybersecurity tip',
            'material_type': 'guide',
            'title': 'Simple Test',
            'description': 'Test',
            'category': 'Test',
            'save_as_resource': 'false'  # Don't save to avoid DB issues
        }
        
        print("Sending request...")
        response = requests.post(
            f"{API_BASE}/ai/generate-content",
            data=form_data,
            timeout=120  # Longer timeout
        )
        
        print(f"Status code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print("Success!")
            print(f"Content length: {len(data.get('content', ''))}")
            return True
        else:
            print(f"Error: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("Request timed out")
        return False
    except Exception as e:
        print(f"Exception: {str(e)}")
        return False

if __name__ == "__main__":
    test_simple_ai_generation()