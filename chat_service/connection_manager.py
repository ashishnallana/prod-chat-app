import json
from typing import Dict
from fastapi import WebSocket
from redis.asyncio import Redis
from shared.config import settings

class ConnectionManager:
    def __init__(self):
        # Maps user_id -> WebSocket
        self.active_connections: Dict[int, WebSocket] = {}
        self.redis = Redis.from_url(settings.redis_url, decode_responses=True)

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        # Mark user as online in Redis
        await self.redis.set(f"presence:{user_id}", "online")

    async def disconnect(self, user_id: int):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
        # Mark user as offline
        await self.redis.set(f"presence:{user_id}", "offline")

    async def send_personal_message(self, message: dict, receiver_id: int) -> bool:
        # Check if receiver is connected to this node
        if receiver_id in self.active_connections:
            websocket = self.active_connections[receiver_id]
            try:
                await websocket.send_text(json.dumps(message))
                return True
            except Exception as e:
                print(f"Error sending message locally: {e}")
                return False
        return False

    async def is_user_online(self, user_id: int) -> bool:
        status = await self.redis.get(f"presence:{user_id}")
        return status == "online"

manager = ConnectionManager()
