from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from typing import Optional
import json

from chat_service.models import Message
from chat_service.connection_manager import manager
from shared.auth.jwt import decode_access_token
from shared.kafka.producer import send_message
from fastapi.security import OAuth2PasswordBearer

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user_http(token: str = Depends(oauth2_scheme)) -> int:
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return int(payload.get("sub"))

async def get_current_user_ws(token: str) -> Optional[int]:
    payload = decode_access_token(token)
    if not payload:
        return None
    return int(payload.get("sub"))

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str):
    user_id = await get_current_user_ws(token)
    if not user_id:
        await websocket.close(code=1008)
        return

    await manager.connect(websocket, user_id)
    
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Expected schema: {"receiver_id": 12, "content": "hello", "type": "text", "file_url": null}
            receiver_id = message_data.get("receiver_id")
            content = message_data.get("content", "")
            msg_type = message_data.get("type", "text")
            file_url = message_data.get("file_url")
            
            if not receiver_id:
                continue

            # 1. Save to MongoDB
            new_message = Message(
                sender_id=user_id,
                receiver_id=receiver_id,
                content=content,
                message_type=msg_type,
                file_url=file_url
            )
            await new_message.insert()

            msg_dict = {
                "id": str(new_message.id),
                "sender_id": user_id,
                "receiver_id": receiver_id,
                "content": content,
                "type": msg_type,
                "file_url": file_url,
                "timestamp": str(new_message.timestamp)
            }

            # 2. Attempt local delivery
            delivered = await manager.send_personal_message(msg_dict, receiver_id)
            
            # 3. If offline on this node, check global presence or let Kafka handle cross-node routing
            # For simplicity, we broadcast to Kafka so other nodes/notification consumer can catch it
            if not delivered:
                await send_message("message_sent", msg_dict)
            
    except WebSocketDisconnect:
        await manager.disconnect(user_id)

@router.get("/history/{user_id}")
async def get_history(user_id: int, current_user_id: int = Depends(get_current_user_http)):
    # Retrieve messages where (sender=user_id AND receiver=current) OR (sender=current AND receiver=user_id)
    messages = await Message.find(
        {
            "$or": [
                {"sender_id": user_id, "receiver_id": current_user_id},
                {"sender_id": current_user_id, "receiver_id": user_id}
            ]
        }
    ).sort("timestamp").to_list()
    return messages

@router.get("/presence/{user_id}")
async def get_presence(user_id: int):
    is_online = await manager.is_user_online(user_id)
    return {"user_id": user_id, "status": "online" if is_online else "offline"}
