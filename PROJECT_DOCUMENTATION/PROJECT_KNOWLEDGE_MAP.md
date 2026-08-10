# Project Knowledge Map

## Core Domains
- **Citizen**: Central user entity with personal data, household members, and linked documents.
- **Benefit Programs**: Definitions, eligibility rules, and lifecycle states.
- **Applications**: Submission data, status tracking, and audit trails.
- **Government Integrations**: Connectors for external agencies (e.g., IRS, SSA) handling data exchange and verification.
- **AI Copilot**: Orchestrates user‑centric interactions, pulls OCR results, recommendation signals, and status updates.
- **Notifications**: Email, SMS, and push channels for real‑time updates.

## Major Sub‑systems
| Sub‑system | Description | Primary Tech |
|------------|-------------|--------------|
| Frontend SPA | React/Next.js UI, state managed via React Query, authentication via JWT, UI components styled with modern CSS (glassmorphism, dark mode). | React, TypeScript |
| API Gateway / Backend | NestJS monolith exposing REST/GraphQL, business logic, domain services, data persistence via Prisma, background workers via BullMQ. | NestJS, Prisma, BullMQ |
| Database | PostgreSQL storing citizen records, benefit definitions, application data, audit logs. | PostgreSQL |
| Queue & Workers | Asynchronous processing for OCR, AI inference, external API calls, email/SMS dispatch. | BullMQ, Redis |
| AI Services | Gemini API integration for multimodal reasoning, recommendation generation, document summarization. | Google Gemini SDK |
| OCR Service | Cloud Vision OCR processing of uploaded documents. | Google Cloud Vision |
| External Integrations | Secure, signed HTTP calls to government APIs, with retries and audit logging. | Custom adapters |
| Observability | OpenTelemetry tracing, Prometheus metrics, Pino logging, Grafana dashboards. | OpenTelemetry, Prometheus |
| Security | Zero‑trust architecture, JWT access & refresh tokens, RBAC, rate limiting, content‑security policies. | Auth0 (or internal), Helmet |

## Key User Journeys
1. **Onboarding** – Citizen registers, verifies email, completes profile.
2. **Document Upload** – Uploads PDFs, triggers OCR, stores extracted text.
3. **Benefit Discovery** – AI Copilot suggests relevant programs based on profile & documents.
4. **Application Submission** – Citizen fills form, backend validates, queues external verification.
5. **Government Verification** – Integration adapters exchange data, status updates propagated via events.
6. **Notification** – Real‑time status updates via WebSocket and push/email.

## Data Flow Highlights
- Frontend → API (JWT) → Domain Services → Prisma → PostgreSQL.
- File upload → S3 (or local) → OCR worker → extracted text stored in DB.
- AI Copilot request → Gemini API → response stored & presented.
- Application → Integration Queue → Gov API Adapter → response → Event Bus → UI update.

## Extensibility Points
- Add new **Benefit** types by updating the `benefit` schema and rules engine.
- Plug in additional **AI providers** via the `AIAdapter` interface.
- Introduce new **notification channels** by implementing the `Notifier` contract.
- Extend **government integrations** with new adapters following the `GovIntegration` pattern.

*This knowledge map captures the high‑level concepts and inter‑connections of the BenefitOS platform as discovered from the source code and documentation.*
