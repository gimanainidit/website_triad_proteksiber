from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
import os
from pathlib import Path
from dotenv import load_dotenv
from models import Base
from sqlalchemy.engine import make_url
import ssl
import certifi

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Database configuration
DATABASE_URL = os.environ.get('DATABASE_URL')
if not DATABASE_URL:
    raise RuntimeError("Required environment variable DATABASE_URL is missing")
url = make_url(DATABASE_URL).set(drivername="postgresql+asyncpg")
# asyncpg receives TLS through connect_args, not libpq URL parameters.
sslmode = url.query.get("sslmode", "verify-full")
if sslmode not in {"require", "verify-ca", "verify-full"}:
    raise ValueError("DATABASE_URL must use TLS: require, verify-ca or verify-full")
ssl_context = ssl.create_default_context(cafile=os.environ.get("PGSSLROOTCERT") or certifi.where())
ASYNC_DATABASE_URL = url.difference_update_query(["sslmode", "channel_binding"])

# Create async engine with proper configuration for Supabase Transaction Pooler
engine = create_async_engine(
    ASYNC_DATABASE_URL,
    pool_size=10,
    max_overflow=5,
    pool_timeout=30,
    pool_recycle=1800,
    pool_pre_ping=False,
    echo=False,
    connect_args={
        "ssl": ssl_context,
        "statement_cache_size": 0,  # CRITICAL: Required for transaction pooler
        "command_timeout": 30,
    }
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()