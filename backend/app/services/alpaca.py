"""Alpaca API client for market data and paper trading."""

from datetime import datetime, timedelta, timezone
from typing import Any

import httpx

from app.core.config import settings

_ASSET_CACHE: dict[str, tuple[datetime, list[dict[str, Any]]]] = {}
_ASSET_TTL = timedelta(minutes=10)


class AlpacaService:
    """HTTP client wrapper for Alpaca APIs (OAuth)."""

    def __init__(self, access_token: str, env: str = "paper") -> None:
        self.access_token = access_token
        self.env = env
        self.data_url = settings.alpaca_data_url.rstrip("/")

    def _base_url(self) -> str:
        if self.env == "live":
            return "https://api.alpaca.markets"
        return "https://paper-api.alpaca.markets"

    def _headers(self) -> dict[str, str]:
        return {
            "Authorization": f"Bearer {self.access_token}",
        }

    def _ensure_credentials(self) -> None:
        if not self.access_token:
            raise ValueError("Alpaca OAuth token is not configured")

    async def get_account(self) -> dict[str, Any]:
        """Fetch trading account details (paper/live)."""
        self._ensure_credentials()
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.get(
                f"{self._base_url()}/v2/account",
                headers=self._headers(),
            )
            response.raise_for_status()
            return response.json()

    async def list_orders(self, status: str | None = None, limit: int | None = None) -> list[dict[str, Any]]:
        """List orders for the account."""
        self._ensure_credentials()
        params: dict[str, Any] = {}
        if status:
            params["status"] = status
        if limit:
            params["limit"] = limit
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.get(
                f"{self._base_url()}/v2/orders",
                headers=self._headers(),
                params=params,
            )
            response.raise_for_status()
            return response.json()

    async def create_order(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Create a new order (paper trading)."""
        self._ensure_credentials()
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.post(
                f"{self._base_url()}/v2/orders",
                headers=self._headers(),
                json=payload,
            )
            response.raise_for_status()
            return response.json()

    async def list_assets(self) -> list[dict[str, Any]]:
        """Fetch list of tradable assets (cached)."""
        self._ensure_credentials()
        cache_key = f"{self.env}"
        now = datetime.now(timezone.utc)
        cached = _ASSET_CACHE.get(cache_key)
        if cached:
            expires_at, assets = cached
            if now < expires_at:
                return assets
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.get(
                f"{self._base_url()}/v2/assets",
                headers=self._headers(),
                params={"status": "active", "asset_class": "us_equity"},
            )
            response.raise_for_status()
            assets = response.json()
        _ASSET_CACHE[cache_key] = (now + _ASSET_TTL, assets)
        return assets

    async def get_bars(
        self,
        symbol: str,
        timeframe: str,
        start: str | None = None,
        end: str | None = None,
        limit: int | None = None,
    ) -> dict[str, Any]:
        """Fetch historical bars for a symbol."""
        self._ensure_credentials()
        params: dict[str, Any] = {"timeframe": timeframe}
        if start:
            params["start"] = start
        if end:
            params["end"] = end
        if limit:
            params["limit"] = limit
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.get(
                f"{self.data_url}/v2/stocks/{symbol}/bars",
                headers=self._headers(),
                params=params,
            )
            response.raise_for_status()
            return response.json()

    async def get_quotes(
        self,
        symbol: str,
        start: str | None = None,
        end: str | None = None,
        limit: int | None = None,
    ) -> dict[str, Any]:
        """Fetch quotes for a symbol."""
        self._ensure_credentials()
        params: dict[str, Any] = {}
        if start:
            params["start"] = start
        if end:
            params["end"] = end
        if limit:
            params["limit"] = limit
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.get(
                f"{self.data_url}/v2/stocks/{symbol}/quotes",
                headers=self._headers(),
                params=params,
            )
            response.raise_for_status()
            return response.json()
