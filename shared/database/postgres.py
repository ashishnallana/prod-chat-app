from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from shared.config import settings

engine = create_async_engine(settings.postgres_url, echo=settings.environment == "development")

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

Base = declarative_base()

# Dependency for FastAPI
async def get_db_session():
    async with AsyncSessionLocal() as session:
        yield session
