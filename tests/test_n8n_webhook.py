"""The n8n content webhook needs a shared secret and only ever creates drafts."""
import os
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).parents[1]
SCRIPT = '''
import sys
from unittest.mock import MagicMock
from fastapi.testclient import TestClient
from server import app
from database import get_db

added = []

async def database():
    async def execute(query):
        result = MagicMock()
        result.scalar_one_or_none.return_value = None
        return result
    async def noop(*args):
        pass
    session = MagicMock()
    session.execute = execute
    session.add = added.append
    session.commit = session.refresh = session.rollback = noop
    yield session

app.dependency_overrides[get_db] = database
form = {"title": "Phishing 101", "content": "isi materi"}
with TestClient(app) as client:
    for header in ({}, {"X-N8N-Secret": "wrong"}, {"X-N8N-Secret": ""}, {"X-N8N-Secret": sys.argv[1][:-1]}):
        response = client.post("/api/n8n/webhook/content", data=form, headers=header)
        print(header, response.status_code, len(added))
    response = client.post("/api/n8n/webhook/content", data=form,
                           headers={"X-N8N-Secret": sys.argv[1]} if sys.argv[1] else {})
    print("valid", response.status_code, len(added))
    if added:
        row = added[0]
        fits = all(len(getattr(row, c.name) or "") <= c.type.length
                   for c in row.__table__.columns if getattr(c.type, "length", None))
        print("published", row.published, "author", row.author_id, "fits", fits)
'''


def post(secret_env, sent_secret):
    env = dict(os.environ, PYTHONPATH=str(ROOT / "backend"),
               DATABASE_URL="postgresql://test:test@example.invalid/test?sslmode=require",
               AUTO_CREATE_TABLES="false", OPENAI_API_KEY="", N8N_API_KEY="",
               SUPABASE_URL="https://example.supabase.co",
               SUPABASE_SERVICE_KEY="sb_secret_test", JWT_SECRET_KEY="test-not-production",
               N8N_WEBHOOK_SECRET=secret_env)
    result = subprocess.run([sys.executable, "-c", SCRIPT, sent_secret], env=env, cwd=ROOT,
                            text=True, capture_output=True, timeout=30)
    assert result.returncode == 0, result.stderr
    return result.stdout.splitlines()


def test_webhook_rejects_requests_without_the_shared_secret():
    lines = post("s3cret-shared-value", "s3cret-shared-value")
    assert lines[:4] == ["{} 401 0", "{'X-N8N-Secret': 'wrong'} 401 0", "{'X-N8N-Secret': ''} 401 0",
                         "{'X-N8N-Secret': 's3cret-shared-valu'} 401 0"]


def test_webhook_content_is_saved_as_an_unowned_draft():
    lines = post("s3cret-shared-value", "s3cret-shared-value")
    assert lines[4:] == ["valid 200 1", "published False author None fits True"]


def test_webhook_is_disabled_when_no_secret_is_configured():
    lines = post("", "")
    assert lines == ["{} 503 0", "{'X-N8N-Secret': 'wrong'} 503 0", "{'X-N8N-Secret': ''} 503 0",
                     "{'X-N8N-Secret': ''} 503 0", "valid 503 0"]
