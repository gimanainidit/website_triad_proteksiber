from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, Depends, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
import os
import uuid

from models import Resource, Base, UserRole, User
from database import get_db, engine
from ai_service import AIContentGenerator
from n8n_service import N8NIntegration
from optional_features import ai_configured, n8n_configured, require_ai, require_n8n
from storage import supabase
from utils import create_slug, format_file_size
from dependencies import require_roles
from routes.auth import router as auth_router
from routes.admin import router as admin_router

# Initialize FastAPI
app = FastAPI(title="TRIAD AI-based CMS", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in os.environ.get("CORS_ORIGINS", "").split(",") if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Router
api_router = APIRouter(prefix="/api")

# Initialize services
ai_generator = AIContentGenerator() if ai_configured() else None
ai_guard = require_roles(UserRole.ADMIN, UserRole.SUPERADMIN)
n8n_integration = N8NIntegration() if n8n_configured() else None

@app.on_event("startup")
async def startup_db():
    """Create database tables if they don't exist"""
    if os.environ.get("AUTO_CREATE_TABLES", "true").lower() == "true":
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

@app.on_event("shutdown")
async def shutdown_db():
    if ai_generator is not None:
        await ai_generator.close()
    await engine.dispose()

def resource_payload(resource: Resource) -> dict:
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
        "content": resource.content,
        "published": resource.published,
    }


# API Endpoints
@api_router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "TRIAD CMS API is running",
            "features": {"ai_configured": ai_generator is not None, "n8n_configured": n8n_integration is not None}}

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
    
    return [resource_payload(resource) for resource in resources]

@api_router.get("/resources/{resource_id}")
async def get_resource(resource_id: str, db: AsyncSession = Depends(get_db)):
    """Get a specific resource by ID"""
    result = await db.execute(select(Resource).where(Resource.id == resource_id))
    resource = result.scalar_one_or_none()
    
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    return resource_payload(resource)

@api_router.get("/categories")
async def get_categories(db: AsyncSession = Depends(get_db)):
    """Get all available categories"""
    result = await db.execute(
        select(Resource.category).distinct().where(Resource.published == True)
    )
    categories = [row[0] for row in result.all() if row[0]]
    return {"categories": categories}

# AI Generation Endpoints
@api_router.post("/ai/generate-content", dependencies=[Depends(require_ai)])
async def generate_ai_content(
    prompt: str = Form(...),
    material_type: str = Form("guide"),
    context: Optional[str] = Form(None),
    title: str = Form(...),
    description: str = Form(...),
    category: str = Form(...),
    tags: str = Form(""),
    save_as_resource: bool = Form(True),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(ai_guard)
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

@api_router.post("/ai/generate-from-resource/{resource_id}", dependencies=[Depends(require_ai)])
async def generate_from_existing_resource(
    resource_id: str,
    generation_type: str = Form(...),
    specific_prompt: str = Form(...),
    save_as_new_resource: bool = Form(False),
    new_title: Optional[str] = Form(None),
    new_category: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(ai_guard)
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

@api_router.post("/ai/create-quiz/{resource_id}", dependencies=[Depends(require_ai)])
async def create_quiz_from_resource(
    resource_id: str,
    question_count: int = Form(5),
    difficulty: str = Form("intermediate"),
    save_as_resource: bool = Form(True),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(ai_guard)
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

# N8N Workflow Integration Endpoints
@api_router.post("/n8n/webhook/content")
async def n8n_content_webhook(
    title: str = Form(...),
    content: str = Form(...),
    category: str = Form("Telegram Generated"),
    source: str = Form("telegram-bot"),
    material_type: str = Form("guide"),
    db: AsyncSession = Depends(get_db)
):
    """Webhook endpoint for n8n to upload generated content"""
    try:
        # Create slug from title
        slug = create_slug(title)
        
        # Handle duplicate slugs
        existing_resource = await db.execute(select(Resource).where(Resource.slug == slug))
        if existing_resource.scalar_one_or_none():
            slug = f"{slug}-{str(uuid.uuid4())[:8]}"
        
        # Create tags for n8n generated content
        tags = [
            "n8n-generated", 
            f"source:{source}",
            f"type:{material_type}",
            "telegram-bot"
        ]
        
        # Create resource record
        new_resource = Resource(
            title=title,
            slug=slug,
            description=f"Generated via {source} using n8n workflow automation",
            category=category,
            tags=tags,
            content=content,
            file_url=None,
            file_size=f"{len(content.split())} words",
            file_type='n8n-content',
            author_id=uuid.uuid4(),
            published=True
        )
        
        db.add(new_resource)
        await db.commit()
        await db.refresh(new_resource)
        
        return {
            "success": True,
            "resource_id": str(new_resource.id),
            "title": new_resource.title,
            "message": "Content uploaded successfully via n8n webhook",
            "word_count": len(content.split()),
            "source": source
        }
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"n8n webhook failed: {str(e)}")

@api_router.get("/n8n/health", dependencies=[Depends(require_n8n)])
async def n8n_health_check():
    """Check n8n instance health and connectivity"""
    try:
        result = await n8n_integration.health_check()
        return result
    except Exception as e:
        return {
            "success": False,
            "error": f"n8n health check failed: {str(e)}"
        }

api_router.include_router(auth_router)

api_router.include_router(auth_router)
api_router.include_router(admin_router)

# Include API router
app.include_router(api_router)

# Health check endpoint at root
@app.get("/")
async def root():
    return {"message": "TRIAD AI-based CMS API", "version": "1.0.0"}
