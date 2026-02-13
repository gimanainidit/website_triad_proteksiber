#!/usr/bin/env python3
"""
Setup Supabase Storage bucket for TRIAD CMS
"""
import os
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client

def main():
    # Load environment variables
    load_dotenv('.env')
    
    supabase_url = os.environ.get('SUPABASE_URL')
    supabase_key = os.environ.get('SUPABASE_SERVICE_KEY')
    
    if not supabase_url or not supabase_key:
        print("Error: Supabase credentials not found in .env")
        return
    
    print(f"Connecting to Supabase: {supabase_url}")
    
    try:
        supabase = create_client(supabase_url, supabase_key)
        
        # List existing buckets
        buckets = supabase.storage.list_buckets()
        print("Existing buckets:")
        for bucket in buckets:
            print(f"- {bucket.name} (public: {bucket.public})")
            
        # Check if resources bucket exists
        resources_bucket = any(bucket.name == 'resources' for bucket in buckets)
        
        if not resources_bucket:
            print("\nCreating 'resources' bucket...")
            result = supabase.storage.create_bucket('resources', {'public': True})
            print(f"Bucket creation result: {result}")
        else:
            print("\n'resources' bucket already exists")
            
        print("\nStorage setup complete!")
        
    except Exception as e:
        print(f"Error: {e}")
        print("Make sure your Supabase project is running and credentials are correct")

if __name__ == "__main__":
    main()