"""Pydantic schemas for bots."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class BotBase(BaseModel):
    """Shared bot fields."""

    name: str = Field(..., min_length=3, max_length=120)
    schedule: str = Field(..., min_length=1, max_length=120)
    status: str = Field("stopped", max_length=30)


class BotCreate(BotBase):
    """Schema for creating bots."""

    strategy_id: str


class BotUpdate(BaseModel):
    """Schema for updating bots."""

    name: str | None = Field(None, min_length=3, max_length=120)
    schedule: str | None = Field(None, min_length=1, max_length=120)
    status: str | None = Field(None, max_length=30)


class BotResponse(BotBase):
    """Schema for bot responses."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    strategy_id: str
    last_run_at: datetime | None = None
    created_at: datetime
    updated_at: datetime
