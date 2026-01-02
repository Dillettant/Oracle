"""Create alpaca connections table

Revision ID: 003
Revises: 002
Create Date: 2025-01-02
"""

from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "003"
down_revision: Union[str, None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create integrations schema and Alpaca connections table."""
    op.execute("CREATE SCHEMA IF NOT EXISTS integrations")

    op.create_table(
        "alpaca_connections",
        sa.Column("id", postgresql.UUID(as_uuid=False), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=False), nullable=False),
        sa.Column("env", sa.String(length=10), nullable=False, server_default="paper"),
        sa.Column("access_token", sa.String(length=255), nullable=False),
        sa.Column("token_type", sa.String(length=20), nullable=False, server_default="bearer"),
        sa.Column("scope", sa.String(length=255), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.PrimaryKeyConstraint("id", name="pk_alpaca_connections"),
        sa.ForeignKeyConstraint(["user_id"], ["auth.users.id"], name="fk_alpaca_connections_user_id_users"),
        sa.UniqueConstraint("user_id", "env", name="uq_alpaca_connections_user_env"),
        schema="integrations",
    )

    op.create_index(
        "ix_alpaca_connections_user_id",
        "alpaca_connections",
        ["user_id"],
        schema="integrations",
    )


def downgrade() -> None:
    """Drop Alpaca connections table."""
    op.drop_index("ix_alpaca_connections_user_id", table_name="alpaca_connections", schema="integrations")
    op.drop_table("alpaca_connections", schema="integrations")
    op.execute("DROP SCHEMA IF EXISTS integrations")
