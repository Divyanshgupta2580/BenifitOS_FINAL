# Project Architecture Understanding

## 1. System Overview

BenefitOS is built as a **modular, cloud‑native platform** that separates concerns across distinct layers while maintaining a tight integration between frontend, backend, and external services.

```
+-------------------+      +-------------------+      +-------------------+
|   Frontend SPA   | <-- |   API Gateway &  | -->  |   Backend (NestJS) |
|  (React/Next.js) |      |  Authentication   |      |   - Domain Layer   |
+-------------------+      +-------------------+      |   - Application    |
                                                   |   - Infrastructure |
                                                   +----------+--------+
                                                              |
                 +---------------------------+                |
                 |   Asynchronous Workers   | <--------------+
                 | (BullMQ, Redis)          |
                 +---------------------------+
```

## 2. Frontend Layer
- **Framework**: React with Next.js for server‑side rendering and routing.
- **State Management**: React Query for data fetching/caching; Zustand for UI state.
- **Styling**: Vanilla CSS with modern design patterns (glassmorphism, dark mode, smooth micro‑animations).
- **Authentication**: JWT access + refresh tokens stored in HttpOnly cookies; role‑based UI rendering.
- **Real‑time**: WebSocket (Socket.io) for live status updates and notifications.
- **Accessibility**: WCAG‑2.1 compliance, ARIA landmarks, focus management.

## 3. Backend Layer (NestJS)
### 3.1 Architectural Style
- **Clean/Hexagonal Architecture** – core domain isolated from frameworks.
- **Layers**:
  - **Domain** – entities, value objects, business rules.
  - **Application** – use‑cases / services orchestrating domain logic.
  - **Infrastructure** – adapters for persistence, external APIs, queues.
- **Dependency Injection** – NestJS DI container wires implementations to interfaces.

### 3.2 Core Modules
| Module | Responsibility |
|--------|-----------------|
| `Auth` | JWT issuance, refresh flow, RBAC enforcement |
| `Citizen` | Profile CRUD, household management |
| `Benefit` | Definitions, eligibility engine (externalized) |
| `Application` | Submission workflow, state machine, audit log |
| `Integration` | Government API adapters, signed requests |
| `AI Copilot` | Gemini API orchestration, recommendation aggregation |
| `Notification` | Email/SMS/Push dispatch via workers |
| `OCR` | Document ingestion, Cloud Vision integration |
| `Queue` | BullMQ job definitions, workers, retry policies |
| `Observability` | OpenTelemetry, Prometheus metrics, structured logging |

### 3.3 Persistence
- **ORM**: Prisma with PostgreSQL.
- **Schema**: Separate schemas for `public` (core data) and `audit` (immutable event store).
- **Outbox Pattern**: Domain events written to `outbox` table, processed by a dedicated worker to guarantee exactly‑once delivery to external systems.

### 3.4 Asynchronous Processing
- **BullMQ + Redis** for job queues.
- Workers run in isolated processes handling:
  - OCR extraction
  - AI inference (Gemini)
  - Government verification calls
  - Notification delivery
  - Retry/back‑off strategies with exponential delays.

## 4. External Services
- **Google Gemini** – multimodal AI for recommendations, document summarization, conversational copilot.
- **Google Cloud Vision** – OCR of uploaded PDFs/images.
- **Government APIs** – Custom adapters using mutual TLS, JWT signing, and audit logging.
- **Email/SMS Providers** – SendGrid, Twilio (plug‑able via `Notifier` interface).

## 5. Security Model
- **Zero‑Trust**: All inbound traffic validated; no trusted internal network.
- **Authentication**: OAuth2‑style JWT with short‑lived access tokens (5‑15 min) and rotating refresh tokens.
- **Authorization**: RBAC policies defined per API route; fine‑grained permissions for citizen, admin, auditor roles.
- **Data Protection**: At‑rest encryption (PostgreSQL Transparent Data Encryption), in‑flight TLS 1.3.
- **Secret Management**: HashiCorp Vault / `.env` with strict CI/CD injection.
- **Rate Limiting & WAF**: Helmet, express-rate-limit, and Cloudflare WAF in front of the API gateway.

## 6. Observability & Reliability
- **Tracing**: OpenTelemetry instrumentation across HTTP, gRPC, database, and queue layers; exported to Jaeger.
- **Metrics**: Prometheus counters for request latency, error rates, queue depth; Grafana dashboards.
- **Logging**: Structured JSON logs via Pino, piped to Loki/Elastic.
- **Health Checks**: `/healthz` endpoint aggregates DB, Redis, and external integration status.
- **Circuit Breakers**: `opossum` pattern for flaky government endpoints.

## 7. Deployment & DevOps
- **Containerisation**: Docker images built per service (frontend, backend, worker).
- **Orchestration**: Kubernetes (EKS) with Helm charts; can run locally via `docker-compose`.
- **CI/CD**: GitHub Actions run lint, unit tests, integration tests, then push images to ECR and deploy via ArgoCD.
- **Secrets**: Injected via Kubernetes Secrets and sealed‑secrets.

## 8. Extensibility Guidelines
- **Add New Benefit**: Extend `benefit` schema, implement rule engine plugin, expose via API.
- **Swap AI Provider**: Implement `AIAdapter` interface; register in DI container.
- **New Notification Channel**: Add a `Notifier` implementation and register.
- **Additional Government Integration**: Follow `GovIntegration` contract; configure signing keys.

---
*This document captures the current architectural understanding derived from the source code, configuration files, and implementation plan.*
