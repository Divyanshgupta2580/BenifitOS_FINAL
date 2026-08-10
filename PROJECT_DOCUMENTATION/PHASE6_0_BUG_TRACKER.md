# BenefitOS — Phase 6.0 Bug Tracker

---

## Identified Defects & Architectural Decisions Log

### BUG-001: JWT Token Storage in Browser `localStorage`
- **Severity**: MEDIUM
- **Area**: Authentication & Security
- **File**: `apps/frontend/src/services/storage.service.ts`
- **Root Cause**: Mobile migration replaced native encrypted storage (`AsyncStorage` / `SecureStore`) with browser `window.localStorage`.
- **Evidence**: `window.localStorage.getItem('access_token')` and `refresh_token` are accessible via JavaScript execution.
- **Impact / Security Risk**: If an XSS vulnerability exists on the client domain, malicious scripts can read tokens.
- **Architectural Decision**: **DEFERRED TO DEDICATED AUTHENTICATION HARDENING PHASE (Phase 6.1)**. HttpOnly cookie blueprint documented in `PHASE6_0_AUTHENTICATION_DECISION.md`.
- **Status**: DEFERRED (Documented Architectural Decision)

---

### BUG-002: Legacy `EXPO_PUBLIC_` Environment Variable Naming in `.env.example`
- **Severity**: LOW
- **Area**: Configuration / DevOps
- **File**: `apps/frontend/.env.example`
- **Root Cause**: `.env.example` file contained `EXPO_PUBLIC_API_URL` and `EXPO_PUBLIC_WS_URL` from Expo setup.
- **Evidence**: `api-client.ts` uses fallback checking `import.meta.env.VITE_API_URL || (import.meta.env as any).EXPO_PUBLIC_API_URL`.
- **Resolution**: Updated `apps/frontend/.env.example` to document standard Vite environment variables `VITE_API_URL` and `VITE_WS_URL`.
- **Status**: RESOLVED / FIXED

---

### BUG-003: Transitive Mobile Package Residuals & Stale Lockfile Metadata
- **Severity**: LOW
- **Area**: Dependency Graph / Package Management
- **File**: `apps/frontend/package-lock.json`
- **Root Cause**: `apps/frontend/package.json` contains 0 mobile packages, but `package-lock.json` retains stale transitive metadata from before cleanup. Additionally, `npm` lockfile exists alongside `pnpm-workspace.yaml`.
- **Evidence**: `apps/frontend/package.json` has zero mobile dependencies.
- **Required Fix**: Regenerate lockfile via `pnpm install` across the monorepo workspace when network access is enabled.
- **Status**: DEFERRED (Per Node Modules Cleanup Rule)
