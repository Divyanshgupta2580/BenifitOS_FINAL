# BenefitOS — Phase 4.3 Deployment Sequence
**Production Deployment Step-by-Step Sequence**

---

## 1. Step-by-Step Deployment Sequence

1. **Checkout & Install Dependencies**:
   - `git checkout release/v1.0.0`
   - `pnpm install --frozen-lockfile`
2. **Build Web & Backend Artifacts**:
   - `pnpm --filter frontend build` -> Generates `apps/frontend/dist`
   - `pnpm --filter backend build` -> Generates `apps/backend/dist`
3. **Database Pre-Migration Snapshot**:
   - Execute managed database snapshot on production PostgreSQL instance.
4. **Execute Safe Database Migration**:
   - Run `npx prisma migrate deploy` in backend container.
5. **Start Application Process**:
   - Run `NODE_ENV=production node apps/backend/dist/main.js`.
6. **Execute Health Checks**:
   - Query `GET /api/v1/health/readiness` and `GET /api/v1/health/liveness`.
