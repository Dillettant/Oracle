"""Alpaca OAuth helper service."""

from typing import Any
from urllib.parse import urlencode

import httpx
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer

from app.core.config import settings


class AlpacaOAuthService:
    """Service for Alpaca OAuth URL generation and token exchange."""

    def __init__(self) -> None:
        self.client_id = settings.alpaca_oauth_client_id
        self.client_secret = settings.alpaca_oauth_client_secret
        self.redirect_uri = settings.alpaca_oauth_redirect_uri
        self.authorize_url = settings.alpaca_oauth_authorize_url
        self.token_url = settings.alpaca_oauth_token_url
        self._serializer = URLSafeTimedSerializer(settings.jwt_secret_key)

    def ensure_configured(self) -> None:
        if not self.client_id or not self.client_secret:
            raise ValueError("Alpaca OAuth client credentials are not configured")

    def create_state(self, user_id: str, env: str) -> str:
        return self._serializer.dumps({"user_id": user_id, "env": env})

    def verify_state(self, token: str, max_age: int = 600) -> dict[str, Any]:
        try:
            return self._serializer.loads(token, max_age=max_age)
        except (BadSignature, SignatureExpired) as exc:
            raise ValueError("Invalid OAuth state") from exc

    def get_authorization_url(self, state: str, env: str, scope: str) -> str:
        params = {
            "response_type": "code",
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "state": state,
            "scope": scope,
            "env": env,
        }
        return f"{self.authorize_url}?{urlencode(params)}"

    async def exchange_token(self, code: str) -> dict[str, Any]:
        self.ensure_configured()
        payload = {
            "grant_type": "authorization_code",
            "code": code,
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "redirect_uri": self.redirect_uri,
        }
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.post(
                self.token_url,
                data=payload,
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            response.raise_for_status()
            return response.json()
