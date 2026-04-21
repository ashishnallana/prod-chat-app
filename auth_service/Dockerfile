FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy shared library
COPY shared/ ./shared/

# Copy the service code
COPY auth_service/ ./auth_service/

EXPOSE 8001

CMD ["uvicorn", "auth_service.main:app", "--host", "0.0.0.0", "--port", "8001"]
