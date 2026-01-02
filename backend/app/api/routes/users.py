"""User profile API routes."""

from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.deps import get_auth_service, get_current_user
from app.models.user import User
from app.schemas.user import UserPrivate, UserUpdate
from app.services.auth import AuthService

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserPrivate)
async def get_profile(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """Get current user's profile."""
    return current_user


@router.put("/me", response_model=UserPrivate)
async def update_profile(
    payload: UserUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
) -> User:
    """Update current user's profile."""
    return await auth_service.update_user(current_user, **payload.model_dump(exclude_unset=True))
