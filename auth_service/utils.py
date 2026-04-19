from passlib.context import CryptContext
import random
import rstr
import redis.asyncio as redis
from shared.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def generate_otp() -> str:
    return str(random.randint(100000, 999999))

redis_client = redis.from_url(settings.redis_url, decode_responses=True)

async def store_otp(email: str, otp: str):
    # Store OTP in Redis with an expiry of 5 minutes (300 seconds)
    await redis_client.setex(f"otp:{email}", 300, otp)

async def verify_otp_from_redis(email: str, entered_otp: str) -> bool:
    stored_otp = await redis_client.get(f"otp:{email}")
    if stored_otp and stored_otp == entered_otp:
        await redis_client.delete(f"otp:{email}") # Delete after successful verify
        return True
    return False
