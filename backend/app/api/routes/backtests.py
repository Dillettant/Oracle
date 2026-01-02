"""Backtest API routes."""

import asyncio
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_backtest_service, get_current_user, get_strategy_service
from app.db.session import AsyncSessionLocal
from app.models.user import User
from app.schemas.backtest import BacktestCreate, BacktestResponse, BacktestUpdate
from app.services.backtest import BacktestService
from app.services.strategy import StrategyService

router = APIRouter(prefix="/backtests", tags=["Backtests"])


@router.get("/", response_model=list[BacktestResponse])
async def list_backtests(
    current_user: Annotated[User, Depends(get_current_user)],
    backtest_service: Annotated[BacktestService, Depends(get_backtest_service)],
) -> list[BacktestResponse]:
    """List backtests for current user."""
    return await backtest_service.list_by_user(current_user.id)


@router.post("/", response_model=BacktestResponse, status_code=status.HTTP_201_CREATED)
async def create_backtest(
    payload: BacktestCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    backtest_service: Annotated[BacktestService, Depends(get_backtest_service)],
    strategy_service: Annotated[StrategyService, Depends(get_strategy_service)],
) -> BacktestResponse:
    """Create a new backtest."""
    strategy = await strategy_service.get_by_id(payload.strategy_id, current_user.id)
    if not strategy:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Strategy not found")
    return await backtest_service.create(current_user.id, payload)


@router.get("/{backtest_id}", response_model=BacktestResponse)
async def get_backtest(
    backtest_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    backtest_service: Annotated[BacktestService, Depends(get_backtest_service)],
) -> BacktestResponse:
    """Get a backtest by ID."""
    backtest = await backtest_service.get_by_id(backtest_id, current_user.id)
    if not backtest:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Backtest not found")
    return backtest


@router.put("/{backtest_id}", response_model=BacktestResponse)
async def update_backtest(
    backtest_id: str,
    payload: BacktestUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    backtest_service: Annotated[BacktestService, Depends(get_backtest_service)],
) -> BacktestResponse:
    """Update a backtest by ID."""
    backtest = await backtest_service.get_by_id(backtest_id, current_user.id)
    if not backtest:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Backtest not found")
    return await backtest_service.update(backtest, payload)


@router.delete("/{backtest_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_backtest(
    backtest_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    backtest_service: Annotated[BacktestService, Depends(get_backtest_service)],
) -> None:
    """Delete a backtest by ID."""
    backtest = await backtest_service.get_by_id(backtest_id, current_user.id)
    if not backtest:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Backtest not found")
    await backtest_service.delete(backtest)
    return None


async def _complete_backtest(backtest_id: str, user_id: str) -> None:
    async with AsyncSessionLocal() as session:
        service = BacktestService(session)
        backtest = await service.get_by_id(backtest_id, user_id)
        if not backtest:
            return
        await service.complete(backtest)
        await session.commit()


@router.post("/{backtest_id}/run", response_model=BacktestResponse)
async def run_backtest(
    backtest_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    backtest_service: Annotated[BacktestService, Depends(get_backtest_service)],
) -> BacktestResponse:
    """Run a backtest execution asynchronously (stubbed)."""
    backtest = await backtest_service.get_by_id(backtest_id, current_user.id)
    if not backtest:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Backtest not found")
    if backtest.status == "running":
        return backtest
    await backtest_service.mark_running(backtest)
    asyncio.create_task(_complete_backtest(backtest.id, current_user.id))
    return backtest
