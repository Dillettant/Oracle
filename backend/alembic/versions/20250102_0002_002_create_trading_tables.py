"""Create trading tables

Revision ID: 002
Revises: 001
Create Date: 2025-01-02
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create trading schema tables."""
    op.execute("CREATE SCHEMA IF NOT EXISTS trading")

    op.create_table(
        "strategies",
        sa.Column("id", postgresql.UUID(as_uuid=False), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=False), nullable=False),
        sa.Column("name", sa.String(120), nullable=False),
        sa.Column("description", sa.String(255), nullable=True),
        sa.Column("config_json", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False, server_default="1"),
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
        sa.PrimaryKeyConstraint("id", name="pk_strategies"),
        sa.ForeignKeyConstraint(["user_id"], ["auth.users.id"], name="fk_strategies_user_id_users"),
        schema="trading",
    )

    op.create_index(
        "ix_strategies_user_id",
        "strategies",
        ["user_id"],
        schema="trading",
    )

    op.create_table(
        "bots",
        sa.Column("id", postgresql.UUID(as_uuid=False), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=False), nullable=False),
        sa.Column("strategy_id", postgresql.UUID(as_uuid=False), nullable=False),
        sa.Column("name", sa.String(120), nullable=False),
        sa.Column("schedule", sa.String(120), nullable=False),
        sa.Column("status", sa.String(30), nullable=False, server_default="stopped"),
        sa.Column("last_run_at", sa.DateTime(timezone=True), nullable=True),
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
        sa.PrimaryKeyConstraint("id", name="pk_bots"),
        sa.ForeignKeyConstraint(["user_id"], ["auth.users.id"], name="fk_bots_user_id_users"),
        sa.ForeignKeyConstraint(
            ["strategy_id"],
            ["trading.strategies.id"],
            name="fk_bots_strategy_id_strategies",
        ),
        schema="trading",
    )

    op.create_index("ix_bots_user_id", "bots", ["user_id"], schema="trading")
    op.create_index("ix_bots_strategy_id", "bots", ["strategy_id"], schema="trading")

    op.create_table(
        "backtests",
        sa.Column("id", postgresql.UUID(as_uuid=False), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=False), nullable=False),
        sa.Column("strategy_id", postgresql.UUID(as_uuid=False), nullable=False),
        sa.Column("start_date", sa.DateTime(timezone=True), nullable=False),
        sa.Column("end_date", sa.DateTime(timezone=True), nullable=False),
        sa.Column("initial_capital", sa.Numeric(20, 2), nullable=False),
        sa.Column("status", sa.String(30), nullable=False, server_default="pending"),
        sa.Column("results_json", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
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
        sa.PrimaryKeyConstraint("id", name="pk_backtests"),
        sa.ForeignKeyConstraint(["user_id"], ["auth.users.id"], name="fk_backtests_user_id_users"),
        sa.ForeignKeyConstraint(
            ["strategy_id"],
            ["trading.strategies.id"],
            name="fk_backtests_strategy_id_strategies",
        ),
        schema="trading",
    )

    op.create_index("ix_backtests_user_id", "backtests", ["user_id"], schema="trading")
    op.create_index(
        "ix_backtests_strategy_id", "backtests", ["strategy_id"], schema="trading"
    )


def downgrade() -> None:
    """Drop trading schema tables."""
    op.drop_index("ix_backtests_strategy_id", table_name="backtests", schema="trading")
    op.drop_index("ix_backtests_user_id", table_name="backtests", schema="trading")
    op.drop_table("backtests", schema="trading")

    op.drop_index("ix_bots_strategy_id", table_name="bots", schema="trading")
    op.drop_index("ix_bots_user_id", table_name="bots", schema="trading")
    op.drop_table("bots", schema="trading")

    op.drop_index("ix_strategies_user_id", table_name="strategies", schema="trading")
    op.drop_table("strategies", schema="trading")
    op.execute("DROP SCHEMA IF EXISTS trading")
