# BenefitOS — Phase 4.3 Environment Contract
**Production Environment Variables & Secret Isolation Contract**

---

## 1. Production Backend Environment Contract (`apps/backend/.env.example`)

| Variable Name | Exposure | Required Value / Purpose |
| :--- | :--- | :--- |
| `NODE_ENV` | Backend Only | Set to `production` for HTTPS secure cookies |
| `PORT` | Backend Only | Container listening port (default `4000`) |
| `CORS_ORIGIN` | Backend Only | Production allowed Web origin (e.g. `https://benefitos.gov.in`) |
| `DATABASE_URL` | Backend Only | PostgreSQL connection URI |
| `REDIS_URL` | Backend Only | Redis cache & revocation URI |
| `JWT_SECRET` | Backend Only | Min 32-byte JWT signing key |
| `JWT_REFRESH_SECRET` | Backend Only | Min 32-byte JWT refresh key |
| `GEMINI_API_KEY` | Backend Only | Google Gemini AI Vision OCR key |

---

## 2. Frontend Browser-Visible Environment Contract (`apps/frontend/.env.example`)

| Variable Name | Exposure | Purpose |
| :--- | :--- | :--- |
| `VITE_API_URL` | Public / Web Browser | Base REST API URL (`https://benefitos.gov.in/api/v1`) |
| `VITE_WS_URL` | Public / Web Browser | Base WebSocket URL (`wss://benefitos.gov.in/ws`) |
