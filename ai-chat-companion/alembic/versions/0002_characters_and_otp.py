"""characters + otp_codes

Revision ID: 0002
Revises: 0001
Create Date: 2026-04-09

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "characters",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("owner_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True, index=True),
        sa.Column("name", sa.String(length=60), nullable=False),
        sa.Column("tagline", sa.String(length=120), server_default="", nullable=False),
        sa.Column("style", sa.String(length=60), server_default="温柔", nullable=False),
        sa.Column("description", sa.Text(), server_default="", nullable=False),
        sa.Column("system_prompt", sa.Text(), server_default="", nullable=False),
        sa.Column("opening_line", sa.Text(), server_default="", nullable=False),
        sa.Column("avatar_url", sa.String(length=500), nullable=True),
        sa.Column("cover_gradient", sa.String(length=200), nullable=True),
        sa.Column("tags", sa.String(length=200), server_default="", nullable=False),
        sa.Column("is_public", sa.Boolean(), server_default=sa.text("0"), nullable=False, index=True),
        sa.Column("plays_count", sa.Integer(), server_default="0", nullable=False),
        sa.Column("likes_count", sa.Integer(), server_default="0", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, index=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_table(
        "otp_codes",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("phone", sa.String(length=50), nullable=False, index=True),
        sa.Column("code", sa.String(length=10), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("used", sa.Boolean(), server_default=sa.text("0"), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("otp_codes")
    op.drop_table("characters")
