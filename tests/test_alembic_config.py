"""Alembic takes its database URL from the environment, never from the repository."""
import configparser
import os
from pathlib import Path
import subprocess
import sys

BACKEND = Path(__file__).parents[1] / "backend"


def run_alembic(**env):
    clean = {k: v for k, v in os.environ.items() if k != "DATABASE_URL"}
    return subprocess.run(
        [sys.executable, "-m", "alembic", "upgrade", "head", "--sql"],
        cwd=BACKEND, env={**clean, **env}, capture_output=True, text=True,
    )


def test_alembic_ini_holds_no_database_url():
    ini = configparser.ConfigParser(interpolation=None)
    ini.read(BACKEND / "alembic.ini")
    assert ini.get("alembic", "sqlalchemy.url", fallback="").strip() == ""


def test_alembic_uses_database_url_from_environment():
    result = run_alembic(DATABASE_URL="postgresql://user:p%40ss@example.invalid/db?sslmode=require")
    assert result.returncode == 0, result.stderr


def test_alembic_refuses_to_run_without_database_url():
    result = run_alembic(DATABASE_URL="")  # empty also blocks backend/.env
    assert result.returncode != 0
    assert "DATABASE_URL" in result.stderr
