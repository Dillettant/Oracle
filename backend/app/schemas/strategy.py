"""Pydantic schemas for trading strategies."""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class StrategyBase(BaseModel):
    """Shared strategy fields."""

    name: str = Field(..., min_length=3, max_length=120)
    description: str | None = Field(None, max_length=255)
    config_json: dict[str, Any] = Field(default_factory=dict)


class StrategyCreate(StrategyBase):
    """Schema for creating strategies."""


class StrategyUpdate(BaseModel):
    """Schema for updating strategies."""

    name: str | None = Field(None, min_length=3, max_length=120)
    description: str | None = Field(None, max_length=255)
    config_json: dict[str, Any] | None = None
    version: int | None = Field(None, ge=1)


class StrategyResponse(StrategyBase):
    """Schema for strategy responses."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    version: int
    created_at: datetime
    updated_at: datetime
