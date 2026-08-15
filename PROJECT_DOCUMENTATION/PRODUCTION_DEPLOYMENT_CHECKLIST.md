# BenefitOS — Production Deployment Checklist

**Repository:** `Divyanshgupta2580/BenifitOS_FINAL`  
**Governing Standard:** `AI_INSTRUCTIONS.md`  
**Version:** Production Release v1.0.0  
**Date:** August 14, 2026

---

## 1. Repository Security & Hygiene

- [x] `.env` is omitted from version control (`.gitignore` enforces isolation).
- [x] Zero hardcoded JWT fallback keys or default signing secrets in codebase.
- [x] Zero API keys or private database connection strings committed.
- [x] Production environment template `.env.example` provides safe variable names only.

---

## 2. Environment Variables & Secret Provisioning

Prior to starting the production instance, configure the following environment variables:

| Variable | Required | Production Recommendation |
| :--- | :---: | :--- |
| `PORT` | Optional | Default `4000` (or platform assigned) |
| `NODE_ENV` | **Yes** | `production` |
| `API_PREFIX` | Optional | `api/v1` |
| `CORS_ORIGIN` | **Yes** | Comma-delimited list of production frontend domains (e.g. `https://benefitos.gov.in`) |
| `DATABASE_URL` | **Yes** | PostgreSQL connection string with SSL (`sslmode=require`) |
| `REDIS_URL` | **Yes** | Upstash / Redis TLS connection string (`rediss://...`) |
| `SECURITY_STATE_MODE`| **Yes** | `distributed` (enforces fail-closed token revocation) |
| `JWT_SECRET` | **Yes** | High-entropy 32+ character random string |
| `JWT_EXPIRATION` | Optional | `15m` |
| `JWT_REFRESH_SECRET` | **Yes** | High-entropy 32+ character random string |
| `JWT_REFRESH_EXPIRATION`| Optional | `7d` |
| `GEMINI_API_KEY` | **Yes** | Valid Google GenAI API key with outbound network access |
| `SMTP_HOST` | **Yes** | Production mail transfer agent (e.g., `smtp.gov.in`) |
| `SMTP_PORT` | **Yes** | `587` (STARTTLS) or `465` (TLS) |
| `SMTP_USER` | **Yes** | SMTP authentication username |
| `SMTP_PASS` | **Yes** | SMTP authentication password |
| `SMTP_FROM` | **Yes** | `noreply@benefitos.gov.in` |
| `STORAGE_PROVIDER` | **Yes** | `local`, `s3`, or `supabase` |

---

## 3. Database Migration & Deployment Procedure

1. **Verify Connectivity:**
   ```bash
   npx prisma validate
   ```
2. **Apply Migrations Safely:**
   ```bash
   npx prisma migrate deploy
   ```
   *Note: Never execute `prisma migrate reset` in production.*
3. **Seed Baseline Welfare Schemes (First-time setup only):**
   ```bash
   npx prisma db seed
   ```

---

## 4. Redis Distributed Cache & Security State

- Verify Redis TLS connection string (`rediss://`).
- Ensure `SECURITY_STATE_MODE=distributed` so that token revocation fails closed in multi-instance deployments.

---

## 5. Backend Service Deployment

- **Build Command:**
  ```bash
  npm run build
  ```
- **Start Command:**
  ```bash
  npm run start:prod
  ```
- **Health Check Probes:**
  - Liveness: `GET /api/v1/health/liveness` (HTTP 200 OK)
  - Readiness: `GET /api/v1/health/readiness` (HTTP 200 OK)

---

## 6. Frontend Web Client Deployment

- **Build Command:**
  ```bash
  npm run build
  ```
- **Static Hosting:**
  - Deploy `apps/frontend/dist/` to CDN / edge server (e.g. Nginx, Cloudflare, Vercel).
  - Configure SPA fallback routing (`index.html` on 404).

---

## 7. WebSocket Gateway

- Endpoint: `wss://<DOMAIN>/ws`
- Verify WebSocket CORS headers accept connections from the production frontend domain.

---

## 8. Post-Deployment External Verifications

Once deployed to the live production network:
1. **Live Gemini AI Verification:**
   - Execute test query in `/api/v1/ai/chat` to verify Google GenAI inference.
2. **Live SMTP Email Verification:**
   - Trigger `/api/v1/auth/forgot-password` with a test account and confirm delivery of the password reset link.

---

## 9. Rollback & Backup Procedures

1. **Database Backups:**
   - Take snapshot before applying migrations:
     `pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql`
2. **Rollback Strategy:**
   - If deployment fails, route traffic back to previous container / build hash.
   - Database rollbacks must be executed via backward-compatible migration steps.
