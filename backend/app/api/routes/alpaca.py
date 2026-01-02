"""Alpaca OAuth connection routes."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_alpaca_oauth_service
from app.core.config import settings
from app.db.session import get_db
from app.models.alpaca import AlpacaConnection
from app.models.user import User
from app.schemas.alpaca import AlpacaAuthorizeResponse, AlpacaConnectionResponse
from app.services.alpaca_oauth import AlpacaOAuthService
from app.api.deps import get_current_user

router = APIRouter(prefix="/alpaca", tags=["Alpaca OAuth"])


@router.get("/authorize", response_model=AlpacaAuthorizeResponse)
async def alpaca_authorize(
    current_user: Annotated[User, Depends(get_current_user)],
    oauth_service: Annotated[AlpacaOAuthService, Depends(get_alpaca_oauth_service)],
    env: str = "paper",
    scope: str = "account:write trading data",
) -> AlpacaAuthorizeResponse:
    """Get Alpaca OAuth authorization URL for a user."""
    if env not in {"paper", "live"}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid env")
    try:
        oauth_service.ensure_configured()
        state = oauth_service.create_state(current_user.id, env)
        auth_url = oauth_service.get_authorization_url(state=state, env=env, scope=scope)
        return AlpacaAuthorizeResponse(auth_url=auth_url)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc))


@router.get("/callback")
async def alpaca_callback(
    code: str,
    state: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    oauth_service: Annotated[AlpacaOAuthService, Depends(get_alpaca_oauth_service)],
) -> RedirectResponse:
    """Handle Alpaca OAuth callback and store tokens."""
    try:
        payload = oauth_service.verify_state(state)
        user_id = payload.get("user_id")
        env = payload.get("env", "paper")
        if not user_id:
            raise ValueError("Invalid OAuth state")

        token = await oauth_service.exchange_token(code)
        access_token = token.get("access_token")
        token_type = token.get("token_type", "bearer")
        scope = token.get("scope")
        if not access_token:
            raise ValueError("Missing access token")

        result = await db.execute(
            select(AlpacaConnection).where(
                AlpacaConnection.user_id == user_id,
                AlpacaConnection.env == env,
            )
        )
        connection = result.scalar_one_or_none()
        if connection:
            connection.access_token = access_token
            connection.token_type = token_type
            connection.scope = scope
        else:
            connection = AlpacaConnection(
                user_id=user_id,
                env=env,
                access_token=access_token,
                token_type=token_type,
                scope=scope,
            )
            db.add(connection)
        await db.flush()

        return RedirectResponse(
            url=f"{settings.frontend_url}/settings?alpaca=connected&env={env}",
            status_code=status.HTTP_302_FOUND,
        )
    except ValueError as exc:
        return RedirectResponse(
            url=f"{settings.frontend_url}/settings?alpaca=error&detail={str(exc)}",
            status_code=status.HTTP_302_FOUND,
        )


@router.get("/status", response_model=AlpacaConnectionResponse)
async def alpaca_status(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    env: str = "paper",
) -> AlpacaConnectionResponse:
    """Check Alpaca connection status for the current user."""
    result = await db.execute(
        select(AlpacaConnection).where(
            AlpacaConnection.user_id == current_user.id,
            AlpacaConnection.env == env,
        )
    )
    connection = result.scalar_one_or_none()
    if not connection:
        return AlpacaConnectionResponse(connected=False)
    return AlpacaConnectionResponse(
        connected=True,
        env=connection.env,
        scope=connection.scope,
        created_at=connection.created_at,
    )


@router.delete("/disconnect", response_model=AlpacaConnectionResponse)
async def alpaca_disconnect(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    env: str = "paper",
) -> AlpacaConnectionResponse:
    """Disconnect Alpaca account for current user."""
    result = await db.execute(
        select(AlpacaConnection).where(
            AlpacaConnection.user_id == current_user.id,
            AlpacaConnection.env == env,
        )
    )
    connection = result.scalar_one_or_none()
    if not connection:
        return AlpacaConnectionResponse(connected=False)
    await db.delete(connection)
    await db.flush()
    return AlpacaConnectionResponse(connected=False)
