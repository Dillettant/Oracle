"""Service for strategy CRUD operations."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.strategy import Strategy
from app.schemas.strategy import StrategyCreate, StrategyUpdate


class StrategyService:
    """Service for managing strategies."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_by_user(self, user_id: str) -> list[Strategy]:
        """List strategies for a user."""
        result = await self.db.execute(
            select(Strategy).where(Strategy.user_id == user_id).order_by(Strategy.created_at)
        )
        return list(result.scalars().all())

    async def get_by_id(self, strategy_id: str, user_id: str) -> Strategy | None:
        """Get a strategy by id scoped to a user."""
        result = await self.db.execute(
            select(Strategy).where(
                Strategy.id == strategy_id,
                Strategy.user_id == user_id,
            )
        )
        return result.scalar_one_or_none()

    async def create(self, user_id: str, payload: StrategyCreate) -> Strategy:
        """Create a new strategy."""
        strategy = Strategy(
            user_id=user_id,
            name=payload.name,
            description=payload.description,
            config_json=payload.config_json,
        )
        self.db.add(strategy)
        await self.db.flush()
        await self.db.refresh(strategy)
        return strategy

    async def update(self, strategy: Strategy, payload: StrategyUpdate) -> Strategy:
        """Update a strategy."""
        update_data = payload.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(strategy, key, value)
        await self.db.flush()
        await self.db.refresh(strategy)
        return strategy

    async def delete(self, strategy: Strategy) -> None:
        """Delete a strategy."""
        await self.db.delete(strategy)
        await self.db.flush()
