import json
from aiokafka import AIOKafkaProducer
from shared.config import settings

_producer = None

async def get_kafka_producer() -> AIOKafkaProducer:
    global _producer
    if _producer is None:
        _producer = AIOKafkaProducer(
            bootstrap_servers=settings.kafka_bootstrap_servers,
            value_serializer=lambda v: json.dumps(v).encode('utf-8')
        )
        await _producer.start()
    return _producer

async def close_kafka_producer():
    global _producer
    if _producer:
        await _producer.stop()

async def send_message(topic: str, value: dict):
    producer = await get_kafka_producer()
    await producer.send_and_wait(topic, value)
