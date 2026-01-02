"""Trading API routes (paper trading via Alpaca)."""

from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_alpaca_service
from app.schemas.alpaca import AlpacaAccount, AlpacaOrder, OrderRequest
from app.services.alpaca import AlpacaService

router = APIRouter(prefix="/trading", tags=["Trading"])


@router.get("/account", response_model=AlpacaAccount)
async def get_account(
    alpaca_service: Annotated[AlpacaService, Depends(get_alpaca_service)],
) -> AlpacaAccount:
    """Fetch Alpaca account details."""
    try:
        raw = await alpaca_service.get_account()
        return AlpacaAccount(
            id=raw.get("id"),
            status=raw.get("status"),
            currency=raw.get("currency"),
            cash=raw.get("cash"),
            buying_power=raw.get("buying_power"),
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.get("/orders", response_model=list[AlpacaOrder])
async def list_orders(
    alpaca_service: Annotated[AlpacaService, Depends(get_alpaca_service)],
    status_filter: str | None = None,
    limit: int | None = None,
) -> list[AlpacaOrder]:
    """List orders from Alpaca."""
    try:
        raw = await alpaca_service.list_orders(status=status_filter, limit=limit)
        return [
            AlpacaOrder(
                id=item.get("id"),
                symbol=item.get("symbol"),
                qty=item.get("qty"),
                side=item.get("side"),
                type=item.get("type"),
                time_in_force=item.get("time_in_force"),
                status=item.get("status"),
                created_at=item.get("created_at"),
            )
            for item in raw
        ]
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.post("/orders", response_model=AlpacaOrder)
async def create_order(
    payload: OrderRequest,
    alpaca_service: Annotated[AlpacaService, Depends(get_alpaca_service)],
) -> AlpacaOrder:
    """Submit a new order to Alpaca (paper trading)."""
    try:
        raw = await alpaca_service.create_order(payload.model_dump(exclude_none=True))
        return AlpacaOrder(
            id=raw.get("id"),
            symbol=raw.get("symbol"),
            qty=raw.get("qty"),
            side=raw.get("side"),
            type=raw.get("type"),
            time_in_force=raw.get("time_in_force"),
            status=raw.get("status"),
            created_at=raw.get("created_at"),
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
