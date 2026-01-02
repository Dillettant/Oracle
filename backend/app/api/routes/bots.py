"""Bot API routes."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_bot_service, get_current_user, get_strategy_service
from app.models.user import User
from app.schemas.bot import BotCreate, BotResponse, BotUpdate
from app.services.bot import BotService
from app.services.strategy import StrategyService

router = APIRouter(prefix="/bots", tags=["Bots"])


@router.get("/", response_model=list[BotResponse])
async def list_bots(
    current_user: Annotated[User, Depends(get_current_user)],
    bot_service: Annotated[BotService, Depends(get_bot_service)],
) -> list[BotResponse]:
    """List bots for current user."""
    return await bot_service.list_by_user(current_user.id)


@router.post("/", response_model=BotResponse, status_code=status.HTTP_201_CREATED)
async def create_bot(
    payload: BotCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    bot_service: Annotated[BotService, Depends(get_bot_service)],
    strategy_service: Annotated[StrategyService, Depends(get_strategy_service)],
) -> BotResponse:
    """Create a new bot."""
    strategy = await strategy_service.get_by_id(payload.strategy_id, current_user.id)
    if not strategy:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Strategy not found")
    return await bot_service.create(current_user.id, payload)


@router.get("/{bot_id}", response_model=BotResponse)
async def get_bot(
    bot_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    bot_service: Annotated[BotService, Depends(get_bot_service)],
) -> BotResponse:
    """Get a bot by ID."""
    bot = await bot_service.get_by_id(bot_id, current_user.id)
    if not bot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bot not found")
    return bot


@router.put("/{bot_id}", response_model=BotResponse)
async def update_bot(
    bot_id: str,
    payload: BotUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    bot_service: Annotated[BotService, Depends(get_bot_service)],
) -> BotResponse:
    """Update a bot by ID."""
    bot = await bot_service.get_by_id(bot_id, current_user.id)
    if not bot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bot not found")
    return await bot_service.update(bot, payload)


@router.delete("/{bot_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bot(
    bot_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    bot_service: Annotated[BotService, Depends(get_bot_service)],
) -> None:
    """Delete a bot by ID."""
    bot = await bot_service.get_by_id(bot_id, current_user.id)
    if not bot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bot not found")
    await bot_service.delete(bot)
    return None


@router.post("/{bot_id}/start", response_model=BotResponse)
async def start_bot(
    bot_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    bot_service: Annotated[BotService, Depends(get_bot_service)],
) -> BotResponse:
    """Start a bot."""
    bot = await bot_service.get_by_id(bot_id, current_user.id)
    if not bot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bot not found")
    return await bot_service.start(bot)


@router.post("/{bot_id}/stop", response_model=BotResponse)
async def stop_bot(
    bot_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    bot_service: Annotated[BotService, Depends(get_bot_service)],
) -> BotResponse:
    """Stop a bot."""
    bot = await bot_service.get_by_id(bot_id, current_user.id)
    if not bot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bot not found")
    return await bot_service.stop(bot)
