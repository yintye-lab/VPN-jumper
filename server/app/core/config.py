"""Application configuration settings."""

from pathlib import Path

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "ShieldVPN"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./shieldvpn.db"

    # JWT
    SECRET_KEY: str = "change-me-in-production-use-a-strong-random-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # WireGuard
    WG_INTERFACE: str = "wg0"
    WG_PORT: int = 51820
    WG_NETWORK: str = "10.8.0.0/24"
    WG_DNS: str = "1.1.1.1,8.8.8.8"
    WG_CONFIG_DIR: str = "/etc/wireguard"
    WG_SERVER_ENDPOINT: str = ""  # Public IP or domain

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:5173"]

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
    }


settings = Settings()

BASE_DIR = Path(__file__).resolve().parent.parent.parent
