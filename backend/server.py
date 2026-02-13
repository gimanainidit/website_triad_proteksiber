# Load environment variables first
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, Depends, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List, Optional
import os
import uuid

from models import Resource, Base
from database import get_db, engine
from file_converter import FileConverter
from ai_service import AIContentGenerator
from n8n_service import N8NIntegration

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

# Initialize services
ai_generator = AIContentGenerator()

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
    """Upload a new resource file to Supabase Storage with PPTX to PDF conversion"""
    
    try:
        # Read file content
        file_content = await file.read()
        
        # Validate file (15MB limit, only PDF and PPTX)
        is_valid, error_msg = FileConverter.validate_file(
            file_content, 
            file.filename or "", 
            max_size_mb=15
        )
        
        if not is_valid:
            raise HTTPException(status_code=400, detail=error_msg)
        
        # Process file (convert PPTX to PDF if needed)
        processed_content, final_filename, final_file_type = FileConverter.process_file_for_storage(
            file_content, 
            file.filename or ""
        )
        
        if processed_content is None:
            raise HTTPException(status_code=400, detail=final_file_type)  # Error message is in final_file_type
        
        # Create unique filename for storage
        unique_filename = f"{uuid.uuid4()}-{final_filename}"
        
        # Upload to Supabase Storage
        storage_response = supabase.storage.from_("resources").upload(
            unique_filename, 
            processed_content,
            {"content-type": "application/pdf"}  # Always PDF after processing
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
        
        # Determine if file was converted
        original_extension = file.filename.lower().split('.')[-1] if file.filename else ''
        conversion_note = ""
        if original_extension == 'pptx':
            conversion_note = " (converted from PPTX)"
        
        new_resource = Resource(
            title=title,
            slug=slug,
            description=description + conversion_note,
            category=category,
            tags=tag_list,
            file_url=public_url,
            file_size=format_file_size(len(processed_content)),
            file_type='pdf',  # Always PDF after processing
            author_id=uuid.uuid4(),  # For now, use a dummy UUID
            published=True
        )
        
        db.add(new_resource)
        await db.commit()
        await db.refresh(new_resource)
        
        success_msg = "Resource uploaded successfully"
        if original_extension == 'pptx':
            success_msg += " (PPTX converted to PDF)"
        
        return {
            "id": str(new_resource.id),
            "title": new_resource.title,
            "message": success_msg,
            "file_url": public_url,
            "converted_from": original_extension if original_extension == 'pptx' else None
        }
        
    except HTTPException:
        raise
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

# AI Generation Endpoints
@api_router.post("/ai/generate-content")
async def generate_ai_content(
    prompt: str = Form(...),
    material_type: str = Form("guide"),
    context: Optional[str] = Form(None),
    title: str = Form(...),
    description: str = Form(...),
    category: str = Form(...),
    tags: str = Form(""),
    save_as_resource: bool = Form(True),
    db: AsyncSession = Depends(get_db)
):
    """Generate AI content and optionally save as resource"""
    try:
        # Generate content using AI service
        result = await ai_generator.generate_educational_material(
            prompt=prompt,
            material_type=material_type,
            context=context
        )
        
        if not result["success"]:
            raise HTTPException(status_code=500, detail=f"AI generation failed: {result.get('error')}")
        
        generated_content = result["content"]
        
        # If save_as_resource is true, save to database
        resource_id = None
        if save_as_resource:
            # Create slug from title
            slug = create_slug(title)
            
            # Handle duplicate slugs
            existing_resource = await db.execute(select(Resource).where(Resource.slug == slug))
            if existing_resource.scalar_one_or_none():
                slug = f"{slug}-{str(uuid.uuid4())[:8]}"
            
            # Process tags
            tag_list = [tag.strip() for tag in tags.split(',') if tag.strip()] if tags else []
            tag_list.append(f"ai-generated")  # Add AI-generated tag
            tag_list.append(f"type:{material_type}")  # Add material type tag
            
            # Create resource record
            new_resource = Resource(
                title=title,
                slug=slug,
                description=description,
                category=category,
                tags=tag_list,
                content=generated_content,  # Store AI content in content field
                file_url=None,  # No file for AI-generated content
                file_size=f"{len(generated_content.split())} words",
                file_type='ai-content',
                author_id=uuid.uuid4(),  # For now, use dummy UUID
                published=True
            )
            
            db.add(new_resource)
            await db.commit()
            await db.refresh(new_resource)
            resource_id = str(new_resource.id)
        
        return {
            "success": True,
            "content": generated_content,
            "material_type": material_type,
            "word_count": result["word_count"],
            "session_id": result["session_id"],
            "resource_id": resource_id if save_as_resource else None,
            "message": "Content generated successfully" + (" and saved as resource" if save_as_resource else "")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Content generation failed: {str(e)}")

@api_router.post("/ai/generate-from-resource/{resource_id}")
async def generate_from_existing_resource(
    resource_id: str,
    generation_type: str = Form(...),
    specific_prompt: str = Form(...),
    save_as_new_resource: bool = Form(False),
    new_title: Optional[str] = Form(None),
    new_category: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db)
):
    """Generate new content based on existing resource"""
    try:
        # Get existing resource
        result = await db.execute(select(Resource).where(Resource.id == resource_id))
        existing_resource = result.scalar_one_or_none()
        
        if not existing_resource:
            raise HTTPException(status_code=404, detail="Resource not found")
        
        # Use content from resource (either file content or AI content)
        source_content = existing_resource.content
        if not source_content:
            raise HTTPException(status_code=400, detail="Resource has no content to generate from")
        
        # Generate new content
        result = await ai_generator.generate_from_existing_resource(
            resource_content=source_content,
            generation_type=generation_type,
            specific_prompt=specific_prompt
        )
        
        if not result["success"]:
            raise HTTPException(status_code=500, detail=f"AI generation failed: {result.get('error')}")
        
        generated_content = result["content"]
        
        # Save as new resource if requested
        new_resource_id = None
        if save_as_new_resource and new_title:
            slug = create_slug(new_title)
            
            # Handle duplicate slugs
            existing_slug = await db.execute(select(Resource).where(Resource.slug == slug))
            if existing_slug.scalar_one_or_none():
                slug = f"{slug}-{str(uuid.uuid4())[:8]}"
            
            # Create new resource
            new_resource = Resource(
                title=new_title,
                slug=slug,
                description=f"Generated from: {existing_resource.title}",
                category=new_category or existing_resource.category,
                tags=existing_resource.tags + [f"generated-from:{existing_resource.slug}", f"type:{generation_type}"],
                content=generated_content,
                file_url=None,
                file_size=f"{len(generated_content.split())} words",
                file_type='ai-content',
                author_id=uuid.uuid4(),
                published=True
            )
            
            db.add(new_resource)
            await db.commit()
            await db.refresh(new_resource)
            new_resource_id = str(new_resource.id)
        
        return {
            "success": True,
            "content": generated_content,
            "generation_type": generation_type,
            "source_resource_id": resource_id,
            "source_title": existing_resource.title,
            "new_resource_id": new_resource_id,
            "session_id": result["session_id"],
            "output_length": result["output_length"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Content generation failed: {str(e)}")

@api_router.post("/ai/create-quiz/{resource_id}")
async def create_quiz_from_resource(
    resource_id: str,
    question_count: int = Form(5),
    difficulty: str = Form("intermediate"),
    save_as_resource: bool = Form(True),
    db: AsyncSession = Depends(get_db)
):
    """Create quiz questions from existing resource"""
    try:
        # Get existing resource
        result = await db.execute(select(Resource).where(Resource.id == resource_id))
        existing_resource = result.scalar_one_or_none()
        
        if not existing_resource:
            raise HTTPException(status_code=404, detail="Resource not found")
        
        if not existing_resource.content:
            raise HTTPException(status_code=400, detail="Resource has no content to create quiz from")
        
        # Generate quiz
        quiz_result = await ai_generator.create_quiz_from_content(
            content=existing_resource.content,
            question_count=question_count,
            difficulty=difficulty
        )
        
        if not quiz_result["success"]:
            raise HTTPException(status_code=500, detail=f"Quiz generation failed: {quiz_result.get('error')}")
        
        quiz_content = quiz_result["quiz_content"]
        
        # Save as resource if requested
        quiz_resource_id = None
        if save_as_resource:
            quiz_title = f"Quiz: {existing_resource.title}"
            slug = create_slug(quiz_title)
            
            # Handle duplicate slugs
            existing_slug = await db.execute(select(Resource).where(Resource.slug == slug))
            if existing_slug.scalar_one_or_none():
                slug = f"{slug}-{str(uuid.uuid4())[:8]}"
            
            # Create quiz resource
            quiz_resource = Resource(
                title=quiz_title,
                slug=slug,
                description=f"{question_count} {difficulty} quiz questions based on {existing_resource.title}",
                category="Quiz",
                tags=existing_resource.tags + [f"quiz", f"difficulty:{difficulty}", f"questions:{question_count}"],
                content=quiz_content,
                file_url=None,
                file_size=f"{question_count} questions",
                file_type='ai-quiz',
                author_id=uuid.uuid4(),
                published=True
            )
            
            db.add(quiz_resource)
            await db.commit()
            await db.refresh(quiz_resource)
            quiz_resource_id = str(quiz_resource.id)
        
        return {
            "success": True,
            "quiz_content": quiz_content,
            "question_count": question_count,
            "difficulty": difficulty,
            "source_resource_id": resource_id,
            "quiz_resource_id": quiz_resource_id,
            "session_id": quiz_result["session_id"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Quiz generation failed: {str(e)}")

@api_router.get("/ai/generation-types")
async def get_generation_types():
    """Get available AI generation types and descriptions"""
    return {
        "material_types": {
            "guide": "Comprehensive step-by-step guides",
            "checklist": "Actionable checklists with clear items",
            "template": "Professional templates and formats",
            "whitepaper": "In-depth research and analysis papers",
            "report": "Professional reports with findings"
        },
        "generation_types": {
            "summary": "Create concise summary of content",
            "expanded_guide": "Expand into detailed guide",
            "checklist": "Convert to actionable checklist", 
            "quiz": "Generate quiz questions",
            "case_study": "Create practical case study",
            "best_practices": "Extract best practices list"
        },
        "difficulty_levels": ["beginner", "intermediate", "advanced", "expert"]
    }

# Include API router
app.include_router(api_router)

# Health check endpoint at root
@app.get("/")
async def root():
    return {"message": "TRIAD AI-based CMS API", "version": "1.0.0"}