"""Resource payloads carry published state; anonymous callers never get a draft by id."""
import os
from pathlib import Path
import subprocess
import sys


def test_resource_payloads_carry_published_state():
    root = Path(__file__).parents[1]
    env = dict(os.environ, PYTHONPATH=str(root / "backend"),
               DATABASE_URL="postgresql://test:test@example.invalid/test?sslmode=require",
               AUTO_CREATE_TABLES="false", OPENAI_API_KEY="", N8N_API_KEY="",
               SUPABASE_URL="https://example.supabase.co",
               SUPABASE_SERVICE_KEY="sb_secret_test", JWT_SECRET_KEY="test-not-production")
    script = '''
import uuid
from datetime import datetime, timezone
from unittest.mock import MagicMock
from fastapi.testclient import TestClient
from models import Resource
from server import app
from database import get_db
from routes.admin import admin_guard

async def admin():
    return MagicMock()

draft = Resource(id=uuid.uuid4(), title="Draft", slug="draft", published=False,
                 created_at=datetime(2026, 10, 28, tzinfo=timezone.utc))

async def database():
    async def execute(_query):
        result = MagicMock()
        result.scalars.return_value.all.return_value = [draft]
        result.scalar_one_or_none.return_value = draft
        return result
    session = MagicMock()
    session.execute = execute
    yield session

app.dependency_overrides[get_db] = database
with TestClient(app) as client:
    app.dependency_overrides[admin_guard] = admin
    listed = client.get("/api/admin/resources").json()
    assert [r["published"] for r in listed] == [False], listed
    assert client.get(f"/api/resources/{draft.id}").status_code == 404
    draft.published = True
    assert client.get(f"/api/resources/{draft.id}").json()["title"] == "Draft"
'''
    result = subprocess.run([sys.executable, "-c", script], env=env, cwd=root,
                            text=True, capture_output=True, timeout=30)
    assert result.returncode == 0, result.stderr
