import asyncio
from shared.kafka.consumer import KafkaAsyncConsumer
from notification_service.mailer import send_otp_email

async def handle_otp_request(message: dict):
    email = message.get("email")
    otp = message.get("otp")
    if email and otp:
        print(f"Processing OTP request for {email}")
        send_otp_email(email, otp)
    else:
        print(f"Invalid message format: {message}")

async def main():
    print("Starting Notification Service...")
    consumer = KafkaAsyncConsumer(topic="otp_requested", group_id="notification_group")
    await consumer.start(handler=handle_otp_request)

if __name__ == "__main__":
    asyncio.run(main())
