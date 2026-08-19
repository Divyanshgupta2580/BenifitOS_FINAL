# BenefitOS

**Authoritative Production Entry Point & System Blueprint**  
**Repository:** `Divyanshgupta2580/BenifitOS_FINAL`  
**Current Release Status:** **CONDITIONAL GO**  

---

## 1. What BenefitOS Is

**BenefitOS** is a state-of-the-art, enterprise-grade digital welfare platform designed for unified citizen welfare delivery, deterministic scheme recommendation, secure document lifecycle management, and intelligent AI-assisted citizen support.

Built specifically for high-scale public sector administration in India, BenefitOS provides a transparent, secure, and accessible bridge between citizens and state/central government welfare programs. It eliminates administrative friction through automated eligibility matching, anti-fraud verification, and real-time application status tracking.

---

## 2. Core Capabilities

- **Citizen Registration & Authentication:** Standard-compliant registration enforcing strict citizen role isolation, Argon2id password hashing, 15-minute JWT access tokens, and 7-day refresh token rotation.
- **Multidimensional Citizen Profile:** Multi-tab demographic tracking covering personal details, domicile state, household composition, social categories (General, OBC, SC, ST, EWS), and land holdings.
- **Unified Welfare Scheme Catalog:** Full-text searchable database of state and central schemes with category filtering and clear benefit breakdowns.
- **Deterministic Recommendation Engine:** AST-based demographic scoring engine matching citizen profiles against complex eligibility rules (domicile state, income caps, age brackets, social categories, and professions).
- **Secure Document Vault:** Encrypted document storage with magic-byte file signature validation (`%PDF`, `\xFF\xD8\xFF`, etc.) preventing executable spoofing, with pre-signed access control.
- **OCR & Document Verification:** Automated document data extraction powered by Google Gemini Vision OCR with structured key-value parsing.
- **Application Workflow & Audit Trail:** 4-Stage guided submission wizard (`DRAFT` ➔ `SUBMITTED` ➔ `UNDER_REVIEW` ➔ `APPROVED` / `REJECTED`) with immutable status history and unique tracking numbers (`APP-YYYYMMDD-XXXX`).
- **Omnichannel Notifications:** In-app feeds and real-time push events with unread badge tracking and object-level read state security.
- **AI Welfare Copilot:** Conversational AI assistant powered by Google Gemini (`gemini-3.6-flash`), providing natural language guidance and scheme explanations with PII redactor filters.
- **Government Integration Adapters:** Sandbox-verified integration adapters for Aadhaar UIDAI OTP, DigiLocker OAuth2, PAN verification, and DBT/PFMS benefit transfers.
- **Real-Time WebSocket Gateway:** Authenticated Socket.IO namespace enforcing strict room isolation (`user:<userId>`) for live notification delivery.
- **Dynamic 3-State Theme Engine:** Accessible UI theme engine (`system | light | dark`) with real-time OS media query synchronization and anti-FOUT pre-render protection.
- **Enterprise Security Controls:** Strict fail-fast environment validation, object-level authorization (IDOR protection), single-use password reset tokens, and Redis distributed fail-closed policy.

---

## 3. Architecture

```
                                  +-----------------------+
                                  |   React 18 / Vite SPA  |
                                  |   (Tailwind, Zustand) |
                                  +-----------+-----------+
                                              |
                                              | REST & WebSockets (TLS)
                                              v
                                  +-----------------------+
                                  |   NestJS v11 Gateway  |
                                  | (Global Guards & Pipe)|
                                  +----+-----+-----+------+
                                       |     |     |
             +-------------------------+     |     +-------------------------+
             |                               v                               |
             v                   +-----------------------+                   v
+------------------------+       |   Upstash Redis Cache |       +------------------------+
| PostgreSQL 16 (Neon)   |       |  (Session & Fail-Close|       | Google Gemini GenAI    |
| (Prisma ORM v6.3.0)    |       |   State Management)   |       | (@google/genai v2.16.0)|
+------------------------+       +-----------------------+       +------------------------+
```

---

## 4. Repository Structure

```
BenifitOS_FINAL/
├── apps/
│   ├── backend/                 # NestJS v11 Monolith API Gateway & Microservices Engine
│   │   ├── prisma/              # Prisma Schema (schema.prisma), Seed Script, & Migrations
│   │   └── src/
│   │       ├── common/          # Global Guards, Filters, Interceptors, & Middleware
│   │       ├── config/          # Zod Environment Validation (env.config.ts)
│   │       ├── domain/          # Entities & Repository Interfaces
│   │       ├── infrastructure/  # DB, Redis, Email, AI, & Government Adapters
│   │       └── modules/         # Auth, Citizen, Welfare, Recommendation, Doc, AI, etc.
│   └── frontend/                # React 18 / Vite SPA Client
│       └── src/
│           ├── components/      # UI Components & Theme Providers
│           ├── navigation/      # Protected & Public App Navigators
│           ├── screens/         # 30 Discovered Citizen Screens & Modals
│           └── store/           # Zustand State Management (Theme, Auth, Citizen)
├── PROJECT_DOCUMENTATION/       # Authoritative Specifications, Audits, & Reports
├── scripts/                     # Verification & Utility Scripts
├── .env.example                 # Environment Variable Template
├── AI_INSTRUCTIONS.md           # Core Governing Specification & Coding Directives
└── README.md                    # Root Documentation Navigation Hub
```

---

## 5. Technology Stack

### Frontend Client
- **Framework:** React 18.3.1 (Vite 6.4.3 SPA)
- **Language:** TypeScript 5.7.2
- **Styling:** Vanilla CSS & Tailwind CSS 3.4.17
- **State Management:** Zustand 5.0.3
- **Icons & Motion:** Lucide React 0.474.0, Framer Motion 12.0.6

### Backend API Engine
- **Framework:** NestJS 11.0.1 (Express 4.21.2)
- **Database ORM:** Prisma ORM 6.3.0
- **Database Engine:** PostgreSQL 16 (Neon AWS Serverless Pooler)
- **Caching & Sessions:** Upstash Redis (ioredis 5.4.2)
- **Security & Password Hashing:** Argon2id 0.34.0, Passport JWT 4.0.1, Helmet 8.0.0
- **Validation:** Zod 3.24.1, Class Validator 0.14.1
- **Real-Time:** Socket.IO 4.8.1

### Artificial Intelligence & Vision
- **SDK:** Official `@google/genai` v2.16.0
- **Model:** `gemini-3.6-flash` (Conversational Assistant & Vision OCR)

---

## 6. Development Requirements

- **Node.js:** v22 LTS (v22.10.0+ recommended)
- **Package Manager:** `npm` (v10.0.0+) or `pnpm` (v9.0.0+)
- **Database:** Access to PostgreSQL 16 instance or Neon serverless connection string
- **Distributed Cache:** Redis v6+ instance or Upstash Redis URL

---

## 7. Environment Configuration

Copy `.env.example` to `apps/backend/.env` before starting the application:

```bash
cp .env.example apps/backend/.env
```

### Key Environment Variables

| Variable | Requirement | Purpose |
|---|---|---|
| `PORT` | Optional (Default `4000`) | Backend HTTP port |
| `NODE_ENV` | Optional (`development` / `production`) | Environment execution mode |
| `DATABASE_URL` | **REQUIRED** | PostgreSQL connection string |
| `REDIS_URL` | **REQUIRED** | Redis connection string (`rediss://` or `redis://`) |
| `JWT_SECRET` | **REQUIRED** (Min 16 chars) | HMAC signing key for access tokens |
| `JWT_REFRESH_SECRET` | **REQUIRED** (Min 16 chars) | HMAC signing key for refresh tokens |
| `SECURITY_STATE_MODE` | Optional (`local` / `distributed`) | Fail-closed mode (`distributed` in prod) |
| `GEMINI_API_KEY` | Optional | Google Gemini API key for live AI & OCR |

---

## 8. Running Locally

### Step 1: Install Dependencies
```bash
# Install root and workspace dependencies
cd apps/backend && npm install
cd ../frontend && npm install
cd ../..
```

### Step 2: Database Setup & Seed
```bash
# Generate Prisma Client, deploy migrations, and seed welfare catalog
cd apps/backend
npx prisma generate
npx prisma migrate deploy
npm run prisma:seed
cd ../..
```

### Step 3: Start Development Servers
```bash
# Terminal 1: Backend Gateway (http://localhost:4000/api/v1)
cd apps/backend
npm run start:dev

# Terminal 2: Frontend SPA (http://localhost:3000)
cd apps/frontend
npm run dev
```

---

## 9. Testing & Verification

Execute the comprehensive automated test suites:

### Backend Test Suite
```bash
cd apps/backend
npm run build         # Verify NestJS TypeScript compilation
npm run test:all      # Runs registration, password reset, 5 personas UAT, and 24 security IDOR tests
```

### Frontend & Theme Verification
```bash
cd apps/frontend
npm run build         # Build production Vite bundle
npm test              # Run frontend unit tests
node scripts/verify-theme-store.js # Run 7/7 Theme Store specification tests
```

---

## 10. Security Controls

- **Role Privilege Escalation:** Registration strictly hardcodes `UserRole.CITIZEN`; any injected `"role": "ADMIN"` in user registration payloads is ignored.
- **Fail-Fast Bootstrap:** `validateEnv()` terminates backend startup immediately if `JWT_SECRET`, `JWT_REFRESH_SECRET`, or `DATABASE_URL` is missing.
- **Object-Level Authorization (IDOR Protection):** Every document, application draft, notification, and OCR request validates caller ownership against `@CurrentUser('sub')`. Cross-user access returns HTTP 403/404.
- **Magic-Byte Buffer Inspection:** `validateFileSignature()` examines raw buffer headers before persisting uploads, blocking disguised executables (`MZ`).
- **Distributed Fail-Closed Security:** In production mode (`SECURITY_STATE_MODE=distributed`), session revocation checks strictly fail closed if Redis becomes unreachable.
- **Single-Use Reset Tokens & Anti-Enumeration:** Password reset tokens expire on consumption; uniform generic responses prevent user enumeration.

---

## 11. AI / Gemini Integration

- **Status:** **LIVE VERIFIED**
- **SDK & Model:** Integrated via `@google/genai` v2.16.0 using active model `gemini-3.6-flash`.
- **Endpoint:** `POST /api/v1/ai/chat` (requires valid Bearer JWT token).
- **Fallback Resilience:** Returns structured user-facing messages if unconfigured (`gemini-unconfigured`) or disconnected (`gemini-offline`).

---

## 12. Government Integrations

- **Aadhaar UIDAI:** `SANDBOX VERIFIED` (Mock OTP verification adapter).
- **DigiLocker:** `SANDBOX VERIFIED` (Mock OAuth2 document pull adapter).
- **PAN Verification:** `SANDBOX VERIFIED` (Format & checksum verification adapter).
- **DBT / PFMS:** `SANDBOX VERIFIED` (Direct Benefit Transfer disbursement adapter).
- **ABHA & PM-KISAN:** `NOT CONFIGURED` (External portals pending live production credentials).

---

## 13. Deployment Architecture

The application is fully containerized and production-ready for deployment to cloud platforms (e.g. Docker / AWS ECS / Render / Vercel).

- **Backend Gateway:** Statistically typed NestJS monolith with liveness (`/health/liveness`) and readiness (`/health/readiness`) probes.
- **Database:** Serverless PostgreSQL pooler connection handling.
- **Cache:** Upstash Redis with SSL/TLS transport security.
- **Prisma Migrations:** Non-destructive `npx prisma migrate deploy` pipeline step.

---

## 14. Current Release Status

```
==================================================
RELEASE DECISION: CONDITIONAL GO
==================================================

- Open Defects: 0
- Historical Closed Defects: 11 (DEF-001 through DEF-011)
- Security Tests: 24 / 24 PASSED
- Automated Regression: 49 / 49 PASSED
- Backend Build: PASS
- Frontend Build: PASS
- Theme Engine Verification: 7 / 7 PASSED
- Gemini AI Integration: LIVE VERIFIED
- Government Integrations: SANDBOX VERIFIED
- SMTP Email Service: NOT CONFIGURED (Credentials pending)
- Playwright Automation: INFRASTRUCTURE BLOCKED (Mirror 404; Google Chrome verified)

FINAL VERDICT: CONDITIONAL GO
```

---

## 15. Documentation Index

For detailed technical specifications, architectural blueprints, and audit reports, refer to the authoritative files in [`PROJECT_DOCUMENTATION/`](file:///Users/apple/Desktop/BenifitOS_FINAL/PROJECT_DOCUMENTATION):

### Release & Verification
- 📄 [`FINAL_RELEASE_GATE.md`](file:///Users/apple/Desktop/BenifitOS_FINAL/PROJECT_DOCUMENTATION/FINAL_RELEASE_GATE.md) — Authoritative final release gate document.
- 📄 [`FINAL_EXTERNAL_INTEGRATION_VERIFICATION.md`](file:///Users/apple/Desktop/BenifitOS_FINAL/PROJECT_DOCUMENTATION/FINAL_EXTERNAL_INTEGRATION_VERIFICATION.md) — Gemini AI & external integration verification.
- 📄 [`FINAL_LIVE_STAGING_AUDIT.md`](file:///Users/apple/Desktop/BenifitOS_FINAL/PROJECT_DOCUMENTATION/FINAL_LIVE_STAGING_AUDIT.md) — Staging deployment & live verification report.

### Audit & Defect Tracking
- 📄 [`MASTER_DEFECT_REGISTER.md`](file:///Users/apple/Desktop/BenifitOS_FINAL/PROJECT_DOCUMENTATION/AUDIT/MASTER_DEFECT_REGISTER.md) — Inventory of all closed defects (DEF-001 through DEF-011).
- 📄 [`FINAL_AUDIT.md`](file:///Users/apple/Desktop/BenifitOS_FINAL/PROJECT_DOCUMENTATION/AUDIT/FINAL_AUDIT.md) — Comprehensive final independent audit report.
- 📄 [`FINAL_ADVERSARIAL_RELEASE_AUDIT.md`](file:///Users/apple/Desktop/BenifitOS_FINAL/PROJECT_DOCUMENTATION/FINAL_ADVERSARIAL_RELEASE_AUDIT.md) — Adversarial security & boundary verification pass.

### Architecture Blueprints
- 📄 [`06_System_Architecture.md`](file:///Users/apple/Desktop/BenifitOS_FINAL/06_System_Architecture.md) — System architecture specification.
- 📄 [`07_Database_Architecture.md`](file:///Users/apple/Desktop/BenifitOS_FINAL/07_Database_Architecture.md) — Relational schema & indexing blueprint.
- 📄 [`08_API_Specification.md`](file:///Users/apple/Desktop/BenifitOS_FINAL/08_API_Specification.md) — Complete REST & WebSocket API specification.
- 📄 [`12_Security_Architecture.md`](file:///Users/apple/Desktop/BenifitOS_FINAL/12_Security_Architecture.md) — Comprehensive security architecture.
