# Scalable Real-Time Chat App

A microservices-based chat application built using FastAPI, PostgreSQL, MongoDB, Redis, and Kafka.

## Architecture

* **Auth Service**: Manages User signup, login via OTP, and JWT issuance (PostgreSQL).
* **Chat Service**: Handles WebSocket connections and text/attachment messaging (MongoDB + Redis).
* **Notification Service**: Sends OTP over email via Kafka event stream.
* **File Service**: Securely uploads files to Supabase Storage.
* **API Gateway**: Single entry point that proxies requests to microservices.

## Technologies Used

* Backend: FastAPI (Python)
* Database (Relational): PostgreSQL (User Data)
* Database (Document): MongoDB (Messages)
* Cache / Realtime: Redis (Presence, pub/sub, caching)
* Message Broker: Kafka (Asynchronous events)
* Storage: Supabase Storage
* ORM: SQLAlchemy (Postgres) & Beanie (MongoDB)

## Local Development Setup

### 1. Prerequisites
You must have the following running locally:
* PostgreSQL on port `5432`
* MongoDB on port `27017`
* Redis on port `6379`
* Kafka and Zookeeper (typically Kafka on `9092` and Zookeeper on `2181`)

### 2. Environment Variables
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and fill in your missing credentials:
   - `SMTP_USER` and `SMTP_PASSWORD` (Your Gmail and its App Password).
   - `SUPABASE_URL` and `SUPABASE_KEY` (Your Supabase project keys).
   - Local DB passwords if applicable.

### 3. Virtual Environment
Create and activate the virtual environment:
```powershell
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

*(Note: If you add new packages, please update `requirements.txt` and re-freeze).*

### 4. Running the Services

*Presently, services are run manually. Docker setup is planned in the future.*

Open multiple terminals. In each terminal, activate your virtual environment:

**Run API Gateway (Port 8000)**
```bash
uvicorn api_gateway.main:app --port 8000 --reload
```

**Run Auth Service (Port 8001)**
```bash
uvicorn auth_service.main:app --port 8001 --reload
```

**Run Chat Service (Port 8002)**
```bash
uvicorn chat_service.main:app --port 8002 --reload
```

**Run File Service (Port 8003)**
```bash
uvicorn file_service.main:app --port 8003 --reload
```

**Run Notification Service (Worker)**
```bash
python -m notification_service.main
```
