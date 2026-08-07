# BenefitOS Frontend Implementation Contract & Blueprint

| Field | Value |
|-------|-------|
| Document Title | Frontend Implementation Contract & Technical Blueprint |
| Document Number | FIC-001 |
| Status | APPROVED CONTRACT |
| Version | 1.0.0 |
| Target Frameworks | Next.js 15 (React 19) Web App & React Native (Expo) Mobile App |
| Backend Endpoint Base | `http://localhost:4000/api/v1` |
| WebSocket Gateway | `ws://localhost:4000/ws` |
| Date | 2026-08-07 |

---

## Executive Architectural Mandate
- **Frozen Backend Core**: The backend REST APIs, WebSockets (`/ws`), DTO validation constraints, and database schemas are 100% frozen. The frontend application MUST NOT alter or request modifications to backend API contracts or database tables.
- **Single Source of Truth**: All data models, roles (`CITIZEN`, `ADMIN`, `OFFICER`, `AUDITOR`), application statuses (`DRAFT`, `SUBMITTED`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`), and scheme categories strictly adhere to the frozen backend DTO definitions.

---

## 1. Complete Screen & Views Inventory

### 1.1 Auth & Onboarding Flow
- `SCR-AUTH-01`: **Splash & Language Selection Screen** — Regional language picker (English, Hindi, Tamil, Telugu, Kannada, Bengali, Marathi, Gujarati).
- `SCR-AUTH-02`: **Welcome & Feature Onboarding Walkthrough** — Carousel highlighting scheme discovery, OCR document scan, and AI assistance.
- `SCR-AUTH-03`: **Citizen Registration Screen** — Email, Phone, Password, and Role selection form.
- `SCR-AUTH-04`: **Login Screen** — Password login, Google OAuth SSO button, and MFA challenge prompt.
- `SCR-AUTH-05`: **Password Reset Request Modal** — Email input for password reset link.
- `SCR-AUTH-06`: **Password Reset Confirmation Screen** — New password entry with strength indicator.
- `SCR-AUTH-07`: **MFA Setup & Verification Sheet** — QR Code display and TOTP 6-digit verification input.

### 1.2 Dashboard & Scheme Discovery Flow
- `SCR-DASH-01`: **Citizen Home Dashboard** — Scheme recommendations overview, application status timeline widget, notification badge, profile completion progress bar.
- `SCR-SCH-01`: **Scheme Catalog & Search Screen** — Paginated scheme list with search bar, category pills (Agriculture, Healthcare, Education, etc.), and state filters.
- `SCR-SCH-02`: **Scheme Detail View Screen** — Scheme overview, financial benefit breakdown, eligibility rules list, required documents list, "Check Eligibility" button.
- `SCR-SCH-03`: **Eligibility Rules Simulator Sheet** — Interactive attribute test calculating match score without altering profile.
- `SCR-SCH-04`: **AI Scheme Comparison Modal** — Multi-scheme side-by-side comparison matrix.

### 1.3 Citizen Profile & Household Management Flow
- `SCR-PROF-01`: **Citizen Profile Overview Screen** — Completion score wheel, personal info, demographic attributes, BPL card status, and quick links.
- `SCR-PROF-02`: **Demographics & Income Edit Form** — First/last name, DOB, gender, social category (General, OBC, SC, ST, EWS), employment status, annual income.
- `SCR-PROF-03`: **Address & Geography Edit Form** — Street address, city, district, state, pincode, urban/rural toggle.
- `SCR-PROF-04`: **Household Members List & Add Modal** — List of family dependents, relation, age, income.
- `SCR-PROF-05`: **Land Ownership Details Screen** — Land size in acres, land type, survey number, district.

### 1.4 Document Vault & Vision OCR Processing Flow
- `SCR-DOC-01`: **Document Vault Screen** — Uploaded document grid categorized by type (Aadhaar, Income Cert, Ration Card, Caste Cert, Disability Cert).
- `SCR-DOC-02`: **Document Upload Sheet** — File source selection (Camera capture, Gallery picker, PDF document picker), file size & MIME type validator.
- `SCR-DOC-03`: **Vision OCR Field Review Modal** — Live extracted field verification screen displaying confidence scores, highlighted extracted text, and correction inputs.
- `SCR-DOC-04`: **Document Fullscreen Viewer Dialog** — Secure presigned URL previewer with pan/zoom.

### 1.5 Application Workflow & Timeline Flow
- `SCR-APP-01`: **My Applications Screen** — Status tabs (`Drafts`, `Submitted`, `Under Review`, `Approved`, `Rejected`), application card with deadline trackers.
- `SCR-APP-02`: **Application Form Wizard Screen** — Multi-step application drafting wizard, auto-save status indicator, document attachment picker.
- `SCR-APP-03`: **Application Review & Submit Confirmation Dialog** — Pre-submission summary checklist, terms acknowledgment.
- `SCR-APP-04`: **Application Audit Timeline View Screen** — Step-by-step state transition history timeline (`DRAFT` -> `SUBMITTED` -> `UNDER_REVIEW` -> `APPROVED`).

### 1.6 Conversational AI & Multi-Lingual Voice Assistant Flow
- `SCR-AI-01`: **AI Welfare Assistant Chat Screen** — Real-time streaming conversational interface, multi-lingual audio voice input button, typing indicator, context pill attachments.
- `SCR-AI-02`: **AI Recommendation Explanation Sheet** — Natural language explanation breakdown of why a scheme matched or failed.
- `SCR-AI-03`: **AI Voice Speech-to-Text Recording Modal** — Animated microphone visualizer converting regional speech to text.

### 1.7 Government Integrations Flow
- `SCR-INT-01`: **DigiLocker Integration Screen** — OAuth authorization webview redirect, document sync progress bar.
- `SCR-INT-02`: **Aadhaar e-KYC Verification Modal** — Masked Aadhaar number input, OTP request trigger, 6-digit OTP countdown input.
- `SCR-INT-03`: **Direct Benefit Transfer (DBT) Status Sheet** — Bank account linkage status and payment transfer history log.

### 1.8 Notifications & Settings Flow
- `SCR-SETT-01`: **Notifications Center Screen** — In-app notification feed, mark-all-as-read action, filtering by type.
- `SCR-SETT-02`: **Notification Channel Preferences Sheet** — Toggles for Email, SMS, WhatsApp, In-App alerts.
- `SCR-SETT-03`: **Security & Device Session Management Screen** — Active device session list, revoke specific session, password change form, TOTP MFA manager.

---

## 2. Navigation Map & Route Protection

```text
                           Root Navigator
                                 │
           ┌─────────────────────┴─────────────────────┐
           ▼                                           ▼
   Public Auth Stack                           Protected App Shell
  (Guest Navigation)                       (Authenticated Navigation)
           │                                           │
  ├── Splash / Language                       ├── Bottom Tab Navigator
  ├── Feature Walkthrough                     │   ├── Home Tab (Dashboard)
  ├── Login Screen                            │   ├── Schemes Tab (Catalog)
  ├── Register Screen                         │   ├── Applications Tab
  ├── Password Reset                          │   ├── AI Assistant Tab
  └── DigiLocker OAuth Callback               │   └── Profile & Vault Tab
                                              │
                                              └── Global Modal / Sheet Stack
                                                  ├── Document Upload Sheet
                                                  ├── OCR Field Review Modal
                                                  ├── Aadhaar OTP Modal
                                                  ├── Application Form Wizard
                                                  └── Device Sessions Sheet
```

### Protected Route Guard Logic
- **Unauthenticated Users**: Automatically redirected to `SCR-AUTH-04` (Login) when accessing protected routes.
- **Authenticated Citizens (`CITIZEN`)**: Access restricted strictly to own profile (`userId`), recommendations, documents, and applications.
- **Officers & Admins (`OFFICER`, `ADMIN`)**: Access to verification review stacks and audit query views.

---

## 3. Complete Component Inventory

### 3.1 Design System UI Primitives
- `CompButton`: Variants (`primary`, `secondary`, `outline`, `destructive`, `ghost`), sizes (`sm`, `md`, `lg`), loading spinner state, disabled state.
- `CompCard`: Glassmorphism card container, elevation shadows, hover border animation.
- `CompInput`: Floating label text input, password visibility toggle, error message text, left/right icon slots.
- `CompSelect`: Accessible dropdown picker with search filter.
- `CompBadge`: Status pill (`DRAFT` = Gray, `SUBMITTED` = Blue, `UNDER_REVIEW` = Amber, `APPROVED` = Green, `REJECTED` = Red).
- `CompProgressBar`: Animated completion progress bar with percentage counter.
- `CompSkeleton`: Shimmering skeleton loader for list cards, detail screens, and charts.

### 3.2 Feature-Specific Business Components
- `CompSchemeCard`: Title, department badge, financial benefit counter, match score wheel, "View Scheme" CTA.
- `CompMatchPercentageWheel`: Circular SVG gauge displaying match score (0-100%).
- `CompCriteriaChecklist`: Met criteria (green checkmark) vs Missing criteria (amber warning) list item.
- `CompDocumentUploadZone`: Drag-and-drop file upload zone with mime validation & upload progress bar.
- `CompOcrFieldEditor`: Key-value pair editor highlighting Gemini Vision confidence score.
- `CompTimelineTracker`: Vertical step progress indicator for application status history.
- `CompAiChatMessage`: User message bubble vs AI markdown message bubble with streaming typewriter effect.
- `CompVoiceRecorderButton`: Pulse-animated audio input button with voice activity level visualizer.

---

## 4. API & WebSocket Integration Mapping

| Screen ID | REST Endpoint | Method | Request DTO | Response Envelope | WebSocket Event Listeners | Caching Strategy |
|-----------|---------------|--------|-------------|-------------------|--------------------------|------------------|
| `SCR-AUTH-04` | `/auth/login` | `POST` | `LoginDto` | `{ user, tokens }` | None | No Cache |
| `SCR-DASH-01` | `/citizens/me`<br>`/recommendations` | `GET` | None | `{ profile }`<br>`{ recommendations }` | `events.recommendation_updated` | React Query (StaleTime: 5m) |
| `SCR-SCH-01` | `/schemes` | `GET` | `?category=&state=` | `{ count, schemes }` | None | React Query (StaleTime: 30m) |
| `SCR-DOC-02` | `/documents/upload` | `POST` | `FormData` | `{ message, document }` | `events.ocr_progress` | Cache Invalidate (`/documents`) |
| `SCR-DOC-03` | `/ocr/process/:id` | `POST` | None | `{ result }` | `events.ocr_progress` | Cache Invalidate (`/documents/:id`) |
| `SCR-APP-02` | `/applications/draft` | `POST` | `CreateDraftDto` | `{ application }` | `events.application_status_changed` | Cache Invalidate (`/applications`) |
| `SCR-AI-01` | `/ai/chat` | `POST` | `AiChatDto` | `{ reply, provider }` | `events.ai_stream` | No Cache |

---

## 5. State Management Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                 FRONTEND STATE ARCHITECTURE                 │
├─────────────────────────────────────────────────────────────┤
│ 1. Server State (TanStack React Query v5)                  │
│    - Caching REST responses, invalidation triggers          │
│    - Optimistic updates for draft auto-save & preferences  │
├─────────────────────────────────────────────────────────────┤
│ 2. Client Application State (Zustand)                       │
│    - Auth State: Current user, active tokens, MFA status   │
│    - UI State: Active theme, sidebar open, modal stacks    │
│    - Language Preference: Active locale                     │
├─────────────────────────────────────────────────────────────┤
│ 3. Persistent Local Storage (Encrypted MMKV / Keychain)    │
│    - Encrypted Refresh Tokens                              │
│    - Offline sync queue buffer                             │
│    - User preference cache                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Offline-First & Synchronization Strategy

1. **Offline Queue Buffer**: When offline, write operations (application draft auto-save, profile edits) are queued in an encrypted local queue (`MMKV`).
2. **Reconnection Listener**: Network state change listener (`@react-native-community/netinfo` / `window.addEventListener('online')`) triggers background flush of queued requests.
3. **Conflict Resolution**: Server timestamp wins (`updatedAt` comparison). If server record is newer, user is prompted with side-by-side diff resolution dialog.

---

## 7. Design System & Government UI Standards

- **Typography**: Primary Font: `Inter` / `Roboto`, Regional Font: `Noto Sans` (supporting all 22 official Indian languages).
- **Color Palette**:
  - Primary Brand: Deep Government Blue (`#0F3C5C`)
  - Secondary Accent: Saffron Accent (`#E67E22`)
  - Success Green: (`#27AE60`)
  - Warning Amber: (`#F39C12`)
  - Neutral Dark: (`#1E293B`)
  - Neutral Light: (`#F8FAFC`)
- **Accessibility (WCAG 2.1 AA)**: Minimum contrast ratio `4.5:1` for normal text, `3:1` for large headers. Full TalkBack & VoiceOver screen reader labels (`aria-label`, `accessibilityLabel`).
- **Dynamic Font Scaling**: Support up to `200%` system font scaling without layout clipping.

---

## 8. Security & Storage Policies

1. **Token Storage**:
   - Access Tokens: In-memory React state / Zustand (never stored in `localStorage`).
   - Refresh Tokens: Stored in Secure Keychain (iOS) / KeyStore (Android) / Encrypted HttpOnly Cookie (Web).
2. **Biometric Security**: Face ID / Touch ID / Fingerprint prompt required when accessing Sensitive PII or Document Vault.
3. **Screenshot & Screen Recording Protection**: `FLAG_SECURE` enabled on Android for document review screens; blur overlay applied on iOS app switcher.
4. **Clipboard Policy**: Aadhaar and PAN numbers copied to clipboard are auto-cleared after 30 seconds.

---

## 9. AI & Multi-Lingual Integration Architecture

1. **Streaming Markdown Chat**: WebSockets (`/ws`) stream AI token chunks (`events.ai_stream`) directly into chat bubble components with typewriter animation.
2. **Voice Speech-to-Text**: Audio recorded via `expo-av` / `MediaRecorder API` sent as base64 chunk to `/api/v1/ai/speech-to-text` for multi-lingual conversion.
3. **Vision OCR Interface**: Interactive image previewer highlighting bounding boxes of extracted fields returned by Gemini Vision.

---

## 10. File Upload & Camera Processing

1. **File Selection**: Support Camera capture, Device Image Gallery, and PDF file selection.
2. **Pre-Upload Validation**:
   - File Size: Max `10MB`.
   - MIME Types: `application/pdf`, `image/jpeg`, `image/png`.
3. **Upload Progress**: Chunked multipart upload displaying live progress percentage bar with cancel/retry capabilities.

---

## 11. Testing Strategy

- **Unit Testing**: Jest + React Testing Library for UI primitive components and Zustand store logic (Target: 85% coverage).
- **Integration Testing**: MSW (Mock Service Worker) intercepting REST endpoints to verify form wizard and recommendation state transitions.
- **E2E Testing**: Cypress (Web) & Playwright / Detox (Mobile) end-to-end flows for Login -> Profile Edit -> Scheme Discovery -> Application Submission.
- **Accessibility Audit**: Automated `axe-core` linting & manual VoiceOver / TalkBack walkthroughs.

---

## 12. Phased Implementation Order

```text
Phase 1: Foundation, Auth & Navigation Shell
├── Design System UI Primitives (CompButton, CompInput, CompCard, etc.)
├── Navigation Shell & Protected Route Guards
├── Auth Module Screens (Register, Login, Password Reset, MFA)
└── Zustand & React Query Providers Setup

Phase 2: Citizen Profile & Scheme Discovery
├── Citizen Profile & Demographics Screens (SCR-PROF-01 to 05)
├── Scheme Catalog & Detail Screens (SCR-SCH-01, 02)
├── Eligibility Rules Simulator (SCR-SCH-03)
└── Deterministic Recommendation Dashboard (SCR-DASH-01)

Phase 3: Document Vault & Vision OCR Engine
├── Document Vault Screens (SCR-DOC-01, 02)
├── Vision OCR Field Review Modal (SCR-DOC-03)
└── Document Fullscreen Viewer Dialog (SCR-DOC-04)

Phase 4: Application Workflow & Timelines
├── Application Form Wizard (SCR-APP-02)
├── Application Audit Timeline Tracker (SCR-APP-04)
└── Applications List & Status Filters (SCR-APP-01)

Phase 5: Conversational AI & Realtime Notifications
├── AI Assistant Streaming Chat (SCR-AI-01)
├── Speech-to-Text Voice Recording Modal (SCR-AI-03)
├── Notifications Center & Preferences (SCR-SETT-01, 02)
└── Government Integrations (DigiLocker, Aadhaar e-KYC, DBT)
```

---

## 13. Output Summary Matrix

```text
┌─────────────────────────────────────────────────────────────┐
│                 FRONTEND ESTIMATION MATRIX                  │
├──────────────────────────────────┬──────────────────────────┤
│ Metric                           │ Value                    │
├──────────────────────────────────┼──────────────────────────┤
│ Total Screens & Views            │ 28 Screens & Modals      │
│ Total Reusable UI Components     │ 42 Components            │
│ REST API Integrations            │ 25 Endpoints             │
│ WebSocket Real-Time Listeners    │ 7 Event Types            │
│ Development Implementation Phases│ 5 Phased Sprints         │
│ Architectural Complexity Level   │ Enterprise High          │
└──────────────────────────────────┴──────────────────────────┘
```

---

## 14. Contract Freeze Statement

This document formally constitutes the **Frontend Implementation Contract**. All frontend developers must strictly conform to these screen specifications, API mappings, state architectures, and design system rules without requesting modifications to the locked backend or database engines.
