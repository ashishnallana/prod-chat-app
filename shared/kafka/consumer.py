import json
import asyncio
from typing import Callable, Awaitable
from aiokafka import AIOKafkaConsumer
from shared.config import settings

class KafkaAsyncConsumer:
    def __init__(self, topic: str, group_id: str):
        self.topic = topic
        self.group_id = group_id
        self.consumer = None

    async def start(self, handler: Callable[[dict], Awaitable[None]]):
        self.consumer = AIOKafkaConsumer(
            self.topic,
            bootstrap_servers=settings.kafka_bootstrap_servers,
            group_id=self.group_id,
            value_deserializer=lambda m: json.loads(m.decode('utf-8'))
        )
        await self.consumer.start()
        try:
            async for msg in self.consumer:
                await handler(msg.value)
        finally:
            await self.consumer.stop()
