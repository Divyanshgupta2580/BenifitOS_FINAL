# BenefitOS — Complete Codebase Audit Phase 1 Security Inventory
**Security Controls, Secret Management, & Token Isolation Audit**

---

## 1. Secret Isolation Matrix

| Secret / Environment Var | Location | Exposure Evaluation | Status |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | `apps/backend/.env` | Isolated to backend | 🟢 SECURE |
| `REDIS_URL` | `apps/backend/.env` | Isolated to backend | 🟢 SECURE |
| `JWT_SECRET` | `apps/backend/.env` | Isolated to backend | 🟢 SECURE |
| `JWT_REFRESH_SECRET` | `apps/backend/.env` | Isolated to backend | 🟢 SECURE |
| `GEMINI_API_KEY` | `apps/backend/.env` | Isolated to backend | 🟢 SECURE |
| `VITE_API_URL` | `apps/frontend/.env.example` | Public REST API base URL | 🟢 PUBLIC SAFE |
| `VITE_WS_URL` | `apps/frontend/.env.example` | Public WebSocket base URL | 🟢 PUBLIC SAFE |

---

## 2. Authentication & Token Security Controls

1. **HttpOnly Refresh Cookies**: Refactored in Phase 6.1 (`AuthController.ts`). `refresh_token` is attached as an HttpOnly, Secure, SameSite=Lax/Strict cookie with `Path=/api/v1/auth`.
2. **Web Storage Isolation**: `storage.service.ts` explicitly blocks storing `refresh_token` in `window.localStorage`.
3. **Password Hashing**: `AuthService` uses `argon2` hashing algorithm with default salt and memory parameters.
4. **Token Revocation**: Refresh tokens are blacklisted in Redis via `bl_{refreshToken}` keys upon rotation or logout.
5. **CORS Security**: `main.ts` configures explicit allowed origin list with `credentials: true` (disallowing wildcard `*`).
