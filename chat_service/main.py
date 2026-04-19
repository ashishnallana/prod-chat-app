from fastapi import FastAPI
from contextlib import asynccontextmanager
from shared.database.mongo import init_mongo, close_mongo
from shared.kafka.producer import close_kafka_producer
from chat_service.models import Message
from chat_service.routes import router as chat_router
from prometheus_fastapi_instrumentator import Instrumentator

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize Beanie (MongoDB)
    await init_mongo([Message])
    yield
    # Cleanup
    await close_mongo()
    await close_kafka_producer()

app = FastAPI(title="Chat Service", lifespan=lifespan)

Instrumentator().instrument(app).expose(app)

app.include_router(chat_router, prefix="/chat", tags=["chat"])

@app.get("/health")
async def health_check():
    return {"status": "ok"}
