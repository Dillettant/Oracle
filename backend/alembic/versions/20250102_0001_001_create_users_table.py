"""Create users table

Revision ID: 001
Revises:
Create Date: 2025-01-02
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create auth schema and users table."""
    # Create auth schema if not exists
    op.execute("CREATE SCHEMA IF NOT EXISTS auth")

    # Create users table
    op.create_table(
        "users",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=False),
            nullable=False,
        ),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("hashed_password", sa.String(255), nullable=True),
        sa.Column("username", sa.String(50), nullable=True),
        sa.Column("full_name", sa.String(100), nullable=True),
        sa.Column("avatar_url", sa.Text(), nullable=True),
        sa.Column("google_id", sa.String(255), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("is_verified", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("is_superuser", sa.Boolean(), nullable=False, server_default="false"),
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
        sa.PrimaryKeyConstraint("id", name="pk_users"),
        schema="auth",
    )

    # Create indexes
    op.create_index("ix_users_email", "users", ["email"], unique=True, schema="auth")
    op.create_index("ix_users_username", "users", ["username"], unique=True, schema="auth")
    op.create_index("ix_users_google_id", "users", ["google_id"], unique=True, schema="auth")


def downgrade() -> None:
    """Drop users table and auth schema."""
    op.drop_index("ix_users_google_id", table_name="users", schema="auth")
    op.drop_index("ix_users_username", table_name="users", schema="auth")
    op.drop_index("ix_users_email", table_name="users", schema="auth")
    op.drop_table("users", schema="auth")
    op.execute("DROP SCHEMA IF EXISTS auth")
