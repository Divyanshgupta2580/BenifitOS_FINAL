# BenefitOS — Complete Codebase Audit Phase 3 Remediation Plan
**Recommended Production Deployment Remediation Sequence**

---

## 1. Step-by-Step Remediation Plan

### Step 1: Provision Production Environment Variables
- Populate `GEMINI_API_KEY`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `DATABASE_URL`, and `REDIS_URL` in production backend hosting environment.
- Set `NODE_ENV=production` and `CORS_ORIGIN=https://benefitos.gov.in`.

### Step 2: Deploy Production Staging Gateways
- Obtain official UIDAI e-KYC SSL client certificates and DigiLocker production OAuth client credentials.
- Test e-KYC OTP verification against staging endpoints.

### Step 3: Run Database Migrations & Build Pipeline
- Execute `npx prisma migrate deploy` in production CD job.
- Deploy Vite Web SPA build artifacts to production Web CDN / host.
