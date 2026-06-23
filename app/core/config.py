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

    # Firebase Placeholders (Module 2)
    VITE_FIREBASE_API_KEY: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
