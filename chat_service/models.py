from beanie import Document
from pydantic import Field
from datetime import datetime, timezone
from typing import Optional

class Message(Document):
    sender_id: int
    receiver_id: int
    content: str
    message_type: str = "text" # "text" or "file"
    file_url: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = "sent" # "sent", "delivered", "read"

    class Settings:
        name = "messages"
        indexes = [
            ["sender_id", "receiver_id"],
            "timestamp"
        ]
