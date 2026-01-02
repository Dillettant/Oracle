"""API dependencies for dependency injection."""

from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.security import verify_token
from app.db.session import get_db
from app.models.alpaca import AlpacaConnection
from app.services.alpaca import AlpacaService
from app.services.alpaca_oauth import AlpacaOAuthService
from app.services.backtest import BacktestService
from app.models.user import User
from app.services.bot import BotService
from app.services.auth import AuthService
from app.services.strategy import StrategyService

# Security scheme
security = HTTPBearer()


async def get_auth_service(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> AuthService:
    """Get authentication service."""
    return AuthService(db)


async def get_strategy_service(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> StrategyService:
    """Get strategy service."""
    return StrategyService(db)


async def get_bot_service(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> BotService:
    """Get bot service."""
    return BotService(db)


async def get_backtest_service(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> BacktestService:
    """Get backtest service."""
    return BacktestService(db)


def get_alpaca_oauth_service() -> AlpacaOAuthService:
    """Get Alpaca OAuth service."""
    return AlpacaOAuthService()


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
) -> User:
    """Get current authenticated user from JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    token = credentials.credentials
    user_id = verify_token(token, token_type="access")

    if user_id is None:
        raise credentials_exception

    user = await auth_service.get_user_by_id(user_id)

    if user is None:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is disabled",
        )

    return user


async def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """Get current active user."""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user",
        )
    return current_user


async def get_current_superuser(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """Get current superuser."""
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions",
        )
    return current_user


async def get_alpaca_connection(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    env: str = "paper",
) -> AlpacaConnection:
    """Get Alpaca connection for current user."""
    result = await db.execute(
        select(AlpacaConnection).where(
            AlpacaConnection.user_id == current_user.id,
            AlpacaConnection.env == env,
        )
    )
    connection = result.scalar_one_or_none()
    if connection is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alpaca connection not found",
        )
    return connection


def get_alpaca_service(
    connection: Annotated[AlpacaConnection, Depends(get_alpaca_connection)],
) -> AlpacaService:
    """Get Alpaca service for current user."""
    return AlpacaService(access_token=connection.access_token, env=connection.env)
