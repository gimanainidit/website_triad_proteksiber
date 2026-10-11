"""Availability checks for integrations that are optional for CMS startup."""
import os
from fastapi import HTTPException


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
