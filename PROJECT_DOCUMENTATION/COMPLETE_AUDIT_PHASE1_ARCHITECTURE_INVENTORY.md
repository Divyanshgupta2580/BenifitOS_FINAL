# BenefitOS — Complete Codebase Audit Phase 1 Architecture Inventory
**System Architecture & Subsystem Boundary Verification**

---

## 1. Web Architecture Overview

BenefitOS is structured as a **decoupled Web-Only Client & NestJS Monolith Architecture**.

```
[ Web Browser Client ]
      │
      ├─► React DOM 18 Single Page App
      ├─► React Router DOM v7 (Browser URL Navigation)
      ├─► Axios (withCredentials: true, 401 refresh handler)
      ├─► Socket.IO Client (/ws Realtime Gateway)
      ├─► Web Speech API (STT Voice / SpeechSynthesis TTS)
      └─► window.localStorage (In-Memory Access Token / Locale)
      │
      ▼
[ NestJS Backend Monolith (:4000) ]
      │
      ├─► Auth Module (HttpOnly refresh_token cookies, Argon2)
      ├─► Rules Engine (Deterministic scheme matching & score)
      ├─► PostgreSQL Database + Prisma ORM 6.3.0
      ├─► Redis (Token revocation blacklisting & BullMQ queue)
      └─► Google Gemini Vision AI Integration Gateway
```

---

## 2. Subsystem Ownership & Governance

1. **Frontend Responsibility**: UI rendering, user interaction, form validation, browser URL routing, client state management (`Zustand`, `React Query`), and media capabilities.
2. **Backend Responsibility**: Authentication, password hashing, JWT signing, token rotation/revocation, deterministic eligibility evaluation, scheme recommendation scoring, Vision OCR processing, AI inference, and government identity e-KYC integration.
3. **Boundary Verification Verdict**: 🟢 **PASSED**. Zero business logic or scoring rules are duplicated in the frontend.
