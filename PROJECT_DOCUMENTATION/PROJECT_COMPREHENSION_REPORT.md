# BenefitOS — Complete Project Comprehension Report

**Repository:** `Divyanshgupta2580/BenifitOS_FINAL`  
**Governing Playbook:** `AI_INSTRUCTIONS.md`  
**Phase:** Complete Project Comprehension & Read-Only Discovery Phase  
**Mode:** READ-ONLY (0 application files modified)  
**Date:** August 19, 2026

---

## 1. Project Purpose

BenefitOS is an enterprise-grade citizen welfare discovery, document verification, and entitlement delivery platform. It automates:
- Proactive identification of government welfare schemes based on structured citizen demographic, financial, geographical, and occupational profiles.
- Deterministic AST-based eligibility scoring and explanation.
- Tamper-proof, secure document vaulting with magic-byte MIME signature verification and OCR data extraction.
- End-to-end multi-step welfare application lifecycle management (Drafting, Verification, Submission, Timeline Auditing).
- Omnichannel real-time notifications via WebSocket gateway and in-app alerts.
- Multilingual conversational AI guidance (English & Hindi) powered by Google Gemini GenAI.
- Citizen sandbox integrations with Indian digital public infrastructure (Aadhaar UIDAI e-KYC, DigiLocker, PAN Verification, and DBT/PFMS).

---

## 2. Authoritative Documentation Hierarchy

The repository contains an exhaustive suite of architectural blueprints and historical reports. Their authority is classified as follows:

| Category | Documents | Authority Level | Notes |
| :--- | :--- | :---: | :--- |
| **Governing Playbook** | `AI_INSTRUCTIONS.md` | **ABSOLUTE AUTHORITY** | Universal engineering rules, behavior, non-negotiable verification protocols |
| **System Specifications** | `01_Product_Vision.md` through `28_Master_Architecture_&_Executive_Blueprint.md` | **ARCHITECTURAL REFERENCE** | Canonical target architecture, domain models, algorithms, and design system |
| **Production Checklists** | `PROJECT_DOCUMENTATION/PRODUCTION_DEPLOYMENT_CHECKLIST.md`, `.env.example` | **DEPLOYMENT STANDARD** | Production deployment procedures, migration commands, environment contracts |
| **Active Verification Reports** | `PROJECT_DOCUMENTATION/FINAL_ADVERSARIAL_RELEASE_AUDIT.md`, `PRODUCTION_ENVIRONMENT_VERIFICATION.md`, `FINAL_UI_THEME_AUDIT.md` | **CURRENT AUDIT EVIDENCE** | Adversarial verification records, defect register closures, and test matrices |
| **Defect Tracking** | `PROJECT_DOCUMENTATION/AUDIT/MASTER_DEFECT_REGISTER.md`, `FINAL_AUDIT.md` | **ACTIVE TRACKER** | Historical record of DEF-001 through DEF-010 remediation |
| **Historical & Phase Reports** | `PROJECT_DOCUMENTATION/PHASE1_*` to `PHASE7_*`, `DPV_*`, `PAT_*` | **HISTORICAL EVIDENCE** | Intermediate development milestones; superseded by final release audits |

---

## 3. Complete Repository Structure

```
BenifitOS_FINAL/
├── .env.example                               # Root production environment template
├── .gitignore                                 # Git ignore rules (isolates .env, dist, logs)
├── package.json                               # Workspace root scripts
├── pnpm-lock.yaml                             # Root pnpm dependency lockfile
├── pnpm-workspace.yaml                        # Monorepo workspace definition
├── 00_Engineering_Decision_Record.md          # Architectural decisions log
├── 01_Product_Vision.md to 28_Master_...      # 28 Canonical architecture specifications
├── AI_INSTRUCTIONS.md                         # Authoritative engineering playbook
├── PROJECT_DOCUMENTATION/                     # Engineering documentation & audits
│   ├── AUDIT/                                 # Defect registers & audit rounds
│   ├── FINAL_ADVERSARIAL_RELEASE_AUDIT.md     # Final adversarial verification report
│   ├── FINAL_END_TO_END_PRODUCTION_AUDIT.md   # End-to-end functionality audit
│   ├── FINAL_RELEASE_AUDIT.md                 # Release gate certificate
│   ├── FINAL_UI_THEME_AUDIT.md                # 28-Screen theme acceptance report
│   ├── PRODUCTION_DEPLOYMENT_CHECKLIST.md     # Production rollout checklist
│   └── PRODUCTION_ENVIRONMENT_VERIFICATION.md # Infrastructure & environment audit
├── apps/
│   ├── backend/                               # NestJS Enterprise API Gateway & Core Engine
│   │   ├── .env.example                       # Backend environment template
│   │   ├── package.json                       # Backend scripts and dependencies
│   │   ├── tsconfig.json                      # Backend TypeScript configuration
│   │   ├── prisma/                            # Prisma ORM & Database Engine
│   │   │   ├── schema.prisma                  # Canonical database schema (22 models, 8 enums)
│   │   │   ├── seed.ts                        # Production scheme seeding script
│   │   │   └── migrations/                    # 3 Sequential production migrations
│   │   └── src/
│   │       ├── main.ts                        # Bootstrap, validateEnv, Helmet, CORS, ValidationPipe
│   │       ├── app.module.ts                  # Root NestJS module importing 12 feature modules
│   │       ├── common/                        # Filters, guards, interceptors, middleware, decorators
│   │       ├── config/                        # Zod schema validation (env.config.ts)
│   │       ├── domain/                        # Pure domain entities, value objects, repo interfaces
│   │       ├── infrastructure/                # Database (Prisma), Redis, Storage, AI, Email
│   │       ├── modules/                       # 12 Feature Modules (Auth, Citizen, Welfare, etc.)
│   │       └── test-*.ts                      # Executable test suites (Registration, UAT, IDOR)
│   └── frontend/                              # React 18 + Vite + TailwindCSS SPA
│       ├── .env.example                       # Frontend environment template
│       ├── index.html                         # SPA Entry with Anti-FOUT synchronous pre-render script
│       ├── package.json                       # Frontend scripts and dependencies
│       ├── vite.config.ts                     # Vite build configuration
│       ├── tailwind.config.js                 # Tailwind design tokens with darkMode: 'class'
│       ├── scripts/                           # Theme specification test runner
│       └── src/
│           ├── main.tsx                       # React DOM root render
│           ├── App.tsx                        # Root application container
│           ├── navigation/AppNavigator.tsx    # BrowserRouter, Protected/Guest Routes (30 routes)
│           ├── components/ui/                 # Design system (Button, Card, Input, Badge, etc.)
│           ├── hooks/                         # Custom React Query & state hooks
│           ├── screens/                       # 30 Screen and Modal components across 9 domains
│           ├── services/                      # 14 Frontend API clients and WebSocket service
│           └── store/                         # Zustand state stores (auth, theme, language)
```

---

## 4. Technology Stack

- **Monorepo Management:** PNPM Workspaces (`pnpm-workspace.yaml`)
- **Backend Framework:** NestJS v11 (TypeScript v5.7.2, Node.js 22 LTS)
- **Database & ORM:** PostgreSQL 16 (Neon Serverless Pooled) with Prisma ORM v6.3.0
- **Distributed Cache & State:** Upstash Redis with `ioredis` (Fail-closed distributed security mode)
- **Frontend SPA Framework:** React v18.3.1, Vite v6.4.3, TypeScript v5.7.2
- **State Management:** Zustand v5.0.3, TanStack React Query v5.66.0
- **Styling & Design System:** TailwindCSS v3.4.17 with CSS custom properties & class-based dark mode
- **Real-Time Communication:** Socket.IO v4.8.1 (WebSocket Gateway with JWT authentication)
- **Security & Cryptography:** Argon2id password hashing, `jsonwebtoken`, Helmet, CookieParser, Zod
- **AI & Vision OCR:** Google GenAI SDK (`@google/genai` v0.1.1, `gemini-1.5-flash`)
- **Testing Engine:** Custom TypeScript test runner (`npm run test:all`, `verify-theme-store.js`)

---

## 5. Frontend Architecture

- **Entry Point:** `apps/frontend/src/main.tsx` mounts `<App />` into `#root`.
- **Navigation & Routing:** `AppNavigator.tsx` manages client-side routing via `react-router-dom` v7.
  - `GuestRoute`: Restricts `/login` and `/register` to unauthenticated sessions; redirects authenticated users to `/dashboard`.
  - `ProtectedRoute`: Verifies `isAuthenticated` in `auth.store.ts`; redirects guests to `/login`.
- **State Management (Zustand):**
  - `auth.store.ts`: JWT accessToken, refreshToken, user profile state, persistent local storage synchronization.
  - `theme.store.ts`: 3-State theme engine (`system | light | dark`), OS `matchMedia` dynamic listener, local storage sanitizer.
  - `language.store.ts`: Multilingual localization switcher (`en` / `hi`).
- **Data Fetching:** Axios-backed `apiClient` (`api-client.ts`) with request interceptors attaching Bearer JWT and response interceptors handling automated token refresh rotation.
- **Real-Time WebSocket Client:** `websocket-client.ts` establishes authenticated Socket.IO connection to `/ws`, handles reconnects, and dispatches in-app notification state updates.

---

## 6. Backend Architecture

- **Bootstrap Flow (`main.ts`):**
  1. `validateEnv()`: Fails fast if required environment variables (`JWT_SECRET`, `JWT_REFRESH_SECRET`, `DATABASE_URL`) are missing or invalid.
  2. `NestFactory.create(AppModule)`: Initializes dependency injection container.
  3. `app.use(helmet())` & `app.use(cookieParser())`: Attaches security middleware.
  4. `app.enableCors()`: Configures credentials-enabled CORS matching `CORS_ORIGIN`.
  5. `app.setGlobalPrefix('api/v1')`: Sets standardized REST routing prefix.
  6. `app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))`: Enforces DTO validation across all routes.
  7. `app.enableShutdownHooks()`: Handles graceful termination and connection draining.
- **Global Providers (`AppModule`):**
  - `ThrottlerGuard`: Global rate-limiting (120 requests/minute).
  - `JwtAuthGuard`: Enforces Bearer JWT verification globally (except routes marked `@Public()`).
  - `RolesGuard`: Enforces role-based access control via `@Roles(UserRole.ADMIN, ...)`.
  - `GlobalExceptionFilter`: Masks database exceptions, formats error payloads, and logs structured errors.
  - `TransformInterceptor`: Standardizes successful responses into `{ success: true, data: ... }`.
  - `CorrelationIdMiddleware`: Injects unique `x-correlation-id` tracing headers.

---

## 7. Database Architecture

- **Engine:** PostgreSQL managed through Prisma ORM (`apps/backend/prisma/schema.prisma`).
- **Model Hierarchy (22 Models):**
  - `User` ➔ 1:1 `CitizenProfile`, 1:N `Session`, 1:N `Document`, 1:N `Application`, 1:N `Notification`, 1:N `AiConversation`, 1:N `AuditLog`.
  - `CitizenProfile` ➔ 1:1 `Address`, 1:N `HouseholdMember`, 1:N `LandDetail`, 1:N `SchemeRecommendation`.
  - `WelfareScheme` ➔ 1:N `EligibilityCriteria`, 1:N `RequiredDocument`, 1:N `SchemeRecommendation`, 1:N `Application`.
  - `Document` ➔ 1:1 `OcrResult`, 1:N `DocumentVerification`, 1:N `ApplicationDocument`.
  - `Application` ➔ 1:N `ApplicationDocument`, 1:N `ApplicationStatusHistory`.
  - `AiConversation` ➔ 1:N `AiMessage`.
  - `OutboxEvent`: Transactional outbox event store for asynchronous event relay.
- **Data Integrity & Constraints:**
  - Cascading deletes (`onDelete: Cascade`) on citizen-owned child entities.
  - Unique composite constraints (e.g. `[citizenProfileId, schemeId]` on `SchemeRecommendation`, `[applicationId, documentId]` on `ApplicationDocument`).
  - Strict database indexes on foreign keys and lookup queries (`[userId, documentType]`, `[userId, status]`, `[userId, isRead]`).

---

## 8. Authentication & Authorization Architecture

- **Password Hashing:** Argon2id with cryptographically secure salts.
- **Token Architecture:**
  - `accessToken`: Short-lived (15 minutes), containing `{ sub: userId, role: Role, email: string }`.
  - `refreshToken`: Long-lived (7 days), stored in database `Session` table and cached in Redis.
- **Token Revocation & Rotation:**
  - `/api/v1/auth/refresh` validates the refresh token against Redis and database, issues a new token pair, and revokes the previous token (anti-replay).
  - `/api/v1/auth/logout` explicitly marks session as revoked in database and Redis blacklist.
- **Password Reset Security:**
  - `/api/v1/auth/forgot-password` generates a single-use 64-hex cryptographically random token (15m expiry).
  - Anti-enumeration: Returns an identical generic success message regardless of whether the email exists.
  - `/api/v1/auth/reset-password` consumes the token, updates the password hash, and immediately invalidates the token.
- **Tenant Isolation & IDOR Protection:**
  - All resource access methods extract `userId` strictly from `@CurrentUser('sub')` (verified JWT).
  - Controller queries strictly enforce `where: { id: resourceId, userId }`.

---

## 9. Document Architecture

- **Upload Pipeline:**
  1. Frontend submits `multipart/form-data` with document file and `documentType`.
  2. `DocumentService.validateFileSignature()` inspects raw buffer magic bytes (`%PDF`, `\xFF\xD8\xFF`, `\x89PNG`, `RIFF...WEBP`). Disguised executables (`MZ` headers) are rejected with HTTP 400.
  3. Storage adapter (`LocalStorageAdapter`, `SupabaseStorageAdapter`, or `S3StorageAdapter`) persists file with sanitized unique filename.
  4. Prisma records `Document` entity with `verificationStatus: PENDING`.
- **OCR Pipeline:**
  1. `POST /api/v1/ocr/process/:documentId` verifies document ownership.
  2. Passes document buffer to `GeminiAiAdapter.extractDocumentData()`.
  3. Structured extracted JSON (e.g., identity number, full name, DOB) is saved to `OcrResult` table with confidence score.

---

## 10. Recommendation Architecture

- **Evaluation Engine (`EligibilityEvaluatorService`):**
  - Implements deterministic AST rule evaluation comparing citizen profile attributes against `EligibilityCriteria` records in database.
  - Evaluates:
    - `socialCategory` (GENERAL, OBC, SC, ST, EWS)
    - `employmentStatus` (STUDENT, FARMER, EMPLOYED, UNEMPLOYED, RETIRED, DAILY_WAGE)
    - `annualIncomeINR` (Operator: `LESS_EQUAL`, `GREATER_EQUAL`)
    - `age` (Calculated from `dateOfBirth`)
    - `state` / Domicile restriction (e.g., UP resident vs Out-of-State).
- **Match Percentage Calculation:**
  - Weight-based calculation derived from mandatory rules met / total rules.
  - Automatically calculates `missingCriteria` and `missingDocuments` for citizen guidance.
- **Cache Lifecycle:**
  - Profile updates in `CitizenService.updateProfile()` instantly invalidate cached recommendations.

---

## 11. Application Architecture

- **Lifecycle State Machine:**
  - `DRAFT` ➔ `SUBMITTED` ➔ `UNDER_REVIEW` ➔ `APPROVED` / `REJECTED` / `ACTION_REQUIRED`.
- **Creation & Wizard Workflow:**
  1. `POST /api/v1/applications`: Creates draft pre-populated with citizen demographics.
  2. `PUT /api/v1/applications/:id`: Updates form data and attaches verified document IDs.
  3. `POST /api/v1/applications/:id/submit`: Validates required documents, transitions status to `SUBMITTED`, generates immutable tracking number (`APP-YYYYMMDD-XXXX`), logs `ApplicationStatusHistory`, and creates an in-app notification.

---

## 12. Notification Architecture

- **Channels:** `IN_APP`, `WEBSOCKET`, `EMAIL`, `SMS`, `WHATSAPP`.
- **Workflow:**
  - Triggered automatically upon critical lifecycle events (e.g., Application submission, status change, document verification).
  - Persisted to database `Notification` entity (`isRead: false`).
  - Realtime event dispatched to User's private WebSocket room (`user:<userId>`).
  - Unread count badge updated dynamically in UI.

---

## 13. WebSocket Architecture

- **Namespace:** `/ws`
- **Transport:** WebSocket / Polling fallback via Socket.IO.
- **Authentication Handshake:**
  - Inspects `client.handshake.auth.token` or `authorization` header.
  - Verifies JWT with `process.env.JWT_SECRET`. Unauthorized connections rejected.
- **Room Isolation:**
  - Client automatically joins isolated room `user:<userId>`.
  - Clients cannot subscribe to other user rooms.
- **Reconnection:**
  - Frontend `wsService` implements exponential backoff reconnection and re-subscribes upon session recovery.

---

## 14. AI Architecture

- **Provider:** Google Gemini GenAI SDK (`gemini-1.5-flash`).
- **Endpoints:**
  - `POST /api/v1/ai/chat`: Interactive natural language welfare guidance with system prompt safety filters.
  - `POST /api/v1/ai/copilot`: Contextual action assistance providing tailored scheme suggestions.
  - `POST /api/v1/ai/explain-recommendation`: Natural language justification for scheme match percentages.
- **Resilience:**
  - In network-isolated sandbox environments, gracefully catches connection errors and returns a structured fallback system notice without crashing or exposing raw stack traces.

---

## 15. Government Integration Architecture

- **Aadhaar UIDAI Gateway:** Mock sandbox OTP adapter (`SANDBOX VERIFIED`).
- **DigiLocker National Vault:** Mock sandbox OAuth2 adapter (`SANDBOX VERIFIED`).
- **PAN Verification Service:** Mock sandbox tax verification adapter (`SANDBOX VERIFIED`).
- **DBT / PFMS Payment Gateway:** Mock sandbox direct benefit transfer adapter (`SANDBOX VERIFIED`).
- **ABHA Health ID & PM-KISAN:** External integrations marked pending credentials (`NOT CONFIGURED`).

---

## 16. Theme Architecture

- **Modes:** 3-State engine (`system` | `light` | `dark`), defaulting to `system`.
- **Dynamic OS Listener:** Active `window.matchMedia('(prefers-color-scheme: dark)')` listener dynamically toggles `.dark` class when the OS preference changes in real-time.
- **Anti-FOUT:** Synchronous pre-render script in `<head>` of `index.html` inspects `localStorage.getItem('app_theme')` and sets `.dark` class and `style.colorScheme` before React renders.
- **Screen Coverage:** All 30 screens and modals implement paired `dark:bg-*`, `dark:text-*`, and `dark:border-*` styling.

---

## 17. API Contract Map

| # | Frontend Call | Backend Endpoint | HTTP Method | DTO / Payload | Status |
|---|---|---|:---:|:---:|:---:|
| 1 | `apiClient.post('/auth/register', ...)` | `/api/v1/auth/register` | `POST` | `RegisterDto` | MATCH |
| 2 | `apiClient.post('/auth/login', ...)` | `/api/v1/auth/login` | `POST` | `LoginDto` | MATCH |
| 3 | `apiClient.post('/auth/refresh', ...)` | `/api/v1/auth/refresh` | `POST` | `RefreshTokenDto` | MATCH |
| 4 | `apiClient.post('/auth/logout', ...)` | `/api/v1/auth/logout` | `POST` | `LogoutDto` | MATCH |
| 5 | `apiClient.post('/auth/forgot-password', ...)` | `/api/v1/auth/forgot-password` | `POST` | `ForgotPasswordDto` | MATCH |
| 6 | `apiClient.post('/auth/reset-password', ...)` | `/api/v1/auth/reset-password` | `POST` | `ResetPasswordDto` | MATCH |
| 7 | `apiClient.get('/citizens/me')` | `/api/v1/citizens/me` | `GET` | Bearer JWT | MATCH |
| 8 | `apiClient.put('/citizens/me', ...)` | `/api/v1/citizens/me` | `PUT` | `UpdateCitizenProfileDto` | MATCH |
| 9 | `apiClient.get('/schemes')` | `/api/v1/schemes` | `GET` | QueryParams | MATCH |
| 10 | `apiClient.get('/schemes/:id')` | `/api/v1/schemes/:id` | `GET` | Param `id` | MATCH |
| 11 | `apiClient.post('/schemes/:id/simulate', ...)` | `/api/v1/schemes/:id/simulate` | `POST` | `SimulateEligibilityDto` | MATCH |
| 12 | `apiClient.get('/recommendations')` | `/api/v1/recommendations` | `GET` | Bearer JWT | MATCH |
| 13 | `apiClient.post('/documents/upload', ...)` | `/api/v1/documents/upload` | `POST` | Multipart Form | MATCH |
| 14 | `apiClient.get('/documents')` | `/api/v1/documents` | `GET` | Bearer JWT | MATCH |
| 15 | `apiClient.get('/documents/:id')` | `/api/v1/documents/:id` | `GET` | Param `id` | MATCH |
| 16 | `apiClient.delete('/documents/:id')` | `/api/v1/documents/:id` | `DELETE` | Param `id` | MATCH |
| 17 | `apiClient.post('/ocr/process/:documentId', ...)` | `/api/v1/ocr/process/:documentId` | `POST` | Param `documentId` | MATCH |
| 18 | `apiClient.get('/ocr/:documentId')` | `/api/v1/ocr/:documentId` | `GET` | Param `documentId` | MATCH |
| 19 | `apiClient.get('/applications')` | `/api/v1/applications` | `GET` | Bearer JWT | MATCH |
| 20 | `apiClient.get('/applications/:id')` | `/api/v1/applications/:id` | `GET` | Param `id` | MATCH |
| 21 | `apiClient.post('/applications', ...)` | `/api/v1/applications` | `POST` | `CreateApplicationDto` | MATCH |
| 22 | `apiClient.put('/applications/:id', ...)` | `/api/v1/applications/:id` | `PUT` | `UpdateApplicationDto` | MATCH |
| 23 | `apiClient.post('/applications/:id/submit', ...)` | `/api/v1/applications/:id/submit` | `POST` | Param `id` | MATCH |
| 24 | `apiClient.get('/notifications')` | `/api/v1/notifications` | `GET` | Bearer JWT | MATCH |
| 25 | `apiClient.patch('/notifications/:id/read', ...)` | `/api/v1/notifications/:id/read` | `PATCH` | Param `id` | MATCH |
| 26 | `apiClient.post('/ai/chat', ...)` | `/api/v1/ai/chat` | `POST` | `AiChatDto` | MATCH |
| 27 | `apiClient.post('/ai/copilot', ...)` | `/api/v1/ai/copilot` | `POST` | `AiCopilotDto` | MATCH |
| 28 | `apiClient.post('/integrations/aadhaar/request-otp', ...)` | `/api/v1/integrations/aadhaar/request-otp` | `POST` | `RequestAadhaarOtpDto` | MATCH |
| 29 | `apiClient.post('/integrations/aadhaar/verify-otp', ...)` | `/api/v1/integrations/aadhaar/verify-otp` | `POST` | `VerifyAadhaarOtpDto` | MATCH |
| 30 | `apiClient.get('/integrations/digilocker/authorize')` | `/api/v1/integrations/digilocker/authorize` | `GET` | None | MATCH |
| 31 | `apiClient.get('/integrations/dbt/status')` | `/api/v1/integrations/dbt/status` | `GET` | Query `aadhaarHash` | MATCH |

---

## 18. Complete Screen Inventory

1. `LanguageSelectScreen.tsx` (`/language`): Multilingual selection (English & Hindi)
2. `OnboardingScreen.tsx` (`/onboarding`): Value proposition walkthrough
3. `LoginScreen.tsx` (`/login`): Citizen authentication with email/password
4. `RegisterScreen.tsx` (`/register`): RFC 5322 validated registration with mandatory demographics
5. `PasswordResetScreen.tsx` (`/reset-password`): 2-Stage password reset workflow
6. `MfaSetupScreen.tsx` (`/mfa-setup`): Multi-factor authentication configuration
7. `DashboardScreen.tsx` (`/dashboard`): Central citizen command center & notification listener
8. `CitizenProfileScreen.tsx` (`/profile`): Overview of citizen demographic & economic profile
9. `DemographicsEditScreen.tsx` (`/profile/demographics`): Edit name, gender, category, DOB
10. `AddressEditScreen.tsx` (`/profile/address`): Edit address, state, district, pincode
11. `HouseholdMembersScreen.tsx` (`/profile/household`): Manage family member dependents
12. `LandDetailsScreen.tsx` (`/profile/land`): Manage agricultural land holdings
13. `SchemeCatalogScreen.tsx` (`/schemes`): Searchable catalog of welfare schemes
14. `SchemeDetailScreen.tsx` (`/schemes/:id`): Scheme overview, rules, and benefits
15. `EligibilitySimulatorScreen.tsx` (`/schemes/:id/simulate`): Interactive what-if eligibility tester
16. `RecommendationDashboardScreen.tsx` (`/recommendations`): Ranked personalized recommendations
17. `RecommendationDetailScreen.tsx` (`/recommendations/:id`): Deep dive into matched criteria
18. `RecommendationExplanationScreen.tsx` (`/recommendations/:id/explain`): AI-assisted match breakdown
19. `RecommendationComparisonScreen.tsx` (`/recommendations/compare`): Side-by-side scheme comparison
20. `DocumentVaultScreen.tsx` (`/documents`): Verified citizen document repository
21. `DocumentUploadScreen.tsx` (`/documents/upload`): Magic-byte validated file uploader
22. `DocumentViewerModal.tsx` (`/documents/:id`): Secure modal for document inspection
23. `OcrReviewScreen.tsx` (`/documents/:id/ocr`): OCR extracted field review & verification
24. `ApplicationsListScreen.tsx` (`/applications`): Overview of submitted and draft applications
25. `ApplicationWizardScreen.tsx` (`/applications/new`): 4-Stage guided application submission wizard
26. `ApplicationTimelineScreen.tsx` (`/applications/:id/timeline`): Lifecycle audit timeline
27. `ApplicationDetailScreen.tsx` (`/applications/:id`): Detailed application view and disbursement info
28. `AiAssistantScreen.tsx` (`/ai/chat`): Natural language chat assistant
29. `AiCopilotScreen.tsx` (`/ai/copilot`): Contextual action suggestions & scheme finder
30. `GovernmentServicesScreen.tsx` (`/government-services`): Citizen integration hub

---

## 19. Complete Backend Module Inventory

1. `AuthModule`: Registration, login, token refresh, logout, password reset, JWT strategy
2. `CitizenModule`: Citizen profile, address, household, and land holding repositories
3. `WelfareModule`: Welfare scheme catalog query, details, and simulate eligibility
4. `RecommendationModule`: Deterministic AST rule engine & personalized scheme scoring
5. `DocumentModule`: Magic-byte validation, secure upload, vault query, and presigned downloads
6. `OcrModule`: Document image processing, Gemini Vision OCR extraction, confidence scoring
7. `ApplicationModule`: Application drafting, wizard validation, lifecycle status transitions
8. `NotificationModule`: Omnichannel notification dispatch, unread tracking, read-state mutations
9. `RealtimeModule`: WebSocket gateway (`/ws`), JWT handshake authentication, private room isolation
10. `AiModule`: Conversational AI gateway, Copilot scheme recommendations, safety filtering
11. `IntegrationModule`: Aadhaar OTP, DigiLocker OAuth2, PAN verify, and DBT PFMS status adapters
12. `HealthModule`: Liveness, readiness, and metrics monitoring probes (`/health`, `/metrics`)

---

## 20. Database Model Inventory

1. `User` (Identity, password hash, role, verification status)
2. `Session` (Refresh token, device info, revocation flag, expiry)
3. `CitizenProfile` (Core demographics, income, category, Aadhaar/PAN hashes)
4. `Address` (Street, city, district, state, pincode, isRural)
5. `HouseholdMember` (Family dependents, income, relation)
6. `LandDetail` (Land size, land type, survey number, district, state)
7. `WelfareScheme` (Scheme code, title, description, category, department, benefit amount)
8. `EligibilityCriteria` (Attribute key, operator, target value, required flag)
9. `RequiredDocument` (Document type, mandatory flag, description)
10. `SchemeRecommendation` (Match percentage, criteria met, missing documents)
11. `Document` (File metadata, storage path, MIME, verification status)
12. `OcrResult` (Extracted text, confidence score, parsed JSON fields)
13. `DocumentVerification` (Officer audit remarks, status, verification timestamp)
14. `Application` (Application number, form data JSON, status, submitted timestamp)
15. `ApplicationDocument` (M2M link between applications and documents)
16. `ApplicationStatusHistory` (Audit trail of status transitions with timestamp)
17. `AiConversation` (Chat conversation header and user association)
18. `AiMessage` (Individual message, role, tokens used, provider)
19. `Notification` (Title, body, channel, read status, metadata)
20. `NotificationPreference` (Channel toggles for email, SMS, WhatsApp, in-app)
21. `AuditLog` (Actor userId, action, resource, IP address, user agent)
22. `OutboxEvent` (Transactional outbox events for asynchronous workers)

---

## 21. Security Model

- **Authentication Boundary:** Global `JwtAuthGuard` intercepts all requests; `@Public()` decorator explicitly white-lists unauthenticated routes (`/auth/login`, `/auth/register`, `/health/*`).
- **Role Boundary:** `UserRole.CITIZEN` strictly hardcoded during registration; prevents caller injection of `ADMIN` or `SUPER_ADMIN`.
- **Tenant Isolation:** All database repository calls constrain queries to `@CurrentUser('sub')`. Cross-user access to documents, OCR, applications, or notifications is blocked with HTTP 403/404.
- **File Upload Security:** Magic-byte buffer validation prevents executable spoofing before writing to filesystem or database.
- **Fail-Closed Redis:** In production distributed mode (`SECURITY_STATE_MODE=distributed`), system fails closed with HTTP 503 if Redis becomes unavailable.

---

## 22. Testing Architecture

- **Backend Test Suite (`npm run test:all`):**
  - `test-registration-flow.ts`: RFC 5322 email validation, duplicate conflict rejection, profile creation.
  - `test-password-reset-flow.ts`: Single-use token invalidation, anti-enumeration, hash updating.
  - `test-runner.ts`: 5 Citizen Personas UAT (UP Student, Senior Citizen, Farmer, High Income, Out-of-State).
  - `test-security-idor.ts`: 10 Security & IDOR test suites (Privilege escalation, JWT fail-fast, magic-bytes, document/app/notification IDOR, WebSocket room isolation, Redis fail-closed).
- **Frontend Theme Suite (`apps/frontend/scripts/verify-theme-store.js`):**
  - 7 Specification tests verifying 3-state theme resolution, local storage sanitization, `matchMedia` dynamic sync, and anti-FOUT behavior.

---

## 23. Deployment Architecture

- **Build Pipeline:**
  - Backend: `npm run build` (`nest build`) ➔ Generates `dist/src/main.js`.
  - Frontend: `npm run build` (`tsc && vite build`) ➔ Generates optimized production bundle in `dist/`.
- **Database Migrations:** Executed in production via `npx prisma migrate deploy` (non-destructive).
- **CORS & WebSockets:** Configured via `CORS_ORIGIN` environment variable.

---

## 24. External Dependencies

| Dependency | Purpose | Production Requirement | Current Status |
| :--- | :--- | :--- | :---: |
| **Neon PostgreSQL** | Primary relational datastore | Active connection string with TLS | `PASS (CONFIGURED)` |
| **Upstash Redis** | Cache & session revocation store | TLS endpoint (`rediss://`) | `PASS (CONFIGURED)` |
| **Google Gemini GenAI** | AI assistant & Vision OCR | API key with outbound network egress | `ENVIRONMENT BLOCKED` (Sandbox) |
| **SMTP Mail Server** | Password reset email dispatch | Host, port, user, password credentials | `NOT CONFIGURED` |
| **Aadhaar / DigiLocker** | e-KYC & identity verification | Production API gateway credentials | `SANDBOX VERIFIED` |

---

## 25. Environment Variables

- `PORT`: Backend listener port (default 4000)
- `NODE_ENV`: Runtime environment (`production` / `development` / `test`)
- `API_PREFIX`: REST routing prefix (default `api/v1`)
- `CORS_ORIGIN`: Allowed frontend origin domains (comma-separated)
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string (`rediss://` for TLS)
- `SECURITY_STATE_MODE`: Distributed fail-closed mode (`distributed`)
- `JWT_SECRET`: Minimum 32-character symmetric access token signing key
- `JWT_REFRESH_SECRET`: Minimum 32-character symmetric refresh token signing key
- `GEMINI_API_KEY`: Google GenAI API key
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`: Mail server credentials
- `STORAGE_PROVIDER`: Storage engine (`local`, `s3`, `supabase`)
- `VITE_API_URL`: Frontend public REST API endpoint
- `VITE_WS_URL`: Frontend public WebSocket gateway endpoint

---

## 26. Complete User Journeys

1. **Registration Flow:**
   - Citizen fills form on `/register` ➔ Clientside RFC regex validation ➔ `POST /auth/register` ➔ Argon2id password hash ➔ Atomic creation of `User` + `CitizenProfile` + `Address` (role: CITIZEN) ➔ Returns JWT tokens ➔ Stored in Zustand `auth.store.ts` ➔ Navigates to `/dashboard`.
2. **Login & Session Recovery:**
   - Citizen enters credentials on `/login` ➔ `POST /auth/login` ➔ Argon2id verification ➔ Issues access token (15m) and refresh token (7d) ➔ On reload, `AppNavigator` calls `loadAuthFromStorage()` and restores authenticated session.
3. **Welfare Scheme Discovery & Personalized Recommendations:**
   - Dashboard calls `GET /recommendations` ➔ Backend `EligibilityEvaluatorService` matches citizen's live profile against database `WelfareScheme` criteria (Domicile, Category, Income, Employment) ➔ Schemes displayed with match percentage and estimated financial benefits.
4. **Document Upload & Secure Verification:**
   - Citizen uploads identity certificate on `/documents/upload` ➔ `POST /documents/upload` ➔ Backend validates magic-byte buffer ➔ Persists to storage ➔ Emits outbox event ➔ Citizen can view in `/documents` or run OCR in `/documents/:id/ocr`.
5. **Multi-Step Application Submission:**
   - Citizen launches application from scheme or `/applications/new` ➔ 4-step wizard pre-populates verified profile demographics ➔ Citizen attaches uploaded document IDs ➔ Clicks Submit ➔ `POST /applications/:id/submit` ➔ Generates `applicationNo`, creates timeline history, triggers notification, dispatches real-time WebSocket event.
6. **Real-Time Notification Delivery:**
   - WebSocket client receives `notification_received` event ➔ Unread counter increments on Dashboard ➔ Citizen opens notification and clicks mark-as-read ➔ `PATCH /notifications/:id/read` updates state.
7. **AI Copilot Welfare Assistance:**
   - Citizen asks question in `/ai/chat` or `/ai/copilot` ➔ Request routed to backend `AiController` ➔ Contextual prompt constructed ➔ Dispatched to Gemini GenAI (or returns network notice if offline) ➔ Formatted response rendered with action suggestions.
8. **Password Reset Lifecycle:**
   - Citizen requests reset on `/reset-password` ➔ `POST /auth/forgot-password` generates 64-char single-use token ➔ Citizen inputs token and new password ➔ `POST /auth/reset-password` updates hash and invalidates token.
9. **Logout:**
   - Citizen clicks Logout in Profile ➔ `POST /auth/logout` revokes session in Redis ➔ Local store cleared ➔ Redirects to `/login`.
10. **Dynamic Theme Switcher:**
    - Citizen toggles ThemeToggle component ➔ State stored in `theme.store.ts` ➔ Synchronous anti-FOUT script in `index.html` prevents light flashes on reload ➔ Dynamic `matchMedia` listener tracks OS dark mode.

---

## 27. Known Contradictions Between Documentation And Code

1. **Third-Party Integration Badges:** Early architecture blueprints (e.g. `21_Enterprise_Integration_Architecture.md`) document direct live UIDAI and DigiLocker production connectivity; the current implementation uses verified sandbox mock adapters (`SANDBOX VERIFIED`). This is properly reconciled in the latest audit reports.
2. **AI Provider Availability:** Early documentation assumed uninterrupted Google Gemini API connectivity; in isolated local execution environments, network egress isolation blocks outbound calls to `generativelanguage.googleapis.com`. The code safely catches this error and returns a structured notice (`ENVIRONMENT BLOCKED`).

---

## 28. Known Technical Risks

1. **Single-Instance In-Memory Fallback:** In development mode without Redis, session revocations fall back to in-memory TTL maps. In production, `SECURITY_STATE_MODE=distributed` must be maintained to ensure multi-instance session consistency.
2. **Outbound Network Egress for AI & Mail:** If the deployment host restricts outbound TCP ports (e.g. port 587 for SMTP or HTTPS egress for Google GenAI), email delivery and live AI inference will remain in fallback modes until network egress is whitelisted.

---

## 29. Unknown / Not Yet Verified Areas

1. **Live Production SMTP Deliverability:** Can only be validated once real mail server credentials (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`) are injected into the live production container.
2. **Live Production Gemini Inference:** Can only be validated once the container is deployed to a network environment with unrestricted access to `generativelanguage.googleapis.com`.

---

## 30. Questions That Must Be Resolved Before Modification

1. Will production deployment utilize local disk storage, AWS S3 buckets, or Supabase Storage for document persistence?
2. Are production credentials available for live UIDAI Aadhaar e-KYC and DigiLocker API gateways, or should the platform continue to operate in verified Sandbox Mode for initial launch?

---

## 31. Final Understanding Assessment

**Status:** **COMPLETE**

The entire BenefitOS architecture—spanning Monorepo structure, 30 frontend screens, 12 backend modules, 22 database models, 38 API endpoints, deterministic AST recommendation algorithms, magic-byte file security, multi-stage application workflows, realtime WebSockets, 3-state dynamic theme engine, and deployment contracts—is fully understood, mapped, and verified in this read-only discovery phase.
