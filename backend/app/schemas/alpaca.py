"""Schemas for Alpaca API requests and responses."""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class BarsRequest(BaseModel):
    """Request for market bars."""

    symbol: str = Field(..., min_length=1)
    timeframe: str = Field(..., min_length=1)
    start: str | None = None
    end: str | None = None
    limit: int | None = Field(None, gt=0, le=10000)


class QuotesRequest(BaseModel):
    """Request for market quotes."""

    symbol: str = Field(..., min_length=1)
    start: str | None = None
    end: str | None = None
    limit: int | None = Field(None, gt=0, le=10000)


class OrderRequest(BaseModel):
    """Request to place an order."""

    symbol: str
    qty: str | None = None
    notional: str | None = None
    side: str
    type: str
    time_in_force: str
    limit_price: str | None = None
    stop_price: str | None = None
    client_order_id: str | None = None


class AlpacaAuthorizeResponse(BaseModel):
    """Response containing Alpaca OAuth authorization URL."""

    auth_url: str


class AlpacaConnectionResponse(BaseModel):
    """Response for Alpaca connection status."""

    connected: bool
    env: str | None = None
    scope: str | None = None
    created_at: datetime | None = None


class AlpacaAsset(BaseModel):
    """Minimal asset representation."""

    model_config = ConfigDict(extra="allow")

    id: str | None = None
    symbol: str
    name: str | None = None
    exchange: str | None = None
    status: str | None = None
    tradable: bool | None = None


class AlpacaAssetsResponse(BaseModel):
    """Response for asset search."""

    assets: list[AlpacaAsset]


class AlpacaBar(BaseModel):
    """Bar data point."""

    timestamp: str | None = None
    open: float | None = None
    high: float | None = None
    low: float | None = None
    close: float | None = None
    volume: float | None = None
    trade_count: int | None = None
    vwap: float | None = None


class AlpacaBarsResponse(BaseModel):
    """Response for bars request."""

    bars: list[AlpacaBar]
    raw: dict[str, Any]


class AlpacaQuote(BaseModel):
    """Quote data point."""

    timestamp: str | None = None
    ask_price: float | None = None
    bid_price: float | None = None
    ask_size: float | None = None
    bid_size: float | None = None


class AlpacaQuotesResponse(BaseModel):
    """Response for quotes request."""

    quotes: list[AlpacaQuote]
    raw: dict[str, Any]


class AlpacaAccount(BaseModel):
    """Trading account summary."""

    model_config = ConfigDict(extra="allow")

    id: str | None = None
    status: str | None = None
    currency: str | None = None
    cash: str | None = None
    buying_power: str | None = None


class AlpacaOrder(BaseModel):
    """Order summary."""

    model_config = ConfigDict(extra="allow")

    id: str | None = None
    symbol: str | None = None
    qty: str | None = None
    side: str | None = None
    type: str | None = None
    time_in_force: str | None = None
    status: str | None = None
    created_at: str | None = None
