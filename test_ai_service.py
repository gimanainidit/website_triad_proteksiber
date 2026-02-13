#!/usr/bin/env python3
"""
Test AI service directly to diagnose issues
"""
import asyncio
import sys
import os
sys.path.append('/app/backend')

from ai_service import AIContentGenerator

async def test_ai_service():
    try:
        print("Testing AI service...")
        ai_generator = AIContentGenerator()
        
        # Test simple content generation
        result = await ai_generator.generate_educational_material(
            prompt="Create a simple cybersecurity tip",
            material_type="guide"
        )
        
        print(f"Success: {result['success']}")
        if result['success']:
            print(f"Content length: {len(result['content'])}")
            print(f"Content preview: {result['content'][:200]}...")
        else:
            print(f"Error: {result.get('error')}")
            
    except Exception as e:
        print(f"Exception: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_ai_service())