# VitaCraft AI — Running the Application

## Every-Time Startup (3 Terminals)

Open **3 separate PowerShell terminals** and run one command in each.

---

### Terminal 1 — Backend API

```powershell
cd "D:\Cloud Web Projects\Assignment-1\VitaCraft AI\backend"
npm run dev
```

- Runs on **http://localhost:5000**
- Health check: **http://localhost:5000/health**

---

### Terminal 2 — Frontend

```powershell
cd "D:\Cloud Web Projects\Assignment-1\VitaCraft AI\frontend"
npm run dev
```

- Runs on **http://localhost:5173**
- Open this URL in your browser to use the app

---

### Terminal 3 — Stripe Webhook (required for billing/payments)

After a fresh shell restart, `stripe` will be on PATH:

```powershell
stripe listen --forward-to http://localhost:5000/api/v1/billing/webhook
```

If `stripe` is not recognized yet, use the full path (replace `YOUR_STRIPE_KEY` with the key from your `.env`):

```powershell
& "C:\Users\hp\AppData\Local\Microsoft\WinGet\Packages\Stripe.StripeCli_Microsoft.Winget.Source_8wekyb3d8bbwe\stripe.exe" listen --forward-to http://localhost:5000/api/v1/billing/webhook --api-key YOUR_STRIPE_KEY
```

> Keep this terminal running whenever you test payments. It forwards Stripe events to your local server.

---

## One-Time Setup (Fresh Clone / Reset Only)

Only run these if you've freshly cloned the repo or reset the database.

```powershell
# Backend
cd "D:\Cloud Web Projects\Assignment-1\VitaCraft AI\backend"
npm install
npx prisma generate
npx prisma db seed

# Frontend
cd "D:\Cloud Web Projects\Assignment-1\VitaCraft AI\frontend"
npm install
```

---

## Quick Reference

| Service       | URL / Command                          |
|--------------|----------------------------------------|
| Frontend app  | http://localhost:5173                 |
| Backend API   | http://localhost:5000                 |
| Health check  | http://localhost:5000/health          |
| Prisma Studio | `npm run db:studio` (in backend dir)  |

---

## Test Payment Card (Stripe Test Mode)

| Field      | Value                  |
|-----------|------------------------|
| Card No.  | `4242 4242 4242 4242`  |
| Expiry    | Any future date        |
| CVC       | Any 3 digits           |
| ZIP       | Any 5 digits           |

No real charges are made — this is Stripe **test mode** only.
