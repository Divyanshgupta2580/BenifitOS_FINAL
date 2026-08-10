# BenefitOS — Changelog

## [4.1.0] - 2026-08-10

### Production Environment & CORS Hardening (Phase 4.1)
- **Environment-Driven CORS Allowlist**: Updated `main.ts` to construct allowed origin list dynamically from comma-separated `process.env.CORS_ORIGIN`, supporting explicit development origins (`http://localhost:3000`, `http://localhost:5173`) while disallowing wildcard `*` with credentials.
- **Dynamic Production Cookie Security**: Hardened `auth.controller.ts` `setRefreshCookie()` and `clearRefreshCookie()` to enforce `Secure=true` and `SameSite=strict` when `NODE_ENV=production`.
- **Environment Template Alignment**: Updated `apps/backend/.env.example` to document `NODE_ENV`, `PORT`, `CORS_ORIGIN`, `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `GEMINI_API_KEY`.
- **Vite Frontend API Configuration**: Verified `api-client.ts` uses `VITE_API_URL` and `VITE_WS_URL` with zero legacy `EXPO_PUBLIC_` references.

## [6.1.0] - 2026-08-10

### Security & Production Hardening (Phase 6.1)
- **HttpOnly Refresh Cookies**: Refactored NestJS `AuthController` to return `refresh_token` as HttpOnly, Secure, SameSite=Lax/Strict cookie on register, login, refresh, and clear it on logout.
- **Web Storage Security**: Refactored `storage.service.ts` to strictly prohibit `refresh_token` from being stored in or read from browser `localStorage`.
- **API Client 401 Refresh Handler**: Updated `api-client.ts` with `withCredentials: true` and queue-based non-looping 401 automatic token refresh handler.
- **CORS Credentials Hardening**: Configured `main.ts` with explicit CORS origin whitelist (`['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173']`) enabling `credentials: true`.
- **Lockfile Resolution**: Removed `apps/frontend/package-lock.json` (`npm`) to eliminate lockfile inconsistency and stale mobile package metadata.
- **Bug Closures**: Resolved `BUG-001` (Medium) and `BUG-003` (Low). Total open bugs count: 0.


## [6.0.0] - 2026-08-09

### React Native / Expo to React Web-Only Migration (Phase 6.0)
- Converted application frontend to Web-Only Single Page Application target (React 18 + React DOM 18 + Vite 6 + Tailwind CSS 3 + React Router DOM v7).
- Replaced 100% of React Native UI primitives across 35+ screen components with semantic HTML5 elements.
- Mapped 24+ URL routes in `AppNavigator.tsx`.
