from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models import Template, MaterialType


class TemplateService:
    @staticmethod
    async def create_template(
        name: str,
        material_type: MaterialType,
        description: str,
        file_url: str,
        file_name: str,
        file_size: str,
        user_id: UUID,
        db: AsyncSession
    ) -> Template:
        template = Template(
            name=name,
            material_type=material_type,
            description=description,
            file_url=file_url,
            file_name=file_name,
            file_size=file_size,
            created_by=user_id,
        )
        db.add(template)
        await db.commit()
        await db.refresh(template)
        return template

    @staticmethod
    async def list_templates(db: AsyncSession, active_only: bool = True):
        query = select(Template)
        if active_only:
            query = query.where(Template.is_active == True)
        result = await db.execute(query)
        return result.scalars().all()

    @staticmethod
    async def get_template(template_id: UUID, db: AsyncSession) -> Optional[Template]:
        result = await db.execute(select(Template).where(Template.id == template_id))
        return result.scalar_one_or_none()
