"""create_admin.py provisions the first login; re-running resets it instead of duplicating."""
import os
from pathlib import Path
import subprocess
import sys


def test_created_admin_can_log_in_and_rerun_resets_password():
    root = Path(__file__).parents[1]
    env = dict(os.environ, PYTHONPATH=str(root / "backend"),
               DATABASE_URL="postgresql://test:test@example.invalid/test?sslmode=require",
               AUTO_CREATE_TABLES="false", OPENAI_API_KEY="", N8N_API_KEY="",
               SUPABASE_URL="https://example.supabase.co",
               SUPABASE_SERVICE_KEY="sb_secret_test", JWT_SECRET_KEY="test-not-production")
    script = '''
import asyncio
from unittest.mock import MagicMock
from fastapi.testclient import TestClient
from sqlalchemy.dialects import postgresql
from models import User
from server import app
from database import get_db
from create_admin import upsert_admin

users = []

class Session:
    async def execute(self, query):
        sql = str(query.compile(dialect=postgresql.dialect(), compile_kwargs={"literal_binds": True}))
        result = MagicMock()
        result.scalar_one_or_none.return_value = next((u for u in users if f"'{u.email}'" in sql), None)
        return result
    def add(self, obj):
        if isinstance(obj, User):
            users.append(obj)
    async def commit(self):
        pass

async def database():
    yield Session()

asyncio.run(upsert_admin(Session(), "admin@eranusasiber.my.id", "first-pass"))
asyncio.run(upsert_admin(Session(), " Admin@EranuSasiber.my.id ", "second-pass"))
assert users[0].email == "admin@eranusasiber.my.id", users[0].email
assert len(users) == 1, users

app.dependency_overrides[get_db] = database
with TestClient(app) as client:
    login = lambda pw: client.post("/api/auth/login",
                                   data={"username": "ADMIN@eranusasiber.my.id ", "password": pw})
    assert login("first-pass").status_code == 401
    ok = login("second-pass")
    assert ok.status_code == 200 and ok.json()["access_token"], ok.text
'''
    result = subprocess.run([sys.executable, "-c", script], env=env, cwd=root,
                            text=True, capture_output=True, timeout=30)
    assert result.returncode == 0, result.stderr


def test_cli_rejects_passwords_bcrypt_cannot_hash():
    root = Path(__file__).parents[1]
    env = dict(os.environ, PYTHONPATH=str(root / "backend"),
               DATABASE_URL="postgresql://test:test@example.invalid/test?sslmode=require")
    result = subprocess.run([sys.executable, "backend/create_admin.py", "admin@eranusasiber.my.id"],
                            input="x" * 73 + "\n", env=env, cwd=root, text=True,
                            capture_output=True, timeout=30)
    assert result.returncode != 0
    assert "72 bytes" in result.stderr, result.stderr
