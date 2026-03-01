# VitaCraft AI — Docker Containerization & EC2 Cloud Deployment

**Subject:** Cloud Computing — Assignment 1  
**Project:** VitaCraft AI SaaS Platform  
**Author:** DINRAJ K DINESH  
**Docker Hub:** [hub.docker.com/u/dinraj](https://hub.docker.com/u/dinraj)  
**GitHub:** [github.com/dinraj/vitacraft-ai-saas-platform](https://github.com/dinraj/vitacraft-ai-saas-platform)

---

## Table of Contents

1. [Project Architecture](#1-project-architecture)
2. [Docker File Breakdown](#2-docker-file-breakdown)
   - [Backend Dockerfile](#21-backend-dockerfile)
   - [Backend Entrypoint Script](#22-backend-entrypoint-script)
   - [Frontend Dockerfile](#23-frontend-dockerfile)
   - [Nginx Configuration](#24-nginx-configuration)
   - [Docker Compose](#25-docker-compose)
   - [.dockerignore Files](#26-dockerignore-files)
3. [Phase 1 — Build Images Locally](#3-phase-1--build-images-locally-windows-machine)
4. [Phase 2 — Push Images to Docker Hub](#4-phase-2--push-images-to-docker-hub)
5. [Phase 3 — EC2 Ubuntu Setup via MobaXterm](#5-phase-3--ec2-ubuntu-setup-via-mobaxterm)
6. [Phase 4 — Deploy on EC2](#6-phase-4--deploy-on-ec2)
7. [Stripe Production Webhook Setup](#7-stripe-production-webhook-setup)
8. [Verify & Test the Deployment](#8-verify--test-the-deployment)
9. [Useful Docker Commands Reference](#9-useful-docker-commands-reference)
10. [Troubleshooting](#10-troubleshooting)
11. [Architecture Diagram](#11-architecture-diagram)

---

## 1. Project Architecture

VitaCraft AI is a full-stack AI SaaS application that generates resumes, cover letters, and analyzes job descriptions using cloud LLM APIs.

| Layer | Technology | Docker Image |
|---|---|---|
| **Frontend** | React 19 + Vite → served by Nginx | `dinraj/vitacraft-frontend:latest` |
| **Backend** | Node.js 20 + Express REST API | `dinraj/vitacraft-backend:latest` |
| **Database** | Supabase PostgreSQL (external cloud) | No container — external managed DB |
| **Storage** | AWS S3 (external cloud) | No container — external managed storage |
| **LLM** | Groq / Gemini / Cohere / HuggingFace | No container — external APIs |

**Container Network Flow:**

```
Internet (Port 80)
        │
        ▼
┌───────────────────────┐
│  vitacraft-frontend   │  (Nginx — port 80)
│  dinraj/vitacraft  │
│  -frontend:latest     │
│                       │
│  /          → React SPA
│  /api/*     → proxy ──────────────────────────────────┐
│  /health    → proxy                                   │
└───────────────────────┘                               │
                                                        │
                                         Internal Docker Network
                                         (vitacraft-network)
                                                        │
                                                        ▼
                                        ┌───────────────────────┐
                                        │  vitacraft-backend    │  (Node.js — port 5000)
                                        │  dinraj/vitacraft  │
                                        │  -backend:latest      │
                                        │                       │
  External APIs ◄───────────────────────│  Groq / Gemini / etc │
  Supabase DB  ◄───────────────────────│  DATABASE_URL         │
  AWS S3       ◄───────────────────────│  AWS keys             │
                                        └───────────────────────┘
```

> **Key Design Decision:** Port 5000 is not exposed publicly in strict production — Nginx proxies all `/api/` traffic internally. Port 80 is the only public-facing port.

---

## 2. Docker File Breakdown

### 2.1 Backend Dockerfile

**Location:** `backend/Dockerfile`

```dockerfile
# ── Stage 1: Dependencies ─────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

# Install OS packages needed for native modules
RUN apk add --no-cache dumb-init openssl

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# ── Stage 2: Production Image ─────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

# dumb-init: proper PID-1 signal handling in containers
RUN apk add --no-cache dumb-init openssl

# Copy only prod dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY src/    ./src/
COPY prisma/ ./prisma/
COPY package*.json ./

# Generate Prisma client (targets the alpine OS binary)
RUN npx prisma generate

# Copy & permission the startup entrypoint
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodeapp -u 1001 -G nodejs
USER nodeapp

EXPOSE 5000

# dumb-init wraps entrypoint so signals work correctly
ENTRYPOINT ["dumb-init", "--", "./docker-entrypoint.sh"]
CMD ["node", "src/app.js"]
```

**Why Multi-Stage Build?**
- **Stage 1 (`deps`)**: Installs all npm packages including build tools
- **Stage 2 (`production`)**: Copies only the final node_modules — no build tools in the final image
- **Result**: Significantly smaller final image size (~180MB vs ~500MB)

**Why `dumb-init`?**
- Node.js running as PID 1 in a container doesn't handle Linux signals (SIGTERM, SIGINT) correctly
- `dumb-init` acts as a proper init process, ensuring graceful shutdowns with `docker stop`

**Why non-root user?**
- Security best practice — if the container is compromised, the attacker only has limited `nodeapp` user privileges, not root

---

### 2.2 Backend Entrypoint Script

**Location:** `backend/docker-entrypoint.sh`

```sh
#!/bin/sh
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   VitaCraft AI — Container Startup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "🔄  Running database migrations..."
npx prisma migrate deploy

echo "🌱  Seeding database (plans & admin)..."
node prisma/seed.js

echo "✅  Database ready."
echo "🚀  Starting VitaCraft AI backend on port 5000..."

exec "$@"
```

**Why a separate entrypoint script?**
- Ensures **database migrations run automatically** on every container start
- `prisma migrate deploy` is idempotent — it only applies unapplied migrations
- `node prisma/seed.js` uses `upsert` operations — safe to run multiple times
- `exec "$@"` hands control back to the CMD (`node src/app.js`) with correct signals

---

### 2.3 Frontend Dockerfile

**Location:** `frontend/Dockerfile`

```dockerfile
# ── Stage 1: Build React App ─────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ── Stage 2: Serve with Nginx ─────────────────────────────────
FROM nginx:alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Why Nginx for the frontend?**
- Nginx is a high-performance static file server
- It proxies `/api/*` requests to the backend container — the frontend itself never has a hardcoded backend URL
- The `baseURL: '/api/v1'` in `axiosInstance.js` uses relative paths, so the same frontend image works in any environment

---

### 2.4 Nginx Configuration

**Location:** `frontend/nginx.conf`

```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    # ── Gzip Compression ──────────────────────────────────
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json
               application/javascript application/xml+rss image/svg+xml;

    # ── SPA Routing ───────────────────────────────────────
    location / {
        try_files $uri $uri/ /index.html;
    }

    # ── API Proxy → Backend Container ─────────────────────
    location /api/ {
        proxy_pass         http://backend:5000;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_set_header   Connection        '';
        proxy_connect_timeout 10s;
        proxy_read_timeout    120s;
        proxy_send_timeout    120s;
    }

    # ── Health Check ──────────────────────────────────────
    location /health {
        proxy_pass http://backend:5000/health;
    }

    # ── Static Asset Caching ──────────────────────────────
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # ── Security Headers ──────────────────────────────────
    add_header X-Frame-Options        "SAMEORIGIN"   always;
    add_header X-Content-Type-Options "nosniff"      always;
    add_header X-XSS-Protection       "1; mode=block" always;
}
```

**Key Points:**
- `try_files $uri $uri/ /index.html` — Makes React Router work. Any unknown URL returns `index.html` so React handles routing
- `proxy_pass http://backend:5000` — `backend` is the Docker Compose service name; Docker's internal DNS resolves it
- `proxy_read_timeout 120s` — Generous timeout for LLM API calls which can take 10–60 seconds
- Gzip compression reduces JS/CSS bundle sizes by ~70%, speeding up page load

---

### 2.5 Docker Compose

**Location:** `docker-compose.yml`

```yaml
version: '3.8'

services:

  backend:
    image: dinraj/vitacraft-backend:latest
    container_name: vitacraft-backend
    ports:
      - "5000:5000"
    env_file:
      - .env
    environment:
      NODE_ENV: production
    networks:
      - vitacraft-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "wget -qO- http://localhost:5000/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 60s

  frontend:
    image: dinraj/vitacraft-frontend:latest
    container_name: vitacraft-frontend
    ports:
      - "80:80"
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - vitacraft-network
    restart: unless-stopped

networks:
  vitacraft-network:
    driver: bridge
```

**Key Concepts:**
- **`env_file: .env`** — Loads all environment variables from `.env` file. Secrets are never baked into images
- **`healthcheck`** — Docker polls `/health` every 30s. If the backend fails 5 checks, Docker restarts it automatically
- **`depends_on: condition: service_healthy`** — Frontend only starts after backend is confirmed healthy (migrations complete)
- **`restart: unless-stopped`** — Containers auto-restart after EC2 reboots or container crashes
- **`vitacraft-network`** — Custom bridge network: containers talk to each other by name (`backend`, `frontend`), isolated from other Docker containers

---

### 2.6 .dockerignore Files

**`backend/.dockerignore`**
```
node_modules
.env
.env.*
logs/
*.log
.git
tests/
coverage/
```

**`frontend/.dockerignore`**
```
node_modules
dist/
.env
.env.*
.git
.DS_Store
```

**Why `.dockerignore`?**
- Prevents Docker from sending unnecessary files in the build context
- `node_modules` excluded → installed fresh inside the container (avoids architecture conflicts between Windows and Linux)
- `.env` excluded → secrets NEVER baked into image layers (they're readable with `docker history`)
- Dramatically speeds up `docker build` by reducing context size

---

## 3. Phase 1 — Build Images Locally (Windows Machine)

### Prerequisites

```powershell
# Verify Docker Desktop is installed and running
docker --version
docker info

# Verify you're logged into Docker Hub
docker login
# Enter your Docker Hub username: dinraj910
# Enter your Docker Hub password/token
```

### Step 1 — Navigate to project root

```powershell
cd "d:\Cloud Web Projects\Assignment-1\VitaCraft AI"
```

### Step 2 — Build the Backend Image

```powershell
docker build `
  --tag dinraj/vitacraft-backend:latest `
  --tag dinraj/vitacraft-backend:v1.0 `
  --file backend/Dockerfile `
  ./backend
```

**What happens:**
1. Docker reads `backend/Dockerfile`
2. Downloads `node:20-alpine` base image (~50MB)
3. Installs npm dependencies
4. Copies source code and generates Prisma client
5. Creates final production image with non-root user
6. Tags the image with two tags: `latest` and `v1.0`

**Verify the build:**
```powershell
docker images | findstr vitacraft
```
Expected output:
```
dinraj/vitacraft-backend   latest   abc123def456   2 minutes ago   195MB
dinraj/vitacraft-backend   v1.0     abc123def456   2 minutes ago   195MB
```

### Step 3 — Build the Frontend Image

```powershell
docker build `
  --tag dinraj/vitacraft-frontend:latest `
  --tag dinraj/vitacraft-frontend:v1.0 `
  --file frontend/Dockerfile `
  ./frontend
```

**What happens:**
1. **Stage 1 (build):** Node.js installs dependencies and runs `npm run build` → produces `/app/dist`
2. **Stage 2 (production):** Nginx takes only the `dist/` folder — Node.js is NOT in the final image
3. Copies custom `nginx.conf`

**Verify:**
```powershell
docker images | findstr vitacraft
```
Expected:
```
dinraj/vitacraft-frontend   latest   def456abc789   2 minutes ago   45MB
dinraj/vitacraft-frontend   v1.0     def456abc789   2 minutes ago   45MB
dinraj/vitacraft-backend    latest   abc123def456   4 minutes ago   195MB
dinraj/vitacraft-backend    v1.0     abc123def456   4 minutes ago   195MB
```

### Step 4 (Optional) — Test Locally Before Pushing

Create a quick local `.env` with test values:

```powershell
# Copy the example and fill values
copy .env.production.example .env
notepad .env
```

Then start locally:
```powershell
docker compose up -d
```

Open browser: `http://localhost` (frontend) and `http://localhost:5000/health` (backend health)

Stop when done:
```powershell
docker compose down
```

---

## 4. Phase 2 — Push Images to Docker Hub

### Push Backend Image

```powershell
# Push both tags
docker push dinraj/vitacraft-backend:latest
docker push dinraj/vitacraft-backend:v1.0
```

**Output you'll see:**
```
The push refers to repository [docker.io/dinraj/vitacraft-backend]
a1b2c3d4e5f6: Pushed
latest: digest: sha256:abc123... size: 12345
```

### Push Frontend Image

```powershell
docker push dinraj/vitacraft-frontend:latest
docker push dinraj/vitacraft-frontend:v1.0
```

### Verify on Docker Hub

Go to: [https://hub.docker.com/u/dinraj](https://hub.docker.com/u/dinraj)

You should see two repositories:
- `dinraj/vitacraft-backend` — with tags `latest` and `v1.0`
- `dinraj/vitacraft-frontend` — with tags `latest` and `v1.0`

---

## 5. Phase 3 — EC2 Ubuntu Setup via MobaXterm

### 5.1 EC2 Security Group — Required Inbound Rules

In AWS Console → EC2 → Security Groups → Edit Inbound Rules:

| Type | Protocol | Port Range | Source | Description |
|---|---|---|---|---|
| SSH | TCP | 22 | My IP | MobaXterm access |
| HTTP | TCP | 80 | 0.0.0.0/0 | Frontend (Nginx) |
| Custom TCP | TCP | 5000 | 0.0.0.0/0 | Backend API (optional debug) |

### 5.2 Connect via MobaXterm

1. Open **MobaXterm**
2. Click **Session → SSH**
3. Remote host: `<EC2_PUBLIC_IP>` (e.g., `54.161.12.34`)
4. Specify username: `ubuntu`
5. Use private key: Browse to your `.pem` key file
6. Click **OK** → Connected!

### 5.3 Install Docker on Ubuntu EC2

```bash
# ── Update package list ──────────────────────────────────────
sudo apt-get update -y

# ── Install prerequisites ────────────────────────────────────
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# ── Add Docker's official GPG key ────────────────────────────
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
    sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# ── Add Docker repository ────────────────────────────────────
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# ── Install Docker Engine + Docker Compose plugin ────────────
sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# ── Start Docker and enable on boot ─────────────────────────
sudo systemctl start docker
sudo systemctl enable docker

# ── Add ubuntu user to docker group (no sudo needed) ────────
sudo usermod -aG docker ubuntu

# ── Apply group changes (or log out and back in) ─────────────
newgrp docker

# ── Verify installation ──────────────────────────────────────
docker --version
docker compose version
```

Expected output:
```
Docker version 27.x.x, build xxxxx
Docker Compose version v2.x.x
```

---

## 6. Phase 4 — Deploy on EC2

### Step 1 — Create the project directory

```bash
mkdir -p ~/vitacraft-ai
cd ~/vitacraft-ai
```

### Step 2 — Create the docker-compose.yml

```bash
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:

  backend:
    image: dinraj/vitacraft-backend:latest
    container_name: vitacraft-backend
    ports:
      - "5000:5000"
    env_file:
      - .env
    environment:
      NODE_ENV: production
    networks:
      - vitacraft-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "wget -qO- http://localhost:5000/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 60s

  frontend:
    image: dinraj/vitacraft-frontend:latest
    container_name: vitacraft-frontend
    ports:
      - "80:80"
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - vitacraft-network
    restart: unless-stopped

networks:
  vitacraft-network:
    driver: bridge
EOF
```

### Step 3 — Create the .env file

```bash
cat > .env << 'EOF'
# ── Server ─────────────────────────────────────
PORT=5000
NODE_ENV=production

# ── Database (Supabase) ─────────────────────────
DATABASE_URL="postgresql://postgres.[ref]:[pass]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[pass]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

# ── Auth ────────────────────────────────────────
JWT_ACCESS_SECRET="your-strong-access-secret"
JWT_REFRESH_SECRET="your-strong-refresh-secret"
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ── LLM API Keys ────────────────────────────────
GROQ_API_KEY="gsk_..."
GEMINI_API_KEY="AIza..."
COHERE_API_KEY="..."
HF_API_KEY="hf_..."

# ── AWS S3 ──────────────────────────────────────
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="us-east-2"
AWS_S3_BUCKET="vitacraft-ai-files"

# ── Stripe ──────────────────────────────────────
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_FREE="price_free_placeholder"
STRIPE_PRICE_PRO="price_1T67MHKiI4vJwdgAoH00qkmD"
STRIPE_PRICE_ENTERPRISE="price_1T67NWKiI4vJwdgAnJSMc8Cv"

# ── CORS ────────────────────────────────────────
FRONTEND_URL="http://YOUR_EC2_PUBLIC_IP"
EOF
```

> **Important:** Edit the `.env` file using `nano .env` or **MobaXterm's built-in editor** (drag-and-drop the file) and fill in all real values.

### Step 4 — Pull Images from Docker Hub

```bash
docker pull dinraj/vitacraft-backend:latest
docker pull dinraj/vitacraft-frontend:latest
```

Output:
```
latest: Pulling from dinraj/vitacraft-backend
3.11: Pulling from library/node
...
Status: Downloaded newer image for dinraj/vitacraft-backend:latest
```

### Step 5 — Start the Application

```bash
docker compose up -d
```

Output:
```
[+] Running 2/2
 ✔ Container vitacraft-backend   Started   8.3s
 ✔ Container vitacraft-frontend  Started   12.1s
```

**What happens in order:**
1. Docker starts `vitacraft-backend` first
2. Entrypoint runs → `prisma migrate deploy` (creates all DB tables)
3. Entrypoint runs → `node prisma/seed.js` (inserts FREE/PRO/ENTERPRISE plans)
4. Node.js server starts on port 5000
5. Docker healthcheck confirms backend is alive
6. Docker starts `vitacraft-frontend`
7. Nginx starts on port 80, ready to serve

### Step 6 — View Startup Logs

```bash
# All containers
docker compose logs -f

# Backend only
docker compose logs -f backend

# Frontend only
docker compose logs -f frontend
```

Expected backend log (first boot):
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   VitaCraft AI — Container Startup
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔄  Running database migrations...
Prisma Migrate: No pending migrations.
🌱  Seeding database (plans & admin)...
🌱 Seeding VitaCraft AI database...
  ✅ Plan: Free
  ✅ Plan: Pro
  ✅ Plan: Enterprise
✅  Database ready.
🚀  Starting VitaCraft AI backend on port 5000...
info: 🚀 VitaCraft AI Backend running on port 5000
info: ✅ LLM providers ready: Groq → Gemini → Cohere → HuggingFace
```

---

## 7. Stripe Production Webhook Setup

> **Why this step?** Locally you used `stripe listen --forward-to localhost:5000/...` which generated a **CLI webhook secret**. That secret only works on your machine. On EC2, Stripe must be told your real public URL, and it generates a different signing secret — the **Dashboard webhook secret**.

### 7.1 Register the Webhook Endpoint in Stripe Dashboard

1. Go to **[dashboard.stripe.com/test/webhooks](https://dashboard.stripe.com/test/webhooks)**
2. Click **"Add endpoint"**
3. Set **Endpoint URL** to:
   ```
   http://YOUR_EC2_PUBLIC_IP/api/v1/billing/webhook
   ```
   *(Replace `YOUR_EC2_PUBLIC_IP` with e.g. `54.161.12.34`)*
4. Under **"Select events to listen to"**, add these events:

   | Event | Purpose |
   |---|---|
   | `checkout.session.completed` | User completes payment → grant credits |
   | `invoice.paid` | Monthly renewal → grant credits |
   | `customer.subscription.updated` | Plan changes, cancellation scheduled |
   | `customer.subscription.deleted` | Subscription cancelled → downgrade to FREE |

5. Click **"Add endpoint"**
6. On the next screen, click **"Reveal"** under **Signing secret**
7. Copy the secret — it looks like `whsec_xxxxxxxxxxxx`

### 7.2 Update `.env` on EC2 with the Dashboard Secret

```bash
cd ~/vitacraft-ai
nano .env
```

Find the line:
```
STRIPE_WEBHOOK_SECRET="whsec_PASTE_DASHBOARD_SECRET_HERE"
```

Replace with the secret you just copied from the Dashboard:
```
STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxxxxxxxxx"
```

Also verify/update:
```
FRONTEND_URL="http://YOUR_EC2_PUBLIC_IP"
```
> **Why `FRONTEND_URL` matters:** After a successful checkout, Stripe redirects the user to `FRONTEND_URL/dashboard?checkout=success`. If this is still `localhost`, it won't work.

Save and exit (`Ctrl+O`, `Enter`, `Ctrl+X`).

### 7.3 Restart the Backend to Load New Env Vars

```bash
docker compose restart backend
docker compose logs -f backend
```

### 7.4 Verify the Webhook is Working

**Test from Stripe Dashboard:**
1. Go to your webhook endpoint in the Dashboard
2. Click **"Send test webhook"**
3. Choose `checkout.session.completed`
4. Click **Send test webhook**
5. You should see: ✅ **200** — `{"received": true}`

**Or test from EC2 terminal:**
```bash
# Hit the webhook route directly (will return 400 — no signature, which proves the route exists)
curl -X POST http://localhost:5000/api/v1/billing/webhook \
  -H "Content-Type: application/json" \
  -d '{"test":true}'

# Expected: {"error":"Webhook Error: No signatures found matching the expected signature..."}
# This proves the route works and signature verification is active
```

**Check backend logs for successful webhook processing:**
```bash
docker compose logs backend | grep -E "Stripe|webhook|checkout|credits|✅"
```

### 7.5 Stripe Setup Summary

| Item | Local (dev) | EC2 (production) |
|---|---|---|
| Webhook delivery | `stripe listen` CLI forwards to `localhost` | Stripe Dashboard sends to `http://EC2_IP/api/v1/billing/webhook` |
| Webhook secret | CLI-generated `whsec_...` (from `stripe listen`) | Dashboard-generated `whsec_...` (from Dashboard → Endpoint → Reveal) |
| Checkout redirect | `http://localhost:5173/dashboard` | `http://EC2_IP/dashboard` |
| `FRONTEND_URL` | `http://localhost:5173` | `http://YOUR_EC2_PUBLIC_IP` |

---

## 8. Verify & Test the Deployment


### From EC2 Terminal

```bash
# Check containers are running
docker compose ps

# Check container resource usage
docker stats --no-stream

# Test backend health endpoint
curl http://localhost:5000/health

# Test through Nginx proxy
curl http://localhost/health
```

Expected health response:
```json
{
  "success": true,
  "message": "VitaCraft AI API is healthy",
  "data": {
    "status": "ok",
    "uptime": 42,
    "environment": "production"
  }
}
```

### From Your Browser / Postman

Replace `EC2_PUBLIC_IP` with your actual IP (e.g., `54.161.12.34`):

| Test | URL | Expected |
|---|---|---|
| Frontend app | `http://EC2_PUBLIC_IP` | React login page |
| Backend health | `http://EC2_PUBLIC_IP:5000/health` | JSON health response |
| Via Nginx proxy | `http://EC2_PUBLIC_IP/health` | Same JSON (proxied) |
| API register | `POST http://EC2_PUBLIC_IP/api/v1/auth/register` | 201 Created |

---

## 9. Useful Docker Commands Reference

### Image Management

```bash
# List all local images
docker images

# Remove a specific image
docker rmi dinraj/vitacraft-backend:latest

# Remove all unused images (free up disk)
docker image prune -a

# Pull specific version
docker pull dinraj/vitacraft-backend:v1.0
```

### Container Management

```bash
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# Stop all containers
docker compose down

# Stop and remove volumes
docker compose down -v

# Restart a single service
docker compose restart backend

# Force recreate containers (after image update)
docker compose up -d --force-recreate
```

### Logs & Debugging

```bash
# Follow live logs
docker compose logs -f

# Last 100 lines
docker compose logs --tail=100 backend

# Execute command inside running container
docker exec -it vitacraft-backend sh

# Check environment variables inside container
docker exec vitacraft-backend env

# Inspect container network
docker network inspect vitacraft-ai_vitacraft-network
```

### Update Deployment (After New Push)

```bash
# Pull latest images
docker compose pull

# Recreate containers with new images
docker compose up -d --force-recreate

# Clean up old image layers
docker image prune -f
```

---

## 10. Troubleshooting

### Container exits immediately

```bash
# Check exit logs
docker compose logs backend

# Common causes:
# - Missing env var (DATABASE_URL, JWT_ACCESS_SECRET)
# - Database unreachable
# - Port already in use
```

### Port 80 already in use

```bash
# Find what's using port 80
sudo lsof -i :80
sudo kill -9 <PID>

# Or stop Apache/Nginx if running
sudo systemctl stop nginx
sudo systemctl stop apache2
```

### Cannot connect to database

```bash
# Test from inside the container
docker exec -it vitacraft-backend sh
# Inside container:
npx prisma db pull
```

### Frontend shows blank page

```bash
# Check nginx logs
docker exec vitacraft-frontend cat /var/log/nginx/error.log

# Verify backend is reachable from frontend container
docker exec vitacraft-frontend wget -qO- http://backend:5000/health
```

### Cannot pull image (rate limit)

```bash
# Login to Docker Hub to increase rate limit
docker login
# Username: dinraj910
# Password: (your token)
```

---

## 11. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    EC2 Ubuntu Instance                       │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Docker Engine                           │   │
│  │                                                     │   │
│  │  ┌─────────────────┐       ┌─────────────────────┐ │   │
│  │  │   vitacraft-    │       │    vitacraft-       │ │   │
│  │  │   frontend      │       │    backend          │ │   │
│  │  │   (Nginx:80)    │──────▶│    (Node.js:5000)  │ │   │
│  │  │                 │ proxy │                     │ │   │
│  │  │  React SPA      │ /api/ │  Express REST API  │ │   │
│  │  │  Static Files   │       │  Prisma ORM        │ │   │
│  │  └────────┬────────┘       └──────────┬──────────┘ │   │
│  │           │                           │             │   │
│  │           └───────────────────────────┘             │   │
│  │                vitacraft-network (bridge)            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Port 80  ←─ Public HTTP (Security Group)                   │
│  Port 5000 ←─ Backend direct (optional)                     │
└─────────────────────────────────────────────────────────────┘
         │                         │
         ▼                         ▼
  User's Browser          External Cloud Services
  (HTTP:80)               ├─ Supabase PostgreSQL
                          ├─ Groq / Gemini (LLM)
                          ├─ AWS S3 (files)
                          └─ Stripe (billing)
```

---

## Complete Command Summary

### On Your Windows Machine (Build & Push)

```powershell
# 1. Go to project root
cd "d:\Cloud Web Projects\Assignment-1\VitaCraft AI"

# 2. Login to Docker Hub
docker login

# 3. Build backend image
docker build --tag dinraj/vitacraft-backend:latest --tag dinraj/vitacraft-backend:v1.0 --file backend/Dockerfile ./backend

# 4. Build frontend image
docker build --tag dinraj/vitacraft-frontend:latest --tag dinraj/vitacraft-frontend:v1.0 --file frontend/Dockerfile ./frontend

# 5. Push backend
docker push dinraj/vitacraft-backend:latest
docker push dinraj/vitacraft-backend:v1.0

# 6. Push frontend
docker push dinraj/vitacraft-frontend:latest
docker push dinraj/vitacraft-frontend:v1.0
```

### On EC2 Ubuntu (via MobaXterm)

```bash
# 1. Install Docker (first time only)
sudo apt-get update -y && sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker ubuntu && newgrp docker

# 2. Setup project directory
mkdir -p ~/vitacraft-ai && cd ~/vitacraft-ai

# 3. Create docker-compose.yml and .env (copy from above sections)

# 4. Fill in .env with real credentials
nano .env

# 5. Pull images
docker pull dinraj/vitacraft-backend:latest
docker pull dinraj/vitacraft-frontend:latest

# 6. Start everything
docker compose up -d

# 7. Watch logs
docker compose logs -f

# 8. Test
curl http://localhost/health
```

---

*VitaCraft AI SaaS Platform — Built with Node.js, React, Prisma, Supabase, AWS, and Docker*
