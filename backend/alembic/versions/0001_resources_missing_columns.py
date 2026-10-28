"""Bring resources tables created by the early Emergent schema up to the model.

Revision ID: 0001
Revises:
Create Date: 2026-10-28
"""
from alembic import op

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None

COLUMNS = [
    ("template_id", "UUID REFERENCES templates (id)"),
    ("ai_review_score", "INTEGER"),
    ("ai_review_result", "JSON"),
    ("version", "INTEGER DEFAULT 1"),
    ("is_published", "BOOLEAN DEFAULT true"),
]


def upgrade() -> None:
    # IF NOT EXISTS: init_db.py already creates these columns on a fresh database.
    for name, ddl in COLUMNS:
        op.execute(f"ALTER TABLE resources ADD COLUMN IF NOT EXISTS {name} {ddl}")


def downgrade() -> None:
    for name, _ in reversed(COLUMNS):
        op.execute(f"ALTER TABLE resources DROP COLUMN IF EXISTS {name}")
