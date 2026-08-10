# BenefitOS — Phase 6.1 Authentication Architecture Report
**HttpOnly Cookie Authentication Architecture & Lifecycle**

---

## 1. Authentication Flow Diagram

```
[ Frontend Browser ]                                   [ NestJS Backend Engine ]
         │                                                      │
         ├────── POST /api/v1/auth/login ──────────────────────►│ (Validates Argon2 password)
         │       (JSON: email, password)                        │ (Generates Access & Refresh JWTs)
         │                                                      │
         │◄───── 200 OK ────────────────────────────────────────┤
         │       Set-Cookie: refresh_token=...; HttpOnly        │
         │       JSON: { tokens: { accessToken } }              │
         │                                                      │
         ├────── GET /api/v1/citizen/profile ──────────────────►│ (Validates Bearer accessToken)
         │       Header: Authorization: Bearer <accessToken>    │
         │                                                      │
         ├────── 401 Unauthorized (Access token expired) ──────►│
         │                                                      │
         ├────── POST /api/v1/auth/refresh ────────────────────►│ (Reads HttpOnly cookie)
         │       Cookie: refresh_token=...                      │ (Rotates token in Redis)
         │                                                      │
         │◄───── 200 OK ────────────────────────────────────────┤
         │       Set-Cookie: refresh_token=<new>; HttpOnly      │
         │       JSON: { tokens: { accessToken: <new> } }       │
         │                                                      │
         ├────── POST /api/v1/auth/logout ─────────────────────►│ (Blacklists token in Redis)
         │       Cookie: refresh_token=...                      │ (Clears HttpOnly cookie)
         │◄───── 200 OK (Set-Cookie: refresh_token=; Max-Age=0)┤
```

---

## 2. Non-Looping Refresh Handler Guard

`api-client.ts` incorporates a queue-based non-looping refresh interceptor:
- Sets `originalRequest._retry = true`.
- Enqueues parallel requests while refreshing.
- On refresh failure (e.g. invalid/revoked cookie), rejects all queued promises, clears local storage, and redirects to `/login`.
