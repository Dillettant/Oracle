"""Service for bot CRUD operations."""

from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.bot import Bot
from app.schemas.bot import BotCreate, BotUpdate


class BotService:
    """Service for managing bots."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_by_user(self, user_id: str) -> list[Bot]:
        """List bots for a user."""
        result = await self.db.execute(
            select(Bot).where(Bot.user_id == user_id).order_by(Bot.created_at)
        )
        return list(result.scalars().all())

    async def get_by_id(self, bot_id: str, user_id: str) -> Bot | None:
        """Get a bot by id scoped to a user."""
        result = await self.db.execute(
            select(Bot).where(
                Bot.id == bot_id,
                Bot.user_id == user_id,
            )
        )
        return result.scalar_one_or_none()

    async def create(self, user_id: str, payload: BotCreate) -> Bot:
        """Create a new bot."""
        bot = Bot(
            user_id=user_id,
            strategy_id=payload.strategy_id,
            name=payload.name,
            schedule=payload.schedule,
            status=payload.status,
        )
        self.db.add(bot)
        await self.db.flush()
        await self.db.refresh(bot)
        return bot

    async def update(self, bot: Bot, payload: BotUpdate) -> Bot:
        """Update a bot."""
        update_data = payload.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(bot, key, value)
        await self.db.flush()
        await self.db.refresh(bot)
        return bot

    async def delete(self, bot: Bot) -> None:
        """Delete a bot."""
        await self.db.delete(bot)
        await self.db.flush()

    async def start(self, bot: Bot) -> Bot:
        """Start a bot run."""
        bot.status = "running"
        bot.last_run_at = datetime.now(timezone.utc)
        await self.db.flush()
        await self.db.refresh(bot)
        return bot

    async def stop(self, bot: Bot) -> Bot:
        """Stop a bot run."""
        bot.status = "stopped"
        await self.db.flush()
        await self.db.refresh(bot)
        return bot
