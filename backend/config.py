"""Environment-backed backend configuration, shared by auth and storage."""
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")

class Settings:
    JWT_ALGORITHM = "HS256"

    @property
    def JWT_EXPIRE_MINUTES(self):
        return int(os.environ.get("JWT_EXPIRE_MINUTES", "60"))

    def __getattr__(self, name):
        if name not in {"SUPABASE_URL", "SUPABASE_SERVICE_KEY", "JWT_SECRET_KEY"}:
            raise AttributeError(name)
        value = os.environ.get(name)
        if not value:
            raise RuntimeError(f"Required environment variable {name} is missing")
        return value

settings = Settings()
