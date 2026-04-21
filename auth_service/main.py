from fastapi import FastAPI
from contextlib import asynccontextmanager
from shared.database.postgres import engine, Base
from shared.kafka.producer import close_kafka_producer
from auth_service.routes import router as auth_router
from prometheus_fastapi_instrumentator import Instrumentator

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schema
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Cleanup
    await close_kafka_producer()

app = FastAPI(title="Auth Service", lifespan=lifespan)

Instrumentator().instrument(app).expose(app)

app.include_router(auth_router, prefix="/auth", tags=["auth"])

@app.get("/health")
async def health_check():
    return {"status": "ok"}
