"""OAuth API routes for Google authentication."""

from typing import Annotated
from urllib.parse import urlencode

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse

from app.api.deps import get_auth_service
from app.core.config import settings
from app.core.security import create_access_token, create_refresh_token
from app.schemas.user import GoogleAuthUrl, Token
from app.services.auth import AuthService
from app.services.oauth import GoogleOAuthService, get_google_oauth_service

router = APIRouter(prefix="/auth/google", tags=["Google OAuth"])


@router.get("/authorize", response_model=GoogleAuthUrl)
async def google_authorize(
    oauth_service: Annotated[GoogleOAuthService, Depends(get_google_oauth_service)],
) -> GoogleAuthUrl:
    """Get Google OAuth authorization URL."""
    if not settings.feature_google_oauth:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Google OAuth is not enabled",
        )

    if not settings.google_client_id or not settings.google_client_secret:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google OAuth is not configured",
        )

    auth_url = oauth_service.get_authorization_url()
    return GoogleAuthUrl(auth_url=auth_url)


@router.get("/callback")
async def google_callback(
    code: str,
    state: str | None = None,
    oauth_service: GoogleOAuthService = Depends(get_google_oauth_service),
    auth_service: AuthService = Depends(get_auth_service),
) -> RedirectResponse:
    """Handle Google OAuth callback.

    This endpoint receives the authorization code from Google,
    exchanges it for tokens, and creates/updates the user.
    Then redirects to frontend with tokens.
    """
    if not settings.feature_google_oauth:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Google OAuth is not enabled",
        )

    try:
        # Exchange code for token
        token = await oauth_service.get_token(code)

        # Get user info from Google
        user_info = await oauth_service.get_user_info(token)

        google_id = user_info.get("sub")
        email = user_info.get("email")
        full_name = user_info.get("name")
        avatar_url = user_info.get("picture")

        if not google_id or not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to get user info from Google",
            )

        # Check if user exists by Google ID
        user = await auth_service.get_user_by_google_id(google_id)

        if not user:
            # Check if user exists by email
            existing_user = await auth_service.get_user_by_email(email)

            if existing_user:
                # Link Google account to existing user
                user = await auth_service.link_google_account(existing_user, google_id)
            else:
                # Create new user
                user = await auth_service.create_oauth_user(
                    email=email,
                    google_id=google_id,
                    full_name=full_name,
                    avatar_url=avatar_url,
                )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is disabled",
            )

        # Create JWT tokens
        access_token = create_access_token(subject=user.id)
        refresh_token = create_refresh_token(subject=user.id)

        # Redirect to frontend with tokens
        params = urlencode({
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
        })

        return RedirectResponse(
            url=f"{settings.frontend_url}/auth/callback?{params}",
            status_code=status.HTTP_302_FOUND,
        )

    except HTTPException:
        raise
    except Exception as e:
        # Redirect to frontend with error
        params = urlencode({"error": str(e)})
        return RedirectResponse(
            url=f"{settings.frontend_url}/auth/callback?{params}",
            status_code=status.HTTP_302_FOUND,
        )


@router.post("/token", response_model=Token)
async def google_token(
    code: str,
    oauth_service: Annotated[GoogleOAuthService, Depends(get_google_oauth_service)],
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
) -> Token:
    """Exchange Google authorization code for JWT tokens.

    Alternative to callback for SPA frontends that handle OAuth flow themselves.
    """
    if not settings.feature_google_oauth:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Google OAuth is not enabled",
        )

    try:
        # Exchange code for token
        token = await oauth_service.get_token(code)

        # Get user info from Google
        user_info = await oauth_service.get_user_info(token)

        google_id = user_info.get("sub")
        email = user_info.get("email")
        full_name = user_info.get("name")
        avatar_url = user_info.get("picture")

        if not google_id or not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to get user info from Google",
            )

        # Check if user exists by Google ID
        user = await auth_service.get_user_by_google_id(google_id)

        if not user:
            # Check if user exists by email
            existing_user = await auth_service.get_user_by_email(email)

            if existing_user:
                # Link Google account to existing user
                user = await auth_service.link_google_account(existing_user, google_id)
            else:
                # Create new user
                user = await auth_service.create_oauth_user(
                    email=email,
                    google_id=google_id,
                    full_name=full_name,
                    avatar_url=avatar_url,
                )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is disabled",
            )

        # Create JWT tokens
        access_token = create_access_token(subject=user.id)
        refresh_token = create_refresh_token(subject=user.id)

        return Token(
            access_token=access_token,
            refresh_token=refresh_token,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"OAuth error: {str(e)}",
        )
