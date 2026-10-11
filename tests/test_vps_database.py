"""Validate provider URL compatibility without contacting a database."""
import importlib.util
from pathlib import Path
import pytest


def load_database(monkeypatch, url):
    monkeypatch.setenv("DATABASE_URL", url)
    monkeypatch.delenv("PGSSLROOTCERT", raising=False)
    spec = importlib.util.spec_from_file_location(
        "vps_database", Path(__file__).parents[1] / "backend/database.py"
    )
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_neon_url_constructs_asyncpg_engine_with_verified_tls(monkeypatch):
    module = load_database(monkeypatch,
        "postgresql://user:pass@example.invalid/db?sslmode=require&channel_binding=require")
    assert module.engine.url.drivername == "postgresql+asyncpg"
    assert not {"sslmode", "channel_binding"}.intersection(module.engine.url.query)
    assert module.ssl_context.check_hostname
    assert module.ssl_context.verify_mode.name == "CERT_REQUIRED"


def test_rejects_disabled_tls(monkeypatch):
    with pytest.raises(ValueError, match="must use TLS"):
        load_database(monkeypatch, "postgresql://user:pass@example.invalid/db?sslmode=disable")
