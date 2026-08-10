# BenefitOS — Phase 4.1 Configuration Report
**Environment Variables & Template Alignment Report**

---

## 1. Backend Environment Template (`apps/backend/.env.example`)

- `PORT`: Service port (default `4000`)
- `NODE_ENV`: Application environment (`development` / `production`)
- `CORS_ORIGIN`: Comma-separated allowed origins (e.g. `http://localhost:3000,http://localhost:5173`)
- `DATABASE_URL`: PostgreSQL connection URI (`postgresql://postgres:password@localhost:5432/benefitos`)
- `REDIS_URL`: Redis connection URI (`redis://localhost:6379`)
- `JWT_SECRET`: JWT signing secret
- `JWT_REFRESH_SECRET`: JWT refresh token secret
- `GEMINI_API_KEY`: Google Gemini AI Vision OCR key

---

## 2. Frontend Environment Template (`apps/frontend/.env.example`)

- `VITE_API_URL`: Public REST API Base URL (`http://localhost:4000/api/v1`)
- `VITE_WS_URL`: Public Realtime WebSocket Gateway URL (`ws://localhost:4000/ws`)
