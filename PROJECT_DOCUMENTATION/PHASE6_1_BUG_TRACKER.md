# BenefitOS — Phase 6.1 Bug Tracker

---

## Defect Resolution Summary

### BUG-001: JWT Token Storage in Browser `localStorage`
- **Severity**: MEDIUM
- **Area**: Authentication & Security
- **File**: `apps/backend/src/modules/auth/auth.controller.ts`, `apps/frontend/src/services/storage.service.ts`
- **Resolution**: Refactored NestJS `AuthController` to return `refresh_token` as an HttpOnly, Secure, SameSite=Lax/Strict cookie (`Path=/api/v1/auth`). `storage.service.ts` explicitly blocks storing `refresh_token` in `localStorage`.
- **Status**: RESOLVED

---

### BUG-002: Legacy `EXPO_PUBLIC_` Environment Variable Naming in `.env.example`
- **Severity**: LOW
- **Area**: Configuration / DevOps
- **File**: `apps/frontend/.env.example`
- **Resolution**: Updated `apps/frontend/.env.example` to document standard Vite variables `VITE_API_URL` and `VITE_WS_URL`.
- **Status**: RESOLVED

---

### BUG-003: Transitive Mobile Package Residuals & Dual Lockfile Inconsistency
- **Severity**: LOW
- **Area**: Dependency Graph / Package Management
- **File**: `apps/frontend/package-lock.json`
- **Resolution**: Removed `apps/frontend/package-lock.json` (`npm`), resolving dual lockfile conflict with `pnpm-workspace.yaml`.
- **Status**: RESOLVED

---

## Defect Summary Count:
* **Critical**: 0
* **High**: 0
* **Medium**: 0
* **Low**: 0
* **Total Open Bugs**: 0
