# BenefitOS — Phase 4.3 Deployment Architecture
**Production Deployment & Container Infrastructure Architecture**

---

## 1. Production Container Architecture

BenefitOS is architected for reproducible containerized production deployment:

```
                                [ Cloudflare CDN / NGINX ]
                                            │
                                            ▼
                    ┌───────────────────────────────────────────────┐
                    │ Web SPA Static Bundle (React 18 + Vite 6)      │
                    └───────────────────────────────────────────────┘
                                            │
                                            ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ Docker / Render Container (Node.js 20 NestJS API Monolith :4000)                  │
│                                                                                  │
│  - REST API Engine (/api/v1)                                                     │
│  - Socket.IO Realtime Gateway (/ws)                                              │
│  - Terminus Health & Readiness Endpoints (/api/v1/health)                        │
└──────────────────────────────────────────────────────────────────────────────────┘
                 │                                        │
                 ▼                                        ▼
┌────────────────────────────────┐       ┌────────────────────────────────┐
│ Managed PostgreSQL 15+ Database│       │ Managed Redis Cache Engine     │
│ (Prisma ORM 6.3.0)             │       │ (BullMQ & Token Revocation)    │
└────────────────────────────────┘       └────────────────────────────────┘
```

---

## 2. Deployment Isolation & Security Boundaries

- **Browser-Visible Client Layer**: Contains static Web SPA build assets (`apps/frontend/dist`). Receives `VITE_API_URL` and `VITE_WS_URL`.
- **Backend Service Layer**: Isolated inside Docker container / backend host. Receives `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `GEMINI_API_KEY`.
