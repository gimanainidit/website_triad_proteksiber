"""Availability checks for integrations that are optional for CMS startup."""
import hmac
import os
from fastapi import Header, HTTPException


def ai_configured():
    return bool(os.environ.get("OPENAI_API_KEY", "").strip())


def n8n_configured():
    return all(os.environ.get(name, "").strip() for name in ("N8N_API_URL", "N8N_API_KEY"))


def require_ai():
    if not ai_configured():
        raise HTTPException(status_code=503, detail="AI belum diaktifkan; OPENAI_API_KEY belum diisi.")


def require_n8n():
    if not n8n_configured():
        raise HTTPException(status_code=503, detail="Otomatisasi n8n belum diaktifkan; URL/API key belum diisi.")


def require_n8n_webhook_secret(x_n8n_secret: str = Header("")):
    expected = os.environ.get("N8N_WEBHOOK_SECRET", "").strip()
    if not expected:
        raise HTTPException(status_code=503, detail="Webhook n8n belum diaktifkan; N8N_WEBHOOK_SECRET belum diisi.")
    if not hmac.compare_digest(x_n8n_secret.encode(), expected.encode()):
        raise HTTPException(status_code=401, detail="Secret webhook n8n tidak valid.")
