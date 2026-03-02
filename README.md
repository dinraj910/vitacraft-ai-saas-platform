<div align="center">

<br/>

# ⚡ VitaCraft AI

### *Professional AI-Powered Career Document Platform*

**Generate stunning resumes, cover letters & job analysis reports in seconds — powered by cutting-edge cloud LLMs**

<br/>

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-vitacraft--ai.vercel.app-6366f1?style=for-the-badge&logoColor=white)](https://vitacraft-ai.vercel.app)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)
[![Node](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://hub.docker.com/u/dinraj)
[![CI](https://img.shields.io/badge/CI-GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)](.github/workflows)

<br/>

> 🏆 **Full-Stack SaaS Platform** | Multi-tenant Architecture | Cloud-Native | Production Deployed

</div>

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Live Demo](#-live-demo)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Docker Deployment](#-docker-deployment)
- [Cloud Deployment](#-cloud-deployment)
- [API Reference](#-api-reference)
- [Environment Variables](#-environment-variables)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Security](#-security)
- [About the Developer](#-about-the-developer)

---

## 🧠 Overview

**VitaCraft AI** is a production-grade, multi-tenant SaaS platform that leverages cloud-hosted Large Language Models (LLMs) to help job seekers craft professional career documents instantly. Built with a microservice-friendly architecture, it implements enterprise-grade features including JWT authentication with refresh token rotation, credit-based billing, Stripe payment processing, AWS S3 file storage, PDF generation, and full Docker containerization.

This project demonstrates mastery across the **complete modern software engineering stack** — from database schema design and REST API development, to React state management, cloud infrastructure, and CI/CD automation.

---

## 🌐 Live Demo

| Service | URL | Platform |
|---|---|---|
| 🖥️ Frontend | [vitacraft-ai.vercel.app](https://vitacraft-ai.vercel.app) | Vercel |
| ⚙️ Backend API | [vitacraft-backend.onrender.com](https://vitacraft-backend.onrender.com) | Render |
| 🐳 Docker Images | [hub.docker.com/u/dinraj](https://hub.docker.com/u/dinraj) | Docker Hub |
| 📦 Source Code | [github.com/dinraj910/vitacraft-ai-saas-platform](https://github.com/dinraj910/vitacraft-ai-saas-platform) | GitHub |

---

## ✨ Key Features

### 🤖 AI-Powered Generation
- **Resume Generator** — Tailored, ATS-optimized resumes from your profile and job description
- **Cover Letter Generator** — Personalized, compelling cover letters matching job requirements
- **Job Description Analyzer** — Deep insights into JD requirements, skills gap, and fit score
- **Resume Analyzer** — ATS compatibility scoring and improvement suggestions

### 💳 Billing & Credits System
- **Free Plan** — 5 AI credits/month, no credit card required
- **Pro Plan ($9.99/mo)** — 50 credits, PDF download, S3 cloud storage
- **Enterprise Plan ($29.99/mo)** — 200 credits, priority support, all features
- Stripe Checkout + Webhooks for real-time subscription management
- Credit deduction per generation with plan enforcement

### 🔐 Security & Authentication
- **JWT dual-token system** — Short-lived access tokens + long-lived refresh tokens
- **Refresh token rotation** — New token issued on every refresh (invalidates old)
- **HttpOnly cookies** — XSS-safe token storage
- **bcrypt password hashing** (12 salt rounds)
- **Role-Based Access Control** — `USER` and `ADMIN` roles
- **Rate limiting** per IP and per endpoint
- **Helmet.js** security headers + CORS whitelist

### ☁️ Cloud-Native Infrastructure
- **AWS S3** — Generated PDF storage with presigned download URLs
- **Supabase PostgreSQL** — Fully managed, production-grade database
- **Docker** multi-stage builds with non-root user, `dumb-init`
- **Horizontal scalability** — Stateless backend, external session storage

### 📄 File Management
- PDF generation from AI output
- S3 upload on every generation (Pro/Enterprise)
- Presigned URL downloads (time-limited, secure)
- Generation history with full document retrieval

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| ![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black) | 19.2 | UI Framework |
| ![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white) | 7.x | Build Tool & Dev Server |
| ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white) | 4.x | Utility-first Styling |
| ![Zustand](https://img.shields.io/badge/Zustand-5-FF6B35?logo=react) | 5.x | Global State Management |
| ![React Router](https://img.shields.io/badge/React_Router-7-CA4245?logo=react-router&logoColor=white) | 7.x | Client-side Routing |
| ![Axios](https://img.shields.io/badge/Axios-1.x-5A29E4?logo=axios) | 1.x | HTTP Client + Interceptors |
| ![Lucide](https://img.shields.io/badge/Lucide_React-0.57-F56565) | 0.57 | Icon System |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| ![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white) | 20 LTS | Runtime |
| ![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white) | 4.x | REST API Framework |
| ![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma&logoColor=white) | 5.x | ORM + Migrations |
| ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white) | 16 | Primary Database |
| ![JWT](https://img.shields.io/badge/JWT-9.x-000000?logo=json-web-tokens&logoColor=pink) | 9.x | Auth Tokens |
| ![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?logo=stripe&logoColor=white) | Latest | Billing & Webhooks |

### AI & Cloud Services
| Service | Purpose |
|---|---|
| ![Groq](https://img.shields.io/badge/Groq-LLM_API-F55036) | Ultra-fast LLM inference (Llama 3, Mixtral) |
| ![Google Gemini](https://img.shields.io/badge/Google_Gemini-AI-4285F4?logo=google&logoColor=white) | Fallback LLM + advanced analysis |
| ![AWS S3](https://img.shields.io/badge/AWS_S3-Storage-FF9900?logo=amazon-aws&logoColor=white) | PDF document storage |
| ![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white) | Managed database |
| ![Stripe](https://img.shields.io/badge/Stripe-Billing-635BFF?logo=stripe&logoColor=white) | Subscriptions & webhooks |

### DevOps & Deployment
| Technology | Purpose |
|---|---|
| ![Docker](https://img.shields.io/badge/Docker-Containerization-2496ED?logo=docker&logoColor=white) | Multi-stage image builds |
| ![Docker Compose](https://img.shields.io/badge/Docker_Compose-Orchestration-2496ED?logo=docker&logoColor=white) | Local multi-container orchestration |
| ![Vercel](https://img.shields.io/badge/Vercel-Frontend_Deploy-000000?logo=vercel&logoColor=white) | Frontend hosting + edge CDN |
| ![Render](https://img.shields.io/badge/Render-Backend_Deploy-46E3B7?logo=render&logoColor=white) | Backend hosting |
| ![AWS EC2](https://img.shields.io/badge/AWS_EC2-Cloud_VM-FF9900?logo=amazon-aws&logoColor=white) | Docker production deployment |
| ![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI/CD-2088FF?logo=github-actions&logoColor=white) | Automated testing pipeline |
| ![Nginx](https://img.shields.io/badge/Nginx-Reverse_Proxy-009639?logo=nginx&logoColor=white) | Frontend reverse proxy in Docker |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                                  │
│                                                                      │
│   Browser  →  React 19 + Vite  →  Zustand Store  →  Axios Client   │
└────────────────────────────┬────────────────────────────────────────┘
                             │ HTTPS
          ┌──────────────────▼──────────────────┐
          │          VERCEL CDN / EDGE           │
          │   (vercel.json rewrites proxy API)   │
          └──────────┬───────────────┬──────────┘
                     │ /api/*        │ /* (SPA)
          ┌──────────▼─────┐  ┌──────▼──────┐
          │  Render Backend │  │ index.html  │
          │  (Node/Express) │  │ (React SPA) │
          └──────────┬──────┘  └─────────────┘
                     │
     ┌───────────────┼────────────────────┐
     │               │                    │
┌────▼────┐   ┌──────▼──────┐   ┌────────▼───────┐
│Supabase │   │  AI Services │   │   AWS S3       │
│PostgreSQL│  │  Groq/Gemini │   │  PDF Storage   │
└─────────┘   └─────────────┘   └────────────────┘
     │
┌────▼────────┐
│   Stripe    │
│  Webhooks   │
└─────────────┘
```

### Database Schema (ERD Overview)
```
User ──────────── CreditAccount (1:1)
     └──────────── Subscription   (1:1)
     └──────────── Generation[]   (1:N)
     └──────────── RefreshToken[] (1:N)
     └──────────── UserFile[]     (1:N)
```

### Authentication Flow
```
Register/Login → Access Token (15min) + Refresh Token (7d, httpOnly cookie)
                     │
              Axios Interceptor detects 401
                     │
              POST /auth/refresh → New Access Token
                     │
              Retry original request automatically
```

---

## 📁 Project Structure

```
vitacraft-ai-saas-platform/
│
├── 📁 backend/                     # Node.js REST API
│   ├── 📁 src/
│   │   ├── app.js                  # Express app entry, middleware, CORS
│   │   ├── 📁 api/v1/
│   │   │   ├── 📁 routes/          # Route definitions (auth, ai, files, user)
│   │   │   └── index.js            # API router mount point
│   │   ├── 📁 controllers/         # Request handlers (thin layer)
│   │   ├── 📁 services/            # Business logic (auth, AI, credits, S3, PDF)
│   │   ├── 📁 middleware/          # Auth, error handler, rate limiter, roles
│   │   ├── 📁 config/              # DB, Ollama, S3 connection configs
│   │   ├── 📁 validators/          # Joi/express-validator schemas
│   │   └── 📁 utils/               # API response, async handler, JWT, logger
│   ├── 📁 prisma/
│   │   ├── schema.prisma           # Full DB schema (7 models, 4 enums)
│   │   ├── seed.js                 # Database seeder
│   │   └── 📁 migrations/          # SQL migration history
│   ├── 📁 tests/
│   │   └── auth.test.js            # Jest integration tests
│   ├── Dockerfile                  # Multi-stage Docker build
│   ├── docker-entrypoint.sh        # Migrate → Seed → Start
│   └── package.json
│
├── 📁 frontend/                    # React 19 SPA
│   ├── 📁 src/
│   │   ├── 📁 pages/               # Dashboard, Login, Register, Generators
│   │   ├── 📁 components/          # AI forms, common UI, dashboard widgets
│   │   ├── 📁 context/             # AuthContext (React Context API)
│   │   ├── 📁 store/               # Zustand auth store with persistence
│   │   ├── 📁 hooks/               # useAuth, useCredits custom hooks
│   │   ├── 📁 api/                 # Axios API modules per feature
│   │   └── App.jsx                 # Root component + route definitions
│   ├── 📁 public/                  # Static assets (favicon, manifest, sitemap)
│   ├── vercel.json                 # Vercel SPA routing + API proxy
│   ├── nginx.conf                  # Production Nginx config
│   └── Dockerfile                  # Nginx-based production image
│
├── docker-compose.yml              # Full-stack local Docker orchestration
├── .github/workflows/ci.yml        # GitHub Actions CI pipeline
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL (or Supabase account)
- Docker & Docker Compose (optional)

### 1. Clone the Repository

```bash
git clone https://github.com/dinraj910/vitacraft-ai-saas-platform.git
cd vitacraft-ai-saas-platform
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Fill in your environment variables (see below)

npm install
npx prisma migrate dev --name init
node prisma/seed.js
npm run dev
```

Backend runs at: `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
cp .env.example .env
# Set VITE_API_BASE_URL=http://localhost:5000

npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 🐳 Docker Deployment

### Run Full Stack with Docker Compose

```bash
# Copy and fill environment file
cp .env.production.example .env

# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Check health
docker-compose ps
```

| Service | Port | Health Check |
|---|---|---|
| Frontend (Nginx) | `3000` | `nginx -t` |
| Backend (Node.js) | `5000` | `GET /health` |

### Docker Images on Docker Hub

```bash
# Pull production images
docker pull dinraj/vitacraft-backend:latest
docker pull dinraj/vitacraft-frontend:latest
```

### Backend Dockerfile Highlights
- ✅ **Multi-stage build** — deps stage + production stage (minimal image)
- ✅ **Non-root user** `nodeapp` — principle of least privilege
- ✅ **dumb-init** — proper PID 1 signal handling
- ✅ **Entrypoint script** — auto-runs `prisma migrate deploy` → `seed` → `node`

---

## ☁️ Cloud Deployment

### Option 1: Vercel + Render (Recommended)

| Layer | Platform | Auto-deploy |
|---|---|---|
| Frontend | Vercel | ✅ On every `git push` to `main` |
| Backend | Render | ✅ On every `git push` to `main` |

The `frontend/vercel.json` proxies `/api/*` → Render backend, eliminating CORS issues entirely. SPA routing is handled by a catch-all rewrite.

### Option 2: AWS EC2 + Docker

```bash
# On EC2 (Ubuntu)
sudo docker-compose pull
sudo docker-compose up -d

# App live at http://<EC2-PUBLIC-IP>:3000
```

### Stripe Webhook Setup (Production)

1. Register endpoint in Stripe Dashboard: `https://your-backend.onrender.com/api/v1/stripe/webhook`
2. Subscribe to events: `checkout.session.completed`, `customer.subscription.*`, `invoice.*`
3. Copy signing secret → set `STRIPE_WEBHOOK_SECRET` in your env

---

## 📡 API Reference

Base URL: `https://vitacraft-backend.onrender.com/api/v1`

### Authentication
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/auth/register` | Create new account | ❌ |
| `POST` | `/auth/login` | Login → access + refresh tokens | ❌ |
| `POST` | `/auth/refresh` | Rotate refresh token | 🍪 Cookie |
| `POST` | `/auth/logout` | Revoke refresh token | 🍪 Cookie |

### AI Generation
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/ai/resume` | Generate AI resume | ✅ JWT |
| `POST` | `/ai/cover-letter` | Generate cover letter | ✅ JWT |
| `POST` | `/ai/job-analysis` | Analyze job description | ✅ JWT |
| `POST` | `/ai/resume-analysis` | Score & analyze resume | ✅ JWT |

### User & Credits
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/user/profile` | Get profile + credits + plan | ✅ JWT |
| `GET` | `/user/history` | Paginated generation history | ✅ JWT |
| `GET` | `/files/:id/download` | Presigned S3 download URL | ✅ JWT |

### Billing
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/stripe/create-checkout` | Create Stripe checkout session | ✅ JWT |
| `POST` | `/stripe/webhook` | Stripe event handler | 🔑 Stripe Sig |

### Response Format
```json
{
  "success": true,
  "message": "Resume generated successfully",
  "data": {
    "content": "...",
    "creditsRemaining": 4,
    "fileUrl": "https://s3.amazonaws.com/..."
  }
}
```

---

## 🔧 Environment Variables

### Backend `.env`

```env
# Server
NODE_ENV=production
PORT=5000

# Database (Supabase)
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# JWT
JWT_ACCESS_SECRET=your_64_char_secret
JWT_REFRESH_SECRET=your_64_char_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# AI Services
GROQ_API_KEY=gsk_...
GEMINI_API_KEY=AIza...

# AWS S3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=ap-south-1
S3_BUCKET_NAME=vitacraft-documents

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...

# CORS
FRONTEND_URL=https://vitacraft-ai.vercel.app
```

### Frontend `.env`

```env
VITE_API_BASE_URL=https://vitacraft-backend.onrender.com
```

---

## ⚙️ CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push to `main`:

```
Push to main
    │
    ├─ 1. Checkout code
    ├─ 2. Setup Node.js 20
    ├─ 3. Install dependencies
    ├─ 4. Run database migrations (test DB)
    ├─ 5. Seed test database
    ├─ 6. Run Jest integration tests
    └─ ✅ / ❌ Status badge
```

Tests cover:
- User registration & login
- JWT access/refresh token flow
- Protected route authorization
- Credit deduction on generation
- Error handling (400, 401, 403, 429)

---

## 🔒 Security

| Layer | Implementation |
|---|---|
| **Password Storage** | bcrypt with 12 salt rounds |
| **Token Security** | HttpOnly cookies, SameSite=None in production, Secure flag |
| **Token Rotation** | Refresh tokens invalidated on every use |
| **API Security** | Helmet.js (15+ security headers) |
| **Rate Limiting** | Per-IP and per-endpoint (express-rate-limit) |
| **Input Validation** | Schema validation on all inputs |
| **CORS** | Strict origin whitelist |
| **File Access** | S3 presigned URLs (time-limited, no public ACL) |
| **Container Security** | Non-root user, read-only where possible |

---

## 🧪 Running Tests

```bash
cd backend

# Set test environment variables
export NODE_ENV=test
export DATABASE_URL=postgresql://...

# Run all tests
npm test

# Run with coverage
npm test -- --coverage
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 About the Developer

<div align="center">

### DINRAJ K DINESH

*Full-Stack Software Engineer | Cloud & DevOps Enthusiast | AI/ML Explorer*

</div>

VitaCraft AI is a capstone-level project built to demonstrate **end-to-end software engineering capability** — from database schema design and secure API development to cloud deployment and production-grade DevOps practices.

### Core Expertise Demonstrated in This Project

| Domain | Skills |
|---|---|
| **Backend Engineering** | REST API design, authentication systems, multi-tenant architecture, ORM, database migrations |
| **Frontend Engineering** | React ecosystem, state management (Zustand + Context), custom hooks, responsive UI |
| **Cloud Computing** | AWS S3, EC2 deployment, Supabase managed PostgreSQL, Vercel edge CDN, Render PaaS |
| **DevOps & Docker** | Multi-stage Dockerfile, Docker Compose orchestration, Docker Hub publishing, Nginx config |
| **CI/CD** | GitHub Actions pipelines, automated testing, environment secret management |
| **Security** | JWT dual-token auth, token rotation, bcrypt, Helmet.js, CORS, rate limiting |
| **Payment Integration** | Stripe Checkout, webhook event handling, subscription lifecycle management |
| **AI Integration** | Cloud LLM APIs (Groq, Gemini), prompt engineering, multi-model fallback strategy |

### Connect

[![GitHub](https://img.shields.io/badge/GitHub-dinraj910-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/dinraj910)
[![Docker Hub](https://img.shields.io/badge/Docker_Hub-dinraj-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://hub.docker.com/u/dinraj)
[![Email](https://img.shields.io/badge/Email-dinrajdinesh564@gmail.com-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:dinrajdinesh564@gmail.com)
[![Live App](https://img.shields.io/badge/Live_App-vitacraft--ai.vercel.app-6366f1?style=for-the-badge&logo=vercel&logoColor=white)](https://vitacraft-ai.vercel.app)

---

<div align="center">

**⭐ If this project helped you or impressed you, please give it a star!**

*Built with ❤️ and a lot of ☕ by DINRAJ K DINESH*

</div>
