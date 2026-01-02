"""Strategy API routes."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_current_user, get_strategy_service
from app.models.user import User
from app.schemas.strategy import StrategyCreate, StrategyResponse, StrategyUpdate
from app.services.strategy import StrategyService

router = APIRouter(prefix="/strategies", tags=["Strategies"])


@router.get("/", response_model=list[StrategyResponse])
async def list_strategies(
    current_user: Annotated[User, Depends(get_current_user)],
    strategy_service: Annotated[StrategyService, Depends(get_strategy_service)],
) -> list[StrategyResponse]:
    """List strategies for current user."""
    return await strategy_service.list_by_user(current_user.id)


@router.post("/", response_model=StrategyResponse, status_code=status.HTTP_201_CREATED)
async def create_strategy(
    payload: StrategyCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    strategy_service: Annotated[StrategyService, Depends(get_strategy_service)],
) -> StrategyResponse:
    """Create a new strategy."""
    return await strategy_service.create(current_user.id, payload)


@router.get("/{strategy_id}", response_model=StrategyResponse)
async def get_strategy(
    strategy_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    strategy_service: Annotated[StrategyService, Depends(get_strategy_service)],
) -> StrategyResponse:
    """Get a strategy by ID."""
    strategy = await strategy_service.get_by_id(strategy_id, current_user.id)
    if not strategy:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Strategy not found")
    return strategy


@router.put("/{strategy_id}", response_model=StrategyResponse)
async def update_strategy(
    strategy_id: str,
    payload: StrategyUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    strategy_service: Annotated[StrategyService, Depends(get_strategy_service)],
) -> StrategyResponse:
    """Update a strategy by ID."""
    strategy = await strategy_service.get_by_id(strategy_id, current_user.id)
    if not strategy:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Strategy not found")
    return await strategy_service.update(strategy, payload)


@router.delete("/{strategy_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_strategy(
    strategy_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    strategy_service: Annotated[StrategyService, Depends(get_strategy_service)],
) -> None:
    """Delete a strategy by ID."""
    strategy = await strategy_service.get_by_id(strategy_id, current_user.id)
    if not strategy:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Strategy not found")
    await strategy_service.delete(strategy)
    return None
