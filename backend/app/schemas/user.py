"""Pydantic schemas for user authentication."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ==============================================================================
# Base Schemas
# ==============================================================================


class UserBase(BaseModel):
    """Base user schema with common fields."""

    email: EmailStr
    username: str | None = None
    full_name: str | None = None


# ==============================================================================
# Request Schemas
# ==============================================================================


class UserCreate(UserBase):
    """Schema for user registration."""

    password: str = Field(..., min_length=8, max_length=100)


class UserLogin(BaseModel):
    """Schema for user login."""

    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    """Schema for updating user profile."""

    username: str | None = Field(None, min_length=3, max_length=50)
    full_name: str | None = Field(None, max_length=100)
    avatar_url: str | None = None


class PasswordChange(BaseModel):
    """Schema for changing password."""

    current_password: str
    new_password: str = Field(..., min_length=8, max_length=100)


class PasswordReset(BaseModel):
    """Schema for password reset."""

    token: str
    new_password: str = Field(..., min_length=8, max_length=100)


# ==============================================================================
# Response Schemas
# ==============================================================================


class UserResponse(UserBase):
    """Schema for user response (public data)."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    avatar_url: str | None = None
    is_active: bool
    is_verified: bool
    created_at: datetime


class UserPrivate(UserResponse):
    """Schema for user's own profile (includes more data)."""

    is_superuser: bool
    google_id: str | None = None
    updated_at: datetime


# ==============================================================================
# Token Schemas
# ==============================================================================


class Token(BaseModel):
    """Schema for JWT token response."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    """Schema for decoded JWT payload."""

    sub: str
    exp: datetime
    type: str


class RefreshToken(BaseModel):
    """Schema for refresh token request."""

    refresh_token: str


# ==============================================================================
# Google OAuth Schemas
# ==============================================================================


class GoogleAuthUrl(BaseModel):
    """Schema for Google OAuth authorization URL."""

    auth_url: str


class GoogleCallback(BaseModel):
    """Schema for Google OAuth callback."""

    code: str
    state: str | None = None
