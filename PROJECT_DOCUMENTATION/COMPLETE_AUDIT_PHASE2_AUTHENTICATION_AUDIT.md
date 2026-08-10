# BenefitOS — Complete Codebase Audit Phase 2 Authentication Audit
**Authentication Lifecycle & Token Rotation Deep Audit**

---

## 1. Authentication Lifecycle Execution Path

1. **User Registration (`POST /auth/register`)**:
   - Computes `argon2.hash(password)`.
   - Saves `UserEntity` in PostgreSQL via Prisma.
   - Generates JWT access token (15m) and refresh token (7d).
   - Attaches `refresh_token` as HttpOnly cookie (`Path=/api/v1/auth`, `SameSite=Lax/Strict`).
   - Returns `{ user, tokens: { accessToken } }`.

2. **User Login (`POST /auth/login`)**:
   - Verifies `argon2.verify(user.passwordHash, password)`.
   - Attaches `refresh_token` HttpOnly cookie and returns access token.

3. **Token Refresh (`POST /auth/refresh`)**:
   - Reads HttpOnly cookie `req.cookies['refresh_token']`.
   - Checks Redis blacklist key `bl_{refreshToken}`.
   - Revokes old refresh token in Redis and issues rotated new access & refresh token pair.

4. **Logout (`POST /auth/logout`)**:
   - Blacklists current refresh token in Redis (`7-day TTL`).
   - Clears HttpOnly cookie (`Set-Cookie: refresh_token=; Max-Age=0`).

---

## 2. Token Isolation Verification
- `localStorage.getItem('refresh_token')`: 🟢 **VERIFIED ABSENT**
- Refresh Token Cookie `HttpOnly=true`: 🟢 **VERIFIED PRESENT**
- Non-Looping Axios 401 Interceptor: 🟢 **VERIFIED PRESENT**
