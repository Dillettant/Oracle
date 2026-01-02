"""OAuth service for Google authentication."""

from authlib.integrations.httpx_client import AsyncOAuth2Client

from app.core.config import settings


class GoogleOAuthService:
    """Service for Google OAuth authentication."""

    AUTHORIZATION_URL = "https://accounts.google.com/o/oauth2/v2/auth"
    TOKEN_URL = "https://oauth2.googleapis.com/token"
    USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

    def __init__(self):
        self.client_id = settings.google_client_id
        self.client_secret = settings.google_client_secret
        self.redirect_uri = settings.google_redirect_uri

    def get_client(self) -> AsyncOAuth2Client:
        """Create OAuth2 client."""
        return AsyncOAuth2Client(
            client_id=self.client_id,
            client_secret=self.client_secret,
            redirect_uri=self.redirect_uri,
        )

    def get_authorization_url(self, state: str | None = None) -> str:
        """Generate Google OAuth authorization URL."""
        client = self.get_client()
        url, _ = client.create_authorization_url(
            self.AUTHORIZATION_URL,
            scope="openid email profile",
            state=state,
        )
        return url

    async def get_token(self, code: str) -> dict:
        """Exchange authorization code for access token."""
        client = self.get_client()
        token = await client.fetch_token(
            self.TOKEN_URL,
            grant_type="authorization_code",
            code=code,
        )
        return token

    async def get_user_info(self, token: dict) -> dict:
        """Get user info from Google using access token."""
        client = self.get_client()
        client.token = token
        response = await client.get(self.USERINFO_URL)
        return response.json()


def get_google_oauth_service() -> GoogleOAuthService:
    """Get Google OAuth service instance."""
    return GoogleOAuthService()
