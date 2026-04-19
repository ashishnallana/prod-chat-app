from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from shared.config import settings

mongo_client = None

async def init_mongo(document_models: list):
    global mongo_client
    mongo_client = AsyncIOMotorClient(settings.mongo_uri)
    db = mongo_client[settings.mongo_db]
    await init_beanie(database=db, document_models=document_models)

async def close_mongo():
    global mongo_client
    if mongo_client:
        mongo_client.close()
