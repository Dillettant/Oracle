"""Market data API routes (Alpaca)."""

from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_alpaca_service
from app.schemas.alpaca import (
    AlpacaAsset,
    AlpacaAssetsResponse,
    AlpacaBar,
    AlpacaBarsResponse,
    AlpacaQuote,
    AlpacaQuotesResponse,
    BarsRequest,
    QuotesRequest,
)
from app.services.alpaca import AlpacaService

router = APIRouter(prefix="/market", tags=["Market"])


@router.post("/bars", response_model=AlpacaBarsResponse)
async def get_bars(
    payload: BarsRequest,
    alpaca_service: Annotated[AlpacaService, Depends(get_alpaca_service)],
) -> AlpacaBarsResponse:
    """Retrieve historical bars from Alpaca data API."""
    try:
        raw = await alpaca_service.get_bars(
            symbol=payload.symbol,
            timeframe=payload.timeframe,
            start=payload.start,
            end=payload.end,
            limit=payload.limit,
        )
        bars = [
            AlpacaBar(
                timestamp=item.get("t"),
                open=item.get("o"),
                high=item.get("h"),
                low=item.get("l"),
                close=item.get("c"),
                volume=item.get("v"),
                trade_count=item.get("n"),
                vwap=item.get("vw"),
            )
            for item in raw.get("bars", [])
        ]
        return AlpacaBarsResponse(bars=bars, raw=raw)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.post("/quotes", response_model=AlpacaQuotesResponse)
async def get_quotes(
    payload: QuotesRequest,
    alpaca_service: Annotated[AlpacaService, Depends(get_alpaca_service)],
) -> AlpacaQuotesResponse:
    """Retrieve quotes from Alpaca data API."""
    try:
        raw = await alpaca_service.get_quotes(
            symbol=payload.symbol,
            start=payload.start,
            end=payload.end,
            limit=payload.limit,
        )
        quotes = [
            AlpacaQuote(
                timestamp=item.get("t"),
                ask_price=item.get("ap"),
                bid_price=item.get("bp"),
                ask_size=item.get("as"),
                bid_size=item.get("bs"),
            )
            for item in raw.get("quotes", [])
        ]
        return AlpacaQuotesResponse(quotes=quotes, raw=raw)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.get("/assets", response_model=AlpacaAssetsResponse)
async def search_assets(
    alpaca_service: Annotated[AlpacaService, Depends(get_alpaca_service)],
    q: str | None = None,
    limit: int = 20,
) -> AlpacaAssetsResponse:
    """Search tradable assets by symbol/name."""
    try:
        assets = await alpaca_service.list_assets()
        if q:
            query = q.lower()
            assets = [
                asset
                for asset in assets
                if query in asset.get("symbol", "").lower()
                or query in asset.get("name", "").lower()
            ]
        assets = assets[: max(1, min(limit, 100))]
        return AlpacaAssetsResponse(assets=[AlpacaAsset(**asset) for asset in assets])
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
