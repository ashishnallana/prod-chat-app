# 🚀 Scalable Microservices Real-Time Chat App

A highly-scalable, asynchronous real-time chat application built rigidly on a microservices architecture. It features secure OTP-based authentication, an API Gateway, real-time WebSocket messaging, background email notifications over Kafka, and aggressive telemetry using Prometheus and Grafana.

---

## 🏗️ Architecture overview

### 🧱 Tech Stack
- **Frontend**: Next.js 14, React 18, Redux Toolkit, TailwindCSS v4
- **Backend**: Python 3.11, FastAPI (5 Microservices)
- **Databases**: PostgreSQL (Relational Data), MongoDB (NoSQL Document Store)
- **Message Brokers**: Apache Kafka + Zookeeper (Event-driven Architecture)
- **Caching & Presence**: Redis
- **Metrics & Logging**: Prometheus, Grafana
- **Containerization**: Docker, Docker-compose

### 🧩 Microservices Layout
1. **API Gateway** (`8000`): The central reverse-proxy built with FastAPI and `httpx`. Intercepts external HTTP/WS traffic and routes it dynamically to internal Docker hostnames.
2. **Auth Service** (`8001`): Handles PostgreSQL interactions. Manages `User` registration, Bcrypt hashing, session JWTs, and emits `otp_requested` Kafka events.
3. **Chat Service** (`8002`): Handles live WebSocket bindings using `beanie` (MongoDB) for infinite chat history and `redis` for tracking user connection status. Includes cross-node routing schemas.
4. **File Service** (`8003`): Ready to connect securely to third-party CDNs (like Supabase) to authorize and handle media streams.
5. **Notification Service** (Headless): Background consumer listening securely to Kafka `otp_requested` events. Triggers live email distributions via SMTP securely.

---

## 🔒 Environment Requirements

To boot the architecture successfully, create a `.env` file at the exact root of your repository (`/chat-app/.env`) containing these critical properties:

```env
# SECURITY
SECRET_KEY=your_super_secret_jwt_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# POSTGRES (Auth mapping)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=chat_db

# NOTIFICATION CREDENTIALS (for Kafka Consumer)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
# You MUST get an App Password from your Google Account settings
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_google_app_password

# FILE CDN
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
```

*(Note: The `frontend/` logic pulls the gateway proxy through a Next.js `.env.local` containing `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WEBSOCKET_URL` automatically.)*

---

## 🚀 Running the Application

### 1. Launch the Backend Infrastructure
Use `docker-compose` to spin up the entire internal network containing 12 heavily orchestrated containers (Gateway, 4x Services, Postgres, Mongo, Redis, Zookeeper, Kafka, Prometheus, Grafana):

```bash
docker-compose down
docker-compose up -d --build
```
*Wait ~15 seconds on the first boot for Postgres and Zookeeper to properly authorize health checks before the Microservices initialize.*

### 2. Boot the Next.js Frontend
Once Docker registers healthy across the cluster, power up the UI workspace:

```bash
cd frontend
npm install
npm run dev
```

### 3. Verify Links
- **User Interface**: [http://localhost:3000](http://localhost:3000)
- **API Gateway Health**: [http://localhost:8000/health](http://localhost:8000/health)
- **System Telemetry / Grafana**: [http://localhost:3001](http://localhost:3001) *(u: `admin` | p: `admin`)*

---

## 💥 Features
1. **Redux Global State Wiring**: Completely decouples Next.js UI from localized states, pushing network requests directly into global Redux thunks.
2. **WebSocket True-Echo Routing**: Chat payloads establish persistent bidirectional TCP connections dynamically proxied flawlessly over the Gateway into Python without HTTP polling.
3. **Multimedia File Sharing**: Complete integration with Supabase Storage. Attach images or documents natively in the UI; the `file_service` proxies the raw bytes and broadcasts a permanent CDN link back across the WebSocket connection. *(Note: Ensure your `chat-files` bucket has Public RLS INSERT/SELECT policies configured).*
4. **Kafka Event Bus**: Completely detaches external email latency from the Auth REST loop. When you create an account, Kafka consumes the notification instantly without hanging the UI.
5. **Grafana Dashboards Ready**: Every FastAPI node inherently wraps its ASGI application utilizing `prometheus-fastapi-instrumentator`, exposing real live metrics available dynamically.
