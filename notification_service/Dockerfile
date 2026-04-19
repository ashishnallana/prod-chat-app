FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy shared library
COPY shared/ ./shared/

# Copy the service code
COPY notification_service/ ./notification_service/

# Worker lacks exposed ports since it listens to Kafka
CMD ["python", "-m", "notification_service.main"]
