# VitaCraft AI — Vercel + Render Cloud Deployment Guide

**Subject:** Cloud Computing — Assignment  
**Project:** VitaCraft AI SaaS Platform  
**Author:** DINRAJ K DINESH  
**Live URL (after deployment):** `https://YOUR_APP.vercel.app`

---

## Why Vercel + Render? (Free Tier)

| Service | Host | Why |
|---|---|---|
| **Frontend** (React + Vite) | **Vercel** | Built for React/Vite. Free forever. Global CDN. Auto-deploy from GitHub. |
| **Backend** (Node.js + Express) | **Render** | Free web service. Always-on (no serverless timeout). Supports Express, long-running LLM calls, Stripe webhooks. |
| **Database** | Supabase | External managed PostgreSQL — unchanged |
| **Storage** | AWS S3 | External — unchanged |

**How requests flow (no CORS issues):**

```
Browser → https://vitacraft.vercel.app/api/v1/...
                       │
          Vercel Edge rewrites (vercel.json)
                       │
                       ▼
          https://vitacraft-backend.onrender.com/api/v1/...
                       │
                  Render (Node.js)
```

Vercel proxies all `/api/*` traffic to Render server-to-server, so from the browser's perspective everything is same-origin. **No CORS issues. Cookies work perfectly.**

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Step 1 — Deploy Backend to Render](#2-step-1--deploy-backend-to-render)
3. [Step 2 — Update vercel.json with Render URL](#3-step-2--update-verceljson-with-render-url)
4. [Step 3 — Deploy Frontend to Vercel](#4-step-3--deploy-frontend-to-vercel)
5. [Step 4 — Set FRONTEND_URL on Render](#5-step-4--set-frontend_url-on-render)
6. [Step 5 — Configure Stripe Webhook](#6-step-5--configure-stripe-webhook)
7. [Step 6 — Verify End-to-End](#7-step-6--verify-end-to-end)
8. [Re-deploy After Code Changes](#8-re-deploy-after-code-changes)
9. [Troubleshooting](#9-troubleshooting)
10. [Full Environment Variables Reference](#10-full-environment-variables-reference)

---

## 1. Prerequisites

- GitHub repository pushed: `github.com/dinraj910/vitacraft-ai-saas-platform`
- Accounts (all free):
  - [render.com](https://render.com) — sign up with GitHub
  - [vercel.com](https://vercel.com) — sign up with GitHub
  - Supabase project running (already set up)
  - Stripe test-mode account (already set up)

Push all current local changes to GitHub first:

```bash
git add .
git commit -m "chore: vercel + render deployment config"
git push origin main
```

---

## 2. Step 1 — Deploy Backend to Render

### 2.1 Create a New Web Service

1. Go to **[render.com/dashboard](https://dashboard.render.com)**
2. Click **New → Web Service**
3. Click **Connect a repository** → Select `vitacraft-ai-saas-platform`
4. Fill in the settings:

| Field | Value |
|---|---|
| **Name** | `vitacraft-backend` |
| **Region** | Oregon (US West) — or closest to you |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | Node |
| **Build Command** | `npm install && npx prisma generate && npx prisma migrate deploy && node prisma/seed.js` |
| **Start Command** | `node src/app.js` |
| **Instance Type** | **Free** |

5. Click **Advanced** → scroll to **Environment Variables** → click **Add Environment Variable** and add all variables from the table below:

### 2.2 Environment Variables on Render

Click **Add Environment Variable** for each row:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `DATABASE_URL` | `postgresql://postgres.xxxx:pass@aws-0-...pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | `postgresql://postgres.xxxx:pass@aws-0-...supabase.com:5432/postgres` |
| `JWT_ACCESS_SECRET` | *(copy from your local `.env`)* |
| `JWT_REFRESH_SECRET` | *(copy from your local `.env`)* |
| `JWT_ACCESS_EXPIRES_IN` | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | `7d` |
| `GROQ_API_KEY` | *(your Groq key)* |
| `GEMINI_API_KEY` | *(your Gemini key)* |
| `COHERE_API_KEY` | *(your Cohere key)* |
| `HF_API_KEY` | *(your HuggingFace key)* |
| `AWS_ACCESS_KEY_ID` | *(your AWS key)* |
| `AWS_SECRET_ACCESS_KEY` | *(your AWS secret)* |
| `AWS_REGION` | `us-east-2` |
| `AWS_S3_BUCKET` | `vitacraft-ai-files` |
| `STRIPE_SECRET_KEY` | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | *(leave blank for now — fill after Step 5)* |
| `STRIPE_PRICE_FREE` | `price_free_placeholder` |
| `STRIPE_PRICE_PRO` | `price_1T67MHKiI4vJwdgAoH00qkmD` |
| `STRIPE_PRICE_ENTERPRISE` | `price_1T67NWKiI4vJwdgAnJSMc8Cv` |
| `FRONTEND_URL` | *(leave blank for now — fill after Step 4)* |

6. Click **Create Web Service**

### 2.3 Watch the Build Logs

Render will:
1. Clone the `backend/` directory
2. Run `npm install`
3. Run `npx prisma generate`
4. Run `npx prisma migrate deploy` → creates all DB tables
5. Run `node prisma/seed.js` → seeds FREE/PRO/ENTERPRISE plans
6. Start `node src/app.js`

**Expected final log line:**
```
info: 🚀 VitaCraft AI Backend running on port 5000
info: ✅ LLM providers ready: Groq → Gemini → Cohere → HuggingFace
```

### 2.4 Copy Your Render URL

After the build succeeds, your backend is live at:
```
https://vitacraft-backend.onrender.com
```
*(The exact URL is shown at the top of the Render service page)*

**Test it:**
```
https://vitacraft-backend.onrender.com/health
```
Expected response:
```json
{ "success": true, "message": "VitaCraft AI API is healthy", "data": { "status": "ok" } }
```

---

## 3. Step 2 — Update vercel.json with Render URL

Open `frontend/vercel.json` in your editor and replace the placeholder with your real Render URL:

**File: `frontend/vercel.json`**
```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://vitacraft-backend.onrender.com/api/$1"
    }
  ]
}
```

> Replace `vitacraft-backend.onrender.com` with your actual Render service URL.

Commit and push:

```bash
git add frontend/vercel.json
git commit -m "chore: set render backend url in vercel.json"
git push origin main
```

---

## 4. Step 3 — Deploy Frontend to Vercel

### 4.1 Import Project

1. Go to **[vercel.com/new](https://vercel.com/new)**
2. Click **Import Git Repository** → Select `vitacraft-ai-saas-platform`
3. Configure the project:

| Field | Value |
|---|---|
| **Project Name** | `vitacraft-ai` |
| **Framework Preset** | **Vite** |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

4. No environment variables needed on Vercel — the `vercel.json` rewrite handles routing to Render.

5. Click **Deploy**

### 4.2 Wait for Build

Vercel will:
1. Install dependencies
2. Run `npm run build` (Vite compiles React → `dist/`)
3. Deploy static files to global CDN
4. Apply `vercel.json` rewrites

**Your live frontend URL:**
```
https://vitacraft-ai.vercel.app
```
*(or similar — shown on the Vercel dashboard after deploy)*

---

## 5. Step 4 — Set FRONTEND_URL on Render

Now that you have your Vercel URL, tell the backend where to redirect after Stripe checkout.

1. Go to **Render dashboard → vitacraft-backend → Environment**
2. Find `FRONTEND_URL` → click **Edit**
3. Set the value to your Vercel URL (no trailing slash):
   ```
   https://vitacraft-ai.vercel.app
   ```
4. Click **Save Changes** → Render will **automatically redeploy** the backend

This is critical — after a successful Stripe payment, the backend redirects the browser to `FRONTEND_URL/dashboard?checkout=success`. Without this, it would try to redirect to `localhost` or `undefined`.

---

## 6. Step 5 — Configure Stripe Webhook

The Stripe webhook must point to your **Render backend URL** — not localhost.

### 6.1 Register Webhook in Stripe Dashboard

1. Go to **[dashboard.stripe.com/test/webhooks](https://dashboard.stripe.com/test/webhooks)**
2. Click **Add endpoint**
3. **Endpoint URL:**
   ```
   https://vitacraft-backend.onrender.com/api/v1/billing/webhook
   ```
4. Under **"Select events"**, add exactly these 4:
   - `checkout.session.completed`
   - `invoice.paid`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click **Add endpoint**
6. Click **Reveal** under **Signing secret** → copy the `whsec_...` value

### 6.2 Add Webhook Secret to Render

1. Go to **Render → vitacraft-backend → Environment**
2. Add/update:
   | Key | Value |
   |---|---|
   | `STRIPE_WEBHOOK_SECRET` | `whsec_xxxx` *(from Dashboard above)* |
3. Click **Save Changes** → auto-redeploy

### 6.3 Test the Webhook

In Stripe Dashboard → your webhook endpoint → click **Send test webhook** → choose `checkout.session.completed` → **Send**.

Expected: ✅ `200 — {"received": true}`

Or test directly via curl:
```bash
curl -X POST https://vitacraft-backend.onrender.com/api/v1/billing/webhook \
  -H "Content-Type: application/json" \
  -d '{"test":true}'
```
Expected response (proves route is live and verifying signatures):
```json
{"error":"Webhook Error: No signatures found matching the expected signature for payload..."}
```

---

## 7. Step 6 — Verify End-to-End

### Full Flow Checklist

| Test | URL | Expected |
|---|---|---|
| Frontend loads | `https://vitacraft-ai.vercel.app` | React login page |
| Backend health | `https://vitacraft-backend.onrender.com/health` | `{"success":true}` |
| API via Vercel proxy | `https://vitacraft-ai.vercel.app/api/v1/health` *(same as above via rewrite)* | `{"success":true}` |
| Register user | Form on app | 201, redirects to dashboard |
| Login | Form on app | 200, shows credits = 5 |
| AI generation | Resume/Cover Letter form | LLM response streamed |
| Stripe checkout | Dashboard → Upgrade → PRO | Stripe test card page |
| Stripe test card | Card: `4242 4242 4242 4242`, exp: `12/28`, CVV: `123` | Payment succeeds |
| Post-payment redirect | After payment | Redirects to Vercel `/dashboard?checkout=success` |
| Credits updated | Dashboard after payment | Shows 55 credits (5 + 50 PRO) |

---

## 8. Re-deploy After Code Changes

Both services auto-deploy when you push to `main`.

```bash
# Make code changes locally
git add .
git commit -m "feat: your change description"
git push origin main
# Vercel and Render both auto-deploy within 1-2 minutes
```

**To manually trigger re-deploy:**
- **Render:** Dashboard → vitacraft-backend → **Manual Deploy** → Deploy latest commit
- **Vercel:** Dashboard → vitacraft-ai → **Deployments** → **Redeploy**

---

## 9. Troubleshooting

### Frontend shows blank page / 404 on refresh

Vercel `vercel.json` must be inside the `frontend/` directory (not root).  
Verify the file exists at `frontend/vercel.json`:
```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "https://YOUR_RENDER_URL/api/$1" }
  ]
}
```

### API calls return 502 / Cannot connect to backend

- Check Render → vitacraft-backend is running (green dot)
- Render free tier **sleeps after 15 minutes of inactivity**.  
  First request after sleep takes **up to 60 seconds** — this is normal.  
  After the cold start, all subsequent requests are fast.

### Stripe payment redirects to localhost

- `FRONTEND_URL` on Render is not set to your Vercel URL.
- Go to Render → Environment → set `FRONTEND_URL=https://vitacraft-ai.vercel.app`

### Login works but refresh token fails (401 on refresh)

- Cookie `SameSite=None; Secure` is required for cross-origin cookies in production.
- The code already handles this (`sameSite: 'none'` when `NODE_ENV=production`).
- Make sure `NODE_ENV=production` is set on Render.

### Render build fails at `prisma migrate deploy`

- Check `DATABASE_URL` and `DIRECT_URL` are correctly set in Render environment.
- The `DIRECT_URL` must be the **non-pooler** connection (port 5432), not the pgBouncer pooler.

---

## 10. Full Environment Variables Reference

### Render (Backend) — all required

```env
NODE_ENV=production
PORT=5000

DATABASE_URL=postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres

JWT_ACCESS_SECRET=your-strong-random-secret-here
JWT_REFRESH_SECRET=your-different-random-secret-here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

GROQ_API_KEY=gsk_...
GEMINI_API_KEY=AIza...
COHERE_API_KEY=...
HF_API_KEY=hf_...

AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-2
AWS_S3_BUCKET=vitacraft-ai-files

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_FREE=price_free_placeholder
STRIPE_PRICE_PRO=price_1T67MHKiI4vJwdgAoH00qkmD
STRIPE_PRICE_ENTERPRISE=price_1T67NWKiI4vJwdgAnJSMc8Cv

FRONTEND_URL=https://vitacraft-ai.vercel.app
```

### Vercel (Frontend) — none required

All routing is handled by `frontend/vercel.json`. No environment variables needed on Vercel.

---

## Quick Command Summary

```bash
# 1. Push code to GitHub (triggers auto-deploy on both platforms)
git add .
git commit -m "deploy: vercel + render production"
git push origin main

# 2. After Render gives you its URL, update vercel.json:
# Edit frontend/vercel.json → replace REPLACE_WITH_YOUR_RENDER_URL
# Then:
git add frontend/vercel.json
git commit -m "chore: set render backend url"
git push origin main

# 3. Test backend health
curl https://vitacraft-backend.onrender.com/health

# 4. Test Stripe webhook (from any terminal, expects 400 with sig error)
curl -X POST https://vitacraft-backend.onrender.com/api/v1/billing/webhook \
  -H "Content-Type: application/json" \
  -d '{"test":true}'
```

---

## Deployment Summary

| Item | URL |
|---|---|
| **Live App** | `https://vitacraft-ai.vercel.app` |
| **API (via Vercel proxy)** | `https://vitacraft-ai.vercel.app/api/v1/health` |
| **Backend direct** | `https://vitacraft-backend.onrender.com/health` |
| **Stripe webhook endpoint** | `https://vitacraft-backend.onrender.com/api/v1/billing/webhook` |
| **Docker Hub** | `https://hub.docker.com/u/dinraj` |
| **GitHub** | `https://github.com/dinraj910/vitacraft-ai-saas-platform` |

---

*VitaCraft AI — Built with React 19, Node.js 20, Prisma, Supabase, Stripe, AWS S3, deployed on Vercel + Render*
