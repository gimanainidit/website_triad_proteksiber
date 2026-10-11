from typing import Optional
import uuid

from fastapi import APIRouter, Depends, Form, File, UploadFile, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from dependencies import require_roles
from database import get_db
from models import Resource, Template, MaterialType, User, UserRole
from storage import supabase
from file_converter import FileConverter
from services.template_service import TemplateService
from services.ai_review_service import AIReviewService
from optional_features import require_ai
from services.n8n_proxy_service import N8NProxyService
from utils import create_slug, format_file_size

router = APIRouter(prefix="/admin", tags=["admin"])
admin_guard = require_roles(UserRole.ADMIN, UserRole.SUPERADMIN)
n8n_proxy = N8NProxyService()
ai_review_service = AIReviewService()


class N8NTriggerRequest(BaseModel):
    webhook_path: str
    data: dict


class N8NWorkflowCreateRequest(BaseModel):
    workflow: dict


def _parse_tags(tags: Optional[str]) -> list[str]:
    return [tag.strip() for tag in (tags or "").split(',') if tag.strip()]


@router.post("/resources/upload")
async def upload_resource(
    title: str = Form(...),
    description: str = Form(...),
    category: str = Form(...),
    tags: Optional[str] = Form(None),
    template_id: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(admin_guard),
):
    content = await file.read()
    is_valid, error = FileConverter.validate_file(content, file.filename or "", max_size_mb=15)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error)

    processed_content, final_filename, _ = FileConverter.process_file_for_storage(content, file.filename or "")
    if processed_content is None:
        raise HTTPException(status_code=400, detail=_)

    unique_filename = f"{uuid.uuid4()}-{final_filename}"
    storage_response = supabase.storage.from_("resources").upload(unique_filename, processed_content, {"content-type": "application/pdf"})
    if getattr(storage_response, 'error', None):
        raise HTTPException(status_code=400, detail=f"Storage error: {storage_response.error}")

    public_url = supabase.storage.from_("resources").get_public_url(unique_filename)

    slug = create_slug(title)
    existing = await db.execute(select(Resource).where(Resource.slug == slug))
    if existing.scalar_one_or_none():
        slug = f"{slug}-{str(uuid.uuid4())[:8]}"

    new_resource = Resource(
        title=title,
        slug=slug,
        description=description,
        category=category,
        tags=_parse_tags(tags),
        file_url=public_url,
        file_size=format_file_size(len(processed_content)),
        file_type='pdf',
        author_id=current_user.id,
        published=True,
        template_id=template_id
    )
    db.add(new_resource)
    await db.commit()
    await db.refresh(new_resource)
    return {"id": str(new_resource.id), "title": new_resource.title, "file_url": public_url}


@router.put("/resources/{resource_id}")
async def update_resource(
    resource_id: str,
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
    publish: Optional[bool] = Form(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(admin_guard),
):
    result = await db.execute(select(Resource).where(Resource.id == resource_id))
    resource = result.scalar_one_or_none()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    if title and title != resource.title:
        slug = create_slug(title)
        existing = await db.execute(select(Resource).where(Resource.slug == slug, Resource.id != resource_id))
        if existing.scalar_one_or_none():
            slug = f"{slug}-{str(uuid.uuid4())[:8]}"
        resource.slug = slug
        resource.title = title

    if description:
        resource.description = description
    if category:
        resource.category = category
    if tags is not None:
        resource.tags = _parse_tags(tags)
    if publish is not None:
        resource.published = publish

    await db.commit()
    await db.refresh(resource)
    return {"message": "Resource updated", "id": str(resource.id)}


@router.post("/resources/{resource_id}/replace")
async def replace_resource_file(
    resource_id: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(admin_guard),
):
    result = await db.execute(select(Resource).where(Resource.id == resource_id))
    resource = result.scalar_one_or_none()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    content = await file.read()
    is_valid, error = FileConverter.validate_file(content, file.filename or "", max_size_mb=15)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error)

    processed_content, final_filename, _ = FileConverter.process_file_for_storage(content, file.filename or "")
    if processed_content is None:
        raise HTTPException(status_code=400, detail=_)

    unique_filename = f"{uuid.uuid4()}-{final_filename}"
    storage_response = supabase.storage.from_("resources").upload(unique_filename, processed_content, {"content-type": "application/pdf"})
    if getattr(storage_response, 'error', None):
        raise HTTPException(status_code=400, detail=f"Storage error: {storage_response.error}")

    old_filename = resource.file_url.split('/')[-1] if resource.file_url else None
    if old_filename:
        try:
            supabase.storage.from_("resources").remove([old_filename])
        except Exception:
            pass

    resource.file_url = supabase.storage.from_("resources").get_public_url(unique_filename)
    resource.file_size = format_file_size(len(processed_content))
    resource.version = (resource.version or 1) + 1
    await db.commit()
    await db.refresh(resource)
    return {"message": "File replaced", "file_url": resource.file_url}


@router.post("/resources/{resource_id}/publish")
async def set_publish_state(
    resource_id: str,
    published: bool = Form(True),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(admin_guard),
):
    result = await db.execute(select(Resource).where(Resource.id == resource_id))
    resource = result.scalar_one_or_none()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    resource.published = published
    await db.commit()
    return {"id": str(resource.id), "published": resource.published}


@router.delete("/resources/{resource_id}")
async def delete_resource(
    resource_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(admin_guard),
):
    result = await db.execute(select(Resource).where(Resource.id == resource_id))
    resource = result.scalar_one_or_none()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    if resource.file_url:
        try:
            supabase.storage.from_("resources").remove([resource.file_url.split('/')[-1]])
        except Exception:
            pass

    await db.delete(resource)
    await db.commit()
    return {"message": "Resource deleted"}


@router.get("/templates")
async def list_templates(
    active_only: bool = True,
    material_type: Optional[MaterialType] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(admin_guard),
):
    query = select(Template)
    if active_only:
        query = query.where(Template.is_active == True)
    if material_type:
        query = query.where(Template.material_type == material_type)

    result = await db.execute(query)
    return [
        {
            "id": str(t.id),
            "name": t.name,
            "material_type": t.material_type.value,
            "file_url": t.file_url,
            "version": t.version,
        }
        for t in result.scalars().all()
    ]


@router.post("/templates")
async def upload_template(
    name: str = Form(...),
    material_type: MaterialType = Form(...),
    description: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(admin_guard),
):
    if (file_ext := file.filename.split('.')[-1].lower()) not in {'pptx'}:
        raise HTTPException(status_code=400, detail="Only PPTX templates accepted")

    content = await file.read()
    unique_filename = f"templates/{uuid.uuid4()}-{file.filename}"
    supabase.storage.from_("templates").upload(unique_filename, content, {"content-type": "application/vnd.openxmlformats-officedocument.presentationml.presentation"})
    public_url = supabase.storage.from_("templates").get_public_url(unique_filename)
    template = await TemplateService.create_template(
        name=name,
        material_type=material_type,
        description=description or "",
        file_url=public_url,
        file_name=file.filename,
        file_size=format_file_size(len(content)),
        user_id=current_user.id,
        db=db,
    )
    return {"id": str(template.id), "name": template.name, "file_url": template.file_url}


@router.delete("/templates/{template_id}")
async def delete_template(
    template_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(admin_guard),
):
    result = await db.execute(select(Template).where(Template.id == template_id))
    template = result.scalar_one_or_none()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    template.is_active = False
    await db.commit()
    return {"message": "Template archived"}


@router.post("/ai-review", dependencies=[Depends(require_ai)])
async def review_document(
    file: UploadFile = File(...),
    template_id: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(admin_guard),
):
    data = await file.read()
    text = data.decode('utf-8', errors='ignore')
    template = None
    if template_id:
        result = await db.execute(select(Template).where(Template.id == template_id))
        template = result.scalar_one_or_none()

    review = await ai_review_service.review_document(text, template.name if template else None)
    return {"review": review, "template": template.name if template else None}


@router.get("/n8n/workflows")
async def get_workflows(
    current_user: User = Depends(admin_guard),
):
    return await n8n_proxy.get_workflows()


@router.post("/n8n/trigger")
async def trigger_n8n(
    payload: N8NTriggerRequest,
    current_user: User = Depends(admin_guard),
):
    return await n8n_proxy.trigger_workflow(payload.webhook_path, payload.data, str(current_user.id))


@router.post("/n8n/create")
async def create_workflow(
    payload: N8NWorkflowCreateRequest,
    current_user: User = Depends(admin_guard),
):
    return await n8n_proxy.create_workflow(payload.workflow)


@router.get("/n8n/workflows/{workflow_id}/executions")
async def get_executions(
    workflow_id: str,
    limit: int = 10,
    current_user: User = Depends(admin_guard),
):
    return await n8n_proxy.get_workflow_executions(workflow_id, limit)
