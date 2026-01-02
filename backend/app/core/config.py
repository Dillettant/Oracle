"""Application configuration using Pydantic Settings."""

from functools import lru_cache

from pydantic import PostgresDsn, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application
    environment: str = "development"
    debug: bool = True
    api_v1_prefix: str = "/api/v1"

    # Frontend/Backend URLs
    frontend_url: str = "http://localhost:5173"
    backend_url: str = "http://localhost:8000"

    # Database
    postgres_host: str = "localhost"
    postgres_port: int = 5433
    postgres_db: str = "oracle"
    postgres_user: str = "oracle"
    postgres_password: str = "oracle_dev_password"

    @computed_field
    @property
    def database_url(self) -> str:
        """Construct async database URL."""
        return str(
            PostgresDsn.build(
                scheme="postgresql+asyncpg",
                username=self.postgres_user,
                password=self.postgres_password,
                host=self.postgres_host,
                port=self.postgres_port,
                path=self.postgres_db,
            )
        )

    @computed_field
    @property
    def database_url_sync(self) -> str:
        """Construct sync database URL for Alembic."""
        return str(
            PostgresDsn.build(
                scheme="postgresql",
                username=self.postgres_user,
                password=self.postgres_password,
                host=self.postgres_host,
                port=self.postgres_port,
                path=self.postgres_db,
            )
        )

    # Redis
    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_password: str = ""

    @computed_field
    @property
    def redis_url(self) -> str:
        """Construct Redis URL."""
        if self.redis_password:
            return f"redis://:{self.redis_password}@{self.redis_host}:{self.redis_port}/0"
        return f"redis://{self.redis_host}:{self.redis_port}/0"

    # JWT Authentication
    jwt_secret_key: str = "your_jwt_secret_key_here_generate_with_openssl"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    # Password Hashing
    password_hash_rounds: int = 12

    # Google OAuth
    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = "http://localhost:8000/api/v1/auth/google/callback"

    # Alpaca API
    alpaca_api_key: str = ""
    alpaca_secret_key: str = ""
    alpaca_base_url: str = "https://paper-api.alpaca.markets"
    alpaca_data_url: str = "https://data.alpaca.markets"

    @computed_field
    @property
    def alpaca_paper_trading(self) -> bool:
        """Check if using paper trading."""
        return "paper" in self.alpaca_base_url

    # Feature Flags
    feature_google_oauth: bool = True
    feature_live_trading: bool = False
    feature_llm_agent: bool = False

    # Rate Limiting
    rate_limit_default: int = 100
    rate_limit_auth: int = 20
    rate_limit_trading: int = 50

    # Logging
    log_level: str = "INFO"
    log_format: str = "text"

    # CORS
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    @computed_field
    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS origins into list."""
        return [origin.strip() for origin in self.cors_origins.split(",")]


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()
