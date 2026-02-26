import enum
from sqlalchemy import Column, String, Text, DateTime, Boolean, Integer, ForeignKey, JSON, Enum
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.sql import func
from sqlalchemy.orm import declarative_base, relationship
import uuid

Base = declarative_base()


class UserRole(str, enum.Enum):
    SUPERADMIN = "superadmin"
    ADMIN = "admin"
    VIEWER = "viewer"


class MaterialType(str, enum.Enum):
    GUIDE = "guide"
    CHECKLIST = "checklist"
    TEMPLATE = "template"
    WHITEPAPER = "whitepaper"
    REPORT = "report"


class User(Base):
    __tablename__ = 'users'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255))
    role = Column(Enum(UserRole), default=UserRole.VIEWER)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class AdminSession(Base):
    __tablename__ = 'admin_sessions'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    token = Column(String(512), unique=True, nullable=False, index=True)
    token_expires_at = Column(DateTime(timezone=True), nullable=False)
    ip_address = Column(String(50))
    user_agent = Column(String(255))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Template(Base):
    __tablename__ = 'templates'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    material_type = Column(Enum(MaterialType), nullable=False)
    description = Column(Text)
    file_url = Column(Text, nullable=False)
    file_name = Column(String(255), nullable=False)
    file_size = Column(String(50))
    version = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class AuditLog(Base):
    __tablename__ = 'audit_logs'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    action = Column(String(100), nullable=False)
    resource_type = Column(String(50))
    resource_id = Column(UUID(as_uuid=True))
    details = Column(JSON)
    ip_address = Column(String(50))
    user_agent = Column(String(255))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Resource(Base):
    __tablename__ = 'resources'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    title = Column(Text, nullable=False, index=True)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(Text)
    content = Column(Text)
    tags = Column(ARRAY(String))
    file_url = Column(Text)
    file_size = Column(String(50))
    file_type = Column(String(10))
    category = Column(String(100), index=True)
    author_id = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    published = Column(Boolean, default=False, index=True)
    template_id = Column(UUID(as_uuid=True), ForeignKey('templates.id'))
    ai_review_score = Column(Integer)
    ai_review_result = Column(JSON)
    version = Column(Integer, default=1)
    is_published = Column(Boolean, default=True)

    template = relationship('Template', backref='resources')
