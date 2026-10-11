"""Exercise full application startup with optional keys explicitly absent."""
import os
from pathlib import Path
import subprocess
import sys


def test_cms_starts_and_optional_routes_fail_clearly_without_keys():
    root = Path(__file__).parents[1]
    env = dict(os.environ, PYTHONPATH=str(root / "backend"),
               DATABASE_URL="postgresql://test:test@example.invalid/test?sslmode=require",
               AUTO_CREATE_TABLES="false", OPENAI_API_KEY="", N8N_API_KEY="",
               N8N_API_URL="http://example.invalid", SUPABASE_URL="https://example.supabase.co",
               SUPABASE_SERVICE_KEY="sb_secret_test", JWT_SECRET_KEY="test-not-production")
    script = '''
from fastapi.testclient import TestClient
from unittest.mock import MagicMock
from server import app, ai_guard
from routes.admin import admin_guard
from database import get_db

async def admin():
    return MagicMock()

async def database():
    yield MagicMock()

app.dependency_overrides[ai_guard] = admin
app.dependency_overrides[admin_guard] = admin
app.dependency_overrides[get_db] = database
with TestClient(app) as client:
    response = client.get('/api/health')
    assert response.status_code == 200
    assert response.json()['features'] == {'ai_configured': False, 'n8n_configured': False}
    for path, method, kwargs in [
        ('/api/n8n/health', 'get', {}),
        ('/api/admin/n8n/workflows', 'get', {}),
        ('/api/admin/n8n/trigger', 'post', {'json': {'webhook_path': 'test', 'data': {}}}),
        ('/api/ai/generate-content', 'post', {}),
        ('/api/ai/generate-from-resource/test', 'post', {}),
        ('/api/ai/create-quiz/test', 'post', {}),
        ('/api/admin/ai-review', 'post', {}),
    ]:
        response = getattr(client, method)(path, **kwargs)
        assert response.status_code == 503, (path, response.status_code, response.text)
        assert 'belum diaktifkan' in response.json()['detail']
    app.dependency_overrides.pop(admin_guard)
    assert client.get('/api/admin/n8n/workflows').status_code in (401, 403)
'''
    result = subprocess.run([sys.executable, "-c", script], env=env, cwd=root,
                            text=True, capture_output=True, timeout=30)
    assert result.returncode == 0, result.stderr
