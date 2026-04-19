from fastapi import FastAPI
from file_service.routes import router as file_router
from prometheus_fastapi_instrumentator import Instrumentator

app = FastAPI(title="File Service")

Instrumentator().instrument(app).expose(app)

app.include_router(file_router, prefix="/files", tags=["files"])

@app.get("/health")
async def health_check():
    return {"status": "ok"}
