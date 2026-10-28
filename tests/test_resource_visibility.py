"""Drafts are visible to admins only; the public listing never returns them."""
import os
from pathlib import Path
import subprocess
import sys


def test_drafts_are_hidden_from_the_public_and_listed_for_admins():
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
from sqlalchemy.dialects import postgresql
from models import Resource
from server import app
from database import get_db
from routes.admin import admin_guard

def make(title, published):
    return Resource(id=uuid.uuid4(), title=title, slug=title.lower(), published=published,
                    created_at=datetime(2026, 10, 28, tzinfo=timezone.utc))

rows = [make("Live", True), make("Draft", False)]

def matching(query):
    sql = str(query.compile(dialect=postgresql.dialect(), compile_kwargs={"literal_binds": True}))
    if "resources.published = true" in sql:
        return [r for r in rows if r.published]
    if "resources.published = false" in sql:
        return [r for r in rows if not r.published]
    return rows

async def database():
    async def execute(query):
        result = MagicMock()
        result.scalars.return_value.all.return_value = matching(query)
        return result
    session = MagicMock()
    session.execute = execute
    yield session

async def admin():
    return MagicMock()

app.dependency_overrides[get_db] = database
with TestClient(app) as client:
    for params in ({}, {"published": "false"}):
        titles = [r["title"] for r in client.get("/api/resources", params=params).json()]
        assert titles == ["Live"], (params, titles)
    assert client.get("/api/admin/resources").status_code in (401, 403)
    app.dependency_overrides[admin_guard] = admin
    listed = client.get("/api/admin/resources").json()
    assert sorted((r["title"], r["published"]) for r in listed) == [("Draft", False), ("Live", True)], listed
'''
    result = subprocess.run([sys.executable, "-c", script], env=env, cwd=root,
                            text=True, capture_output=True, timeout=30)
    assert result.returncode == 0, result.stderr
