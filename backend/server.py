from fastapi import FastAPI, APIRouter, Depends, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List, Optional
import os
import uuid
from pathlib import Path
from dotenv import load_dotenv

from models import Resource, Base
from database import get_db, engine

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Initialize FastAPI
app = FastAPI(title="TRIAD AI-based CMS", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase client
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

# API Router
api_router = APIRouter(prefix="/api")

@app.on_event("startup")
async def startup_db():
    """Create database tables if they don't exist"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.on_event("shutdown")
async def shutdown_db():
    await engine.dispose()

# Utility functions
def create_slug(title: str) -> str:
    """Create URL-friendly slug from title"""
    slug = title.lower().replace(" ", "-")
    # Remove special characters, keep only alphanumeric and hyphens
    slug = ''.join(c for c in slug if c.isalnum() or c == '-')
    # Remove consecutive hyphens
    while '--' in slug:
        slug = slug.replace('--', '-')
    return slug.strip('-')

def format_file_size(size_bytes: int) -> str:
    """Convert bytes to human readable format"""
    if size_bytes == 0:
        return "0 B"
    size_names = ["B", "KB", "MB", "GB"]
    i = 0
    while size_bytes >= 1024 and i < len(size_names) - 1:
        size_bytes /= 1024.0
        i += 1
    return f"{size_bytes:.1f} {size_names[i]}"

# API Endpoints
@api_router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "TRIAD CMS API is running"}

@api_router.get("/resources")
async def get_resources(
    category: Optional[str] = None,
    published: bool = True,
    db: AsyncSession = Depends(get_db)
):
    """Get all published resources, optionally filtered by category"""
    query = select(Resource).where(Resource.published == published)
    if category:
        query = query.where(Resource.category == category)
    
    query = query.order_by(Resource.created_at.desc())
    
    result = await db.execute(query)
    resources = result.scalars().all()
    
    return [
        {
            "id": str(resource.id),
            "title": resource.title,
            "slug": resource.slug,
            "description": resource.description,
            "category": resource.category,
            "tags": resource.tags,
            "file_url": resource.file_url,
            "file_size": resource.file_size,
            "file_type": resource.file_type,
            "created_at": resource.created_at.isoformat(),
            "content": resource.content
        }
        for resource in resources
    ]

@api_router.get("/resources/{resource_id}")
async def get_resource(resource_id: str, db: AsyncSession = Depends(get_db)):
    """Get a specific resource by ID"""
    result = await db.execute(select(Resource).where(Resource.id == resource_id))
    resource = result.scalar_one_or_none()
    
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    return {
        "id": str(resource.id),
        "title": resource.title,
        "slug": resource.slug,
        "description": resource.description,
        "category": resource.category,
        "tags": resource.tags,
        "file_url": resource.file_url,
        "file_size": resource.file_size,
        "file_type": resource.file_type,
        "created_at": resource.created_at.isoformat(),
        "content": resource.content
    }

@api_router.post("/admin/resources/upload")
async def upload_resource(
    title: str = Form(...),
    description: str = Form(...),
    category: str = Form(...),
    tags: str = Form(""),  # Comma-separated tags
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """Upload a new resource file to Supabase Storage"""
    
    # Validate file type
    allowed_types = ['pdf', 'pptx', 'ppt', 'docx', 'doc']
    file_extension = file.filename.split('.')[-1].lower() if file.filename else ''
    
    if file_extension not in allowed_types:
        raise HTTPException(
            status_code=400, 
            detail=f"File type '{file_extension}' not allowed. Allowed types: {allowed_types}"
        )
    
    try:
        # Create unique filename
        unique_filename = f"{uuid.uuid4()}-{file.filename}"
        
        # Read file content
        file_content = await file.read()
        
        # Upload to Supabase Storage
        storage_response = supabase.storage.from_("resources").upload(
            unique_filename, 
            file_content,
            {"content-type": file.content_type}
        )
        
        if hasattr(storage_response, 'error') and storage_response.error:
            raise HTTPException(status_code=400, detail=f"Storage error: {storage_response.error}")
        
        # Get public URL
        public_url = supabase.storage.from_("resources").get_public_url(unique_filename)
        
        # Create database record
        slug = create_slug(title)
        
        # Handle duplicate slugs
        existing_resource = await db.execute(select(Resource).where(Resource.slug == slug))
        if existing_resource.scalar_one_or_none():
            slug = f"{slug}-{str(uuid.uuid4())[:8]}"
        
        # Process tags
        tag_list = [tag.strip() for tag in tags.split(',') if tag.strip()] if tags else []
        
        new_resource = Resource(
            title=title,
            slug=slug,
            description=description,
            category=category,
            tags=tag_list,
            file_url=public_url,
            file_size=format_file_size(len(file_content)),
            file_type=file_extension,
            author_id=uuid.uuid4(),  # For now, use a dummy UUID
            published=True
        )
        
        db.add(new_resource)
        await db.commit()
        await db.refresh(new_resource)
        
        return {
            "id": str(new_resource.id),
            "title": new_resource.title,
            "message": "Resource uploaded successfully",
            "file_url": public_url
        }
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@api_router.delete("/admin/resources/{resource_id}")
async def delete_resource(resource_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a resource"""
    result = await db.execute(select(Resource).where(Resource.id == resource_id))
    resource = result.scalar_one_or_none()
    
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    # Delete from Supabase Storage
    try:
        if resource.file_url:
            # Extract filename from URL
            filename = resource.file_url.split('/')[-1]
            supabase.storage.from_("resources").remove([filename])
    except Exception as e:
        print(f"Storage deletion warning: {e}")
    
    # Delete from database
    await db.delete(resource)
    await db.commit()
    
    return {"message": "Resource deleted successfully"}

@api_router.get("/categories")
async def get_categories(db: AsyncSession = Depends(get_db)):
    """Get all available categories"""
    result = await db.execute(
        select(Resource.category).distinct().where(Resource.published == True)
    )
    categories = [row[0] for row in result.all() if row[0]]
    return {"categories": categories}

# Include API router
app.include_router(api_router)

# Health check endpoint at root
@app.get("/")
async def root():
    return {"message": "TRIAD AI-based CMS API", "version": "1.0.0"}