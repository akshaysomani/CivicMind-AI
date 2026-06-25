from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # App Settings
    PROJECT_NAME: str = "CivicMind AI"
    APP_VERSION: str = "1.0.0-enterprise"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Security Settings
    SECRET_KEY: str = "super-secret-temporary-key-change-in-production-123!"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database Settings
    DATABASE_URL: str = "sqlite+aiosqlite:///./civicmind.db"
    DATABASE_REPLICA_URL: str = "sqlite+aiosqlite:///./civicmind_replica.db" # Read-replica placeholder
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 10
    REDIS_URL: str = "redis://localhost:6379/0"

    # Security Settings
    MFA_ISSUER: str = "CivicMind AI"
    CSRF_SECRET: str = "super-secret-csrf-token-generator-key-999"
    SLOW_QUERY_THRESHOLD_MS: float = 500.0

    # Firebase Placeholders (Module 2)
    VITE_FIREBASE_API_KEY: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
