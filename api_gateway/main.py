import httpx
from fastapi import FastAPI, Request, Response, WebSocket, WebSocketDisconnect
from starlette.background import BackgroundTask
import websockets
from prometheus_fastapi_instrumentator import Instrumentator

app = FastAPI(title="API Gateway")

Instrumentator().instrument(app).expose(app)

import os
from fastapi.middleware.cors import CORSMiddleware

# Service Map
SERVICES = {
    "auth": os.getenv("AUTH_SERVICE_URL", "http://localhost:8001"),
    "chat": os.getenv("CHAT_SERVICE_URL", "http://localhost:8002"),
    "files": os.getenv("FILE_SERVICE_URL", "http://localhost:8003"),
}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Async HTTP client
client = httpx.AsyncClient()

async def forward_request(request: Request, service_url: str):
    # Strip the /api/v1 prefix since microservices expect /auth, /chat, etc.
    stripped_path = request.url.path.replace("/api/v1", "", 1)
    url = f"{service_url}{stripped_path}"
    if request.url.query:
        url += f"?{request.url.query}"
    
    body = await request.body()
    
    # Exclude certain headers that shouldn't be forwarded directly
    headers = dict(request.headers)
    headers.pop("host", None)
    
    req = client.build_request(
        method=request.method,
        url=url,
        headers=headers,
        content=body
    )
    
    response = await client.send(req, stream=True)
    return Response(
        content=response.content,
        status_code=response.status_code,
        headers=dict(response.headers),
        background=BackgroundTask(response.aclose)
    )

@app.api_route("/api/v1/auth/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def proxy_auth(request: Request, path: str):
    return await forward_request(request, SERVICES["auth"])

@app.api_route("/api/v1/chat/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def proxy_chat(request: Request, path: str):
    return await forward_request(request, SERVICES["chat"])

@app.api_route("/api/v1/files/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def proxy_files(request: Request, path: str):
    return await forward_request(request, SERVICES["files"])

@app.websocket("/api/v1/chat/ws")
async def proxy_chat_ws(websocket: WebSocket):
    # Proxy WebSocket connection to the Chat Service
    await websocket.accept()
    query = websocket.url.query
    chat_ws_url = f"ws://localhost:8002/chat/ws?{query}"
    
    try:
        async with websockets.connect(chat_ws_url) as target_ws:
            async def forward_to_client():
                try:
                    while True:
                        msg = await target_ws.recv()
                        await websocket.send_text(msg)
                except Exception:
                    pass

            async def forward_to_target():
                try:
                    while True:
                        msg = await websocket.receive_text()
                        await target_ws.send(msg)
                except Exception:
                    pass

            import asyncio
            task1 = asyncio.create_task(forward_to_client())
            task2 = asyncio.create_task(forward_to_target())
            
            done, pending = await asyncio.wait(
                [task1, task2],
                return_when=asyncio.FIRST_COMPLETED
            )
            for t in pending:
                t.cancel()
                
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"Proxy ws error: {e}")
        await websocket.close()

@app.get("/health")
async def health_check():
    return {"status": "gateway is running"}
