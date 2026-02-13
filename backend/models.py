from sqlalchemy import Column, String, Text, DateTime, Boolean, Integer
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.sql import func
from sqlalchemy.orm import declarative_base
import uuid

Base = declarative_base()

def generate_uuid():
    return str(uuid.uuid4())


class Resource(Base):
    __tablename__ = 'resources'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    title = Column(Text, nullable=False, index=True)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(Text)
    content = Column(Text)  # AI-generated content
    tags = Column(ARRAY(String))  # Array of tags for categories
    file_url = Column(Text)  # Link to file in Supabase Storage
    file_size = Column(String(50))  # File size like "2.4 MB"
    file_type = Column(String(10))  # pdf, pptx, etc
    category = Column(String(100), index=True)  # Panduan, Whitepaper, Checklist
    author_id = Column(UUID(as_uuid=True))  # Reference to auth.users
    published = Column(Boolean, default=False, index=True)
    
    # Future: For AI embeddings (pgvector extension)
    # embedding = Column(Vector(1536))  # Will be added in Sprint 2