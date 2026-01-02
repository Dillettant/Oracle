"""Pydantic schemas for backtests."""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class BacktestBase(BaseModel):
    """Shared backtest fields."""

    strategy_id: str
    start_date: datetime
    end_date: datetime
    initial_capital: float = Field(..., gt=0)


class BacktestCreate(BacktestBase):
    """Schema for creating backtests."""


class BacktestUpdate(BaseModel):
    """Schema for updating backtests."""

    status: str | None = Field(None, max_length=30)
    results_json: dict[str, Any] | None = None


class BacktestResponse(BacktestBase):
    """Schema for backtest responses."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    status: str
    results_json: dict[str, Any] | None = None
    created_at: datetime
    updated_at: datetime
