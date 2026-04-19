from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

# Path to the .env file in the root directory
ENV_FILE_PATH = Path(__file__).resolve().parent.parent / ".env"

class Settings(BaseSettings):
    environment: str = "development"
    port: int = 8000
    
    # PostgreSQL
    postgres_user: str
    postgres_password: str
    postgres_db: str
    postgres_host: str
    postgres_port: str

    @property
    def postgres_url(self) -> str:
        return f"postgresql+asyncpg://{self.postgres_user}:{self.postgres_password}@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"

    # MongoDB
    mongo_uri: str
    mongo_db: str

    # Redis
    redis_url: str

    # Kafka
    kafka_bootstrap_servers: str

    # Security
    jwt_secret_key: str
    jwt_algorithm: str
    access_token_expire_minutes: int

    # Email
    smtp_host: str
    smtp_port: int
    smtp_user: str
    smtp_password: str
    sender_email: str

    # Supabase
    supabase_url: str
    supabase_key: str
    supabase_bucket: str

    model_config = SettingsConfigDict(env_file=str(ENV_FILE_PATH), extra="ignore")

settings = Settings()
