# BenefitOS — National Welfare Gateway

> A citizen-first digital welfare operating system connecting citizens to public welfare schemes through deterministic eligibility evaluation, secure document vaults, real-time application tracking, and an AI Citizen Copilot.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![NestJS](https://img.shields.io/badge/NestJS-11.0-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.3-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Security Audit](https://img.shields.io/badge/Security_Audit-24%2F24_PASSED-success)](#security--data-isolation)
[![Cron Maintenance](https://img.shields.io/badge/Cron_Maintenance-17%2F17_PASSED-success)](#production-cron-job-architecture)

---

## Live Deployment

- **Frontend Application:** [BenefitOS Web Portal](https://benifitos-final.onrender.com/)
- **Backend API Gateway:** [BenefitOS API Service](https://benefitos-backend-1dq1.onrender.com/api/v1)
- **Realtime WebSocket Gateway:** `wss://benefitos-backend-1dq1.onrender.com/ws`

---

## 1. Product Overview

**BenefitOS** is a unified National Welfare Gateway designed to help citizens discover relevant government welfare schemes, understand eligibility requirements, prepare necessary documentation, navigate public service integrations, and track welfare applications through a modern digital interface.

### Key Problems Solved
- **Information Fragmentation:** Citizens frequently miss entitlements due to complex eligibility rules distributed across disconnected departmental websites.
- **Documentation Barriers:** Manual document handling and unclear prerequisite checklists create high rejection rates and administrative backlogs.
- **Eligibility Uncertainty:** Unclear criteria make it difficult for citizens to understand why a scheme applies to their specific household profile.
- **Language & Accessibility Barriers:** Technical and administrative jargon prevents citizens from navigating public services with confidence.

---

## 2. Core Capabilities & Architecture

```
Citizen
   │
   ▼
BenefitOS Web Portal (React 18 + TypeScript + Tailwind CSS)
   │
   ├─► Light / Dark Mode & Bilingual Interface (English / हिंदी)
   ├─► Truthful Integration Status Indicators
   └─► Structured AI Response Renderer
   │
   ▼ [HTTPS / WSS]
BenefitOS Backend Engine (NestJS 11 + Prisma + PostgreSQL)
   │
   ├── Authentication & Role-Based Access Control (Argon2id + JWT + Cookies)
   ├── Citizen Profile & Household Demographics Engine
   ├── Deterministic Scheme Recommendation & Scoring Engine
   ├── Secure Document Vault (Magic-Byte Inspection + OCR Pipeline)
   ├── Welfare Application Lifecycle Manager (Draft → Submitted → Audit Trail)
   ├── Realtime Notification Gateway (Socket.IO Room Isolation)
   ├── BenefitOS AI Citizen Copilot (Context-Aware Welfare Intelligence)
   └── Daily Maintenance Cron Architecture (Render Scheduled Task)
```

---

## 3. Key Feature Areas

### A. Unified Welfare Dashboard
- **Gateway Status Probe:** Live operational health monitoring of the backend API and WebSocket gateway.
- **Top Recommended Scheme:** Highlights the highest-matching welfare program based on verified profile data.
- **Quick Access Hub:** Fast navigation to Government Services, Document Vault, Scheme Catalog, and Applications.
- **Statistics & Unread Feeds:** Live counts of stored documents, active applications, and unread notification alerts.

### B. BenefitOS AI Citizen Copilot
- **Context-Aware Welfare Intelligence:** Evaluates citizen demographics, household income, category, and verified documents to provide tailored guidance.
- **Structured Response Presentation:** Replaces unformatted text dumps with interactive UI cards:
  - **Scheme Cards:** Department/Ministry, eligibility status, financial benefit estimates, and expandable document checklists.
  - **Step-by-Step Procedures:** Clear `01`, `02`, `03`... procedural steps for official application submission.
  - **Official Disclaimer:** Prominent notices clarifying that final benefit approval rests with the respective government authority.
  - **Contextual Action Buttons:** Quick action triggers for eligibility checks, required documents, and scheme navigation.
- **Bilingual Conversation Support:** Native support for both **English** and **Hindi (हिंदी)** with Devanagari responses, translated guidance prompts, and input placeholders.
- **Voice STT & TTS:** Web Speech Recognition voice input and speech synthesis audio playback.
- **Export & History Management:** Download conversation transcripts in JSON format or clear history instantly.

### C. Deterministic Scheme Recommendation Engine
- Evaluates citizen profiles against state and central welfare catalog criteria (income ceilings, domicile, social category, landholding, age, and employment status).
- Computes percentage match scores and provides structured explanations of satisfied criteria and missing requirements.

### D. Secure Document Vault & Automated OCR
- **Magic-Byte Buffer Inspection:** Enforces strict binary header signature checks (`%PDF`, `\xFF\xD8\xFF`, `\x89PNG`, `RIFF...WEBP`) to prevent file extension spoofing.
- **Automated Data Extraction:** Scans identity documents and certificates to extract structured metadata for application pre-filling.

### E. Welfare Application Lifecycle
- Step-by-step application wizard for state and central schemes.
- Application status progression: `DRAFT` → `SUBMITTED` → `UNDER_REVIEW` → `APPROVED` / `REJECTED`.
- Immutable audit history and status tracking timeline.

### F. Government Services Integration Hub
- Truthful connection adapters for **Aadhaar UIDAI Gateway**, **DigiLocker National Vault**, **ABHA Health Account**, and **PM-KISAN DBT Portal**.

---

## 4. Application Routes

| Category | Route | Access | Description |
|---|---|---|---|
| **Auth** | `/login` | Public / Guest | Citizen authentication |
| **Auth** | `/register` | Public / Guest | Citizen registration |
| **Auth** | `/reset-password` | Public / Guest | Anti-enumeration password reset |
| **Auth** | `/mfa-setup` | Public / Guest | Multi-factor authentication setup |
| **Auth** | `/language` | Public | Portal language selection |
| **Auth** | `/onboarding` | Public | Getting started walkthrough |
| **Dashboard** | `/dashboard` | Protected | Unified Citizen Welfare Dashboard |
| **AI Copilot** | `/ai/copilot` | Protected | AI Citizen Copilot (English & Hindi) |
| **AI Assistant**| `/ai/chat` | Protected | Alternative AI Welfare Assistant interface |
| **Schemes** | `/schemes` | Protected | Comprehensive Welfare Scheme Catalog |
| **Schemes** | `/schemes/:id` | Protected | Scheme details and application instructions |
| **Schemes** | `/schemes/:id/simulate` | Protected | Interactive Scheme Eligibility Simulator |
| **Recommendations** | `/recommendations` | Protected | Personalized Scheme Recommendations |
| **Recommendations** | `/recommendations/:id` | Protected | Recommendation score details |
| **Recommendations** | `/recommendations/:id/explain` | Protected | Match criteria explanation breakdown |
| **Recommendations** | `/recommendations/compare` | Protected | Side-by-side scheme comparison matrix |
| **Document Vault** | `/documents` | Protected | Encrypted citizen document repository |
| **Document Vault** | `/documents/upload` | Protected | Secure file upload with magic-byte check |
| **Document Vault** | `/documents/:id` | Protected | Document viewer modal |
| **Document Vault** | `/documents/:id/ocr` | Protected | Document OCR inspection and review |
| **Applications** | `/applications` | Protected | Submitted and draft welfare applications |
| **Applications** | `/applications/new` | Protected | Step-by-step application submission wizard |
| **Applications** | `/applications/:id` | Protected | Application detail overview |
| **Applications** | `/applications/:id/timeline` | Protected | Application status lifecycle timeline |
| **Government** | `/government-services` | Protected | Aadhaar, DigiLocker, and DBT service hub |
| **Profile** | `/profile` | Protected | Citizen profile and verification status |
| **Profile** | `/profile/demographics` | Protected | Edit name, DOB, gender, income, category |
| **Profile** | `/profile/address` | Protected | Edit street address, district, state, pincode |
| **Profile** | `/profile/household` | Protected | Manage household members and relations |
| **Profile** | `/profile/land` | Protected | Manage agricultural and land records |

---

## 5. Technology Stack

### Frontend
- **Framework:** React 18.3 (Single Page Application)
- **Language:** TypeScript 5.7
- **Build Tool:** Vite 6.1
- **Styling:** Tailwind CSS 3.4 + Custom Government Theme Tokens (Light & Dark mode)
- **State Management:** Zustand 5.0
- **Data Fetching & Cache:** TanStack React Query 5.66
- **HTTP Client:** Axios 1.7 (with automatic JWT refresh interceptors)
- **Realtime:** Socket.IO Client 4.8

### Backend
- **Framework:** NestJS 11.0 (Modular API Monolith)
- **Runtime:** Node.js 22 LTS / Express 4.21
- **Language:** TypeScript 5.7
- **Database ORM:** Prisma 6.3
- **Validation:** Zod 3.24 + `class-validator` / `class-transformer`
- **Security:** Argon2id, Passport JWT, Helmet 8.0, Throttler, Cookie Parser
- **Logging & Metrics:** Pino 9.6, `prom-client` (Prometheus)
- **Realtime:** NestJS WebSockets + Socket.IO 4.8

### Database & Caching
- **Primary Database:** PostgreSQL 16 (Relational schemas, foreign key constraints, JSONB attributes)
- **Caching & Session Revocation:** Redis (ioredis / Upstash)

### AI & Intelligence
- **AI Engine:** Dual-client conversational assistance & automated OCR pipeline
- **Safety Architecture:** Prompt sanitization, PII redaction filters, and evidence-based eligibility boundaries

### Infrastructure & Deployment
- **Deployment Platform:** Render Cloud Platform
- **Backend Service:** Web Service (Node runtime, health check at `/api/v1/health`)
- **Frontend Service:** Static Site (Vite production build, SPA rewrite routing)
- **Cron Job:** Render Cron Service (`0 2 * * *` UTC / 07:30 IST daily maintenance)

---

## 6. Truthful Verification & Trust Design

BenefitOS displays status indicators strictly derived from verified application and backend state:

- **Verified Profile:** Displayed only when profile demographics and completion percentage are populated.
- **Aadhaar Linked:** Displayed only when the UIDAI integration status is confirmed `CONNECTED` or `VERIFIED`.
- **DigiLocker Synced:** Displayed only when DigiLocker integration is confirmed `CONNECTED` and connection health is `HEALTHY`.
- **Document Vault:** Dynamically reflects the exact count of verified files stored in the citizen's vault.

---

## 7. Responsible Welfare Guidance Policy

Because BenefitOS provides welfare scheme information, all AI outputs and recommendations strictly distinguish between:

1. **AI Guidance & Relevance:** Indicating that a scheme appears relevant based on information provided in the citizen's profile.
2. **Authoritative Government Determination:** Clarifying that final application approval, eligibility certification, and benefit disbursement are determined exclusively by the concerned Government Ministry, Department, or implementing agency.

---

## 8. Security & Data Isolation

- **Password Hashing:** Passwords hashed with **Argon2id** using unique cryptographic salts.
- **Token Lifecycle:** Short-lived (15-minute) JWT access tokens paired with 7-day rotated refresh tokens stored in `httpOnly`, `secure`, `sameSite: strict` cookies.
- **Object-Level Authorization (IDOR Defense):** Every document, application draft, notification, and OCR extraction verifies ownership against the authenticated token subject (`@CurrentUser('sub')`).
- **Binary Signature Verification:** Uploaded files undergo magic-byte signature validation, rejecting spoofed extensions or masked binaries.
- **Session Cache Isolation:** Query caches are scoped by authenticated user ID and completely cleared on session transition.
- **Fail-Closed Redis Mode:** In distributed mode (`SECURITY_STATE_MODE=distributed`), revoked session verification fails closed if Redis is unreachable.
- **Zero Secrets in Code:** All credentials, keys, and connection strings are injected via environment variables.

---

## 9. Production Cron Job Architecture

The platform includes an automated daily maintenance architecture deployed on Render (`render.yaml`):

```bash
# Executed daily at 02:00 UTC (07:30 IST)
npm run cron:daily-maintenance
```

### Maintenance Tasks:
1. **Government Scheme Catalog Sync:** Synchronizes central and state welfare scheme definitions.
2. **Expired Session Pruning:** Purges expired or revoked JWT sessions from PostgreSQL.
3. **Outbox Event Archiving:** Cleans processed asynchronous event records.
4. **Recommendation Re-calculation:** Re-evaluates citizen profile matches against updated scheme rules.

---

## 10. Verification & Test Coverage

The project includes automated security, cron, and functional test suites:

```bash
============================================================
 BENEFITOS AUTOMATED TEST & VERIFICATION RESULTS
============================================================
✔ Backend TypeScript Compilation (nest build)    : 0 errors
✔ Comprehensive Security & IDOR Suite             : 24 / 24 PASSED
✔ Scheduled Cron Job Automated Test Suite         : 17 / 17 PASSED
✔ Multi-User PostgreSQL Isolation Test            : 4 / 4 PASSED (0 leaks)
✔ Frontend TypeScript Check (tsc --noEmit)        : 0 errors
✔ Frontend Production Bundle (vite build)         : Built in 1.21s (0 errors)
✔ Copilot Provider Abstraction Audit              : 0 leaks across codebase
✔ Hindi Localization & Segmented Toggle Test      : PASSED
============================================================
```

---

## 11. Local Development Setup

### Prerequisites
- **Node.js:** v22 LTS (`node -v` >= 20.0.0)
- **Package Manager:** `npm` (v10+)
- **Database:** PostgreSQL 16 instance (or Neon connection string)
- **Cache:** Redis instance (optional for local mode)

### 1. Clone Repository
```bash
git clone https://github.com/Divyanshgupta2580/BenifitOS_FINAL.git
cd BenifitOS_FINAL
```

### 2. Install Dependencies
```bash
# Install backend dependencies
cd apps/backend && npm install

# Install frontend dependencies
cd ../frontend && npm install

# Return to root
cd ../..
```

### 3. Configure Environment Variables
Create `apps/backend/.env`:
```env
PORT=4000
HOST=0.0.0.0
NODE_ENV=development
DATABASE_URL="postgresql://user:password@localhost:5432/benefitos?schema=public"
JWT_SECRET="your-secure-jwt-secret-min-16-characters"
JWT_REFRESH_SECRET="your-secure-jwt-refresh-secret-min-16-characters"
AI_API_KEY="your-ai-api-key"
SECURITY_STATE_MODE="local"
```

### 4. Database Setup & Seeding
```bash
cd apps/backend
npx prisma generate
npx prisma migrate deploy
npm run prisma:seed
cd ../..
```

### 5. Start Development Servers
```bash
# Start Backend API Gateway (Terminal 1)
cd apps/backend && npm run start:dev

# Start Frontend Client (Terminal 2)
cd apps/frontend && npm run dev
```

- **Frontend Client:** `http://localhost:3000`
- **Backend API Gateway:** `http://localhost:4000/api/v1`
- **Health Check Probe:** `http://localhost:4000/api/v1/health`

---

## 12. Automated Test Execution

```bash
# Run all backend security, IDOR, and cron job test suites
npm run test:all --prefix apps/backend

# Run frontend typecheck
npm run test --prefix apps/frontend

# Run AI Copilot & Hindi verification suite
node scripts/verify-copilot-production-suite.js
```

---

## 13. License

This project is licensed under the terms of the **MIT License**.
