# BenefitOS (BenifitOS) — Master Project Handover

> **Purpose**
>
> This document is the single source of truth for the current state of the BenefitOS project.
>
> Any AI assistant, developer, or reviewer must read this document completely before making any modifications.
>
> Do NOT assume anything outside this document and the repository.

---

# 1. Project Overview

## Project Name
BenefitOS (BenifitOS)

## Purpose
BenefitOS is a production-grade citizen welfare platform that helps Indian citizens:
- Discover welfare schemes
- Check deterministic eligibility scores
- View AI-powered scheme recommendations
- Upload and verify identity & income documents
- Execute Gemini Vision OCR data extraction
- Submit welfare applications
- Track real-time application lifecycle timelines
- Receive instant WebSocket notifications & AI Copilot guidance

---

# 2. Current Architecture (Web-Only Target)

## Frontend Stack
- **Core Framework**: React 18.3.1 + React DOM 18.3.1
- **Language**: TypeScript 5.7.2
- **Build Tooling & Bundler**: Vite 6.1.0
- **Styling & Design System**: Tailwind CSS 3.4.17 + PostCSS + Autoprefixer
- **Navigation & Routing**: React Router DOM v7.1.5 (Browser URL routing with 24+ routes)
- **Data Fetching & State**: TanStack React Query v5.66.0, Zustand v5.0.3, Axios v1.7.9 (`withCredentials: true`)
- **Realtime Gateway**: Socket.IO Client v4.8.1

### Eliminated Mobile Runtimes (DO NOT REINTRODUCE):
❌ React Native  
❌ Expo & Expo CLI  
❌ React Native Web  
❌ React Navigation  
❌ Android / iOS Native Builds  
❌ EAS / Metro Bundler  

## Backend Stack
- **API Engine & Gateway**: NestJS 11 Monolith (`/api/v1`)
- **Database & ORM**: PostgreSQL + Prisma ORM 6.3.0
- **Caching & Revocation**: Redis (BullMQ queues & JWT blacklisting)
- **Authentication**: JWT Access Tokens (In-Memory/State) + HttpOnly, Secure, SameSite Refresh Cookies (`/api/v1/auth`)
- **AI & OCR Modules**: Google Gemini Vision AI (`@google/genai`)

---

# 3. Architecture Rules (MUST NEVER BE VIOLATED)

## Rule 1
Frontend NEVER performs business logic or eligibility calculation. Backend owns all calculation rules:
- Scheme eligibility matching
- Recommendation scoring & natural language explanation
- OCR attribute extraction & confidence scoring
- Workflow state transitions & approval logic
- Direct Benefit Transfer (DBT) calculations

## Rule 2
Frontend only renders UI, sends standard HTTP/WebSocket requests, and displays backend response DTOs.

## Rule 3
Never duplicate backend business logic inside frontend components.

## Rule 4
Never invent API endpoints or DTO schemas. Consume existing NestJS backend contracts.

## Rule 5
Maintain Single Source of Truth: NestJS backend owns all business contracts.

---

# 4. Phase History & Status Matrix

| Phase | Description | Architecture / Stack | Status |
| :--- | :--- | :--- | :--- |
| **Phase 1.0 - 5.3** | Monolith Foundation, Prisma ORM, Rules Engine, OCR, Realtime WebSocket | NestJS + Prisma + Redis | ✔ COMPLETED |
| **Phase 6.0** | Expo / React Native → React Web-Only Migration | React DOM + Vite + React Router DOM | ✔ COMPLETED (Conditional Pass) |
| **Phase 6.1** | Production Security Hardening & Lockfile Resolution | HttpOnly Cookies + CORS + pnpm | ✔ COMPLETED & SIGNED OFF |

---

# 5. Defect Resolutions & Security Hardening (Phase 6.1)

- **BUG-001 (Resolved)**: Refactored NestJS `AuthController` (`register`, `login`, `refresh`, `logout`) to attach `refresh_token` as an HttpOnly, Secure, SameSite=Lax/Strict cookie (`Path=/api/v1/auth`). Frontend `storage.service.ts` strictly prohibits `refresh_token` in `localStorage`.
- **BUG-002 (Resolved)**: Updated `apps/frontend/.env.example` to document standard Vite environment variables `VITE_API_URL` and `VITE_WS_URL`.
- **BUG-003 (Resolved)**: Removed `apps/frontend/package-lock.json` (`npm`), resolving dual lockfile conflict with `pnpm-workspace.yaml`.

---

# 6. Current Release & Quality Status

- **Release Version**: `6.1.0-web`
- **Frontend TypeScript (`npx tsc --noEmit`)**: `EXIT CODE 0` (Zero type errors)
- **Backend TypeScript (`npx tsc --noEmit`)**: `EXIT CODE 0` (Zero type errors)
- **Vite Production Build**: `PASS`
- **Total Open Defects**: `0`
- **Release Gate Status**: 🟢 `PASS`

---

# 7. Next Approved Milestone

- **Next Phase**: Production Staging Deployment & Live External Gateway E2E Validation (UIDAI e-KYC & Gemini AI Provider Gateway).

---

# END OF HANDOVER