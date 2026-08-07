# System Architecture & Technical Specification - BenefitOS Backend

## Architectural Principles
1. **Clean Architecture & DDD**: Strict layer separation between Domain (`src/domain/`), Application (`src/modules/*/services/`), Interface (`src/modules/*/controllers/`), and Infrastructure (`src/infrastructure/`).
2. **SOLID & Dependency Injection**: High cohesion, low coupling, interface abstractions for repositories, AI, and storage providers.
3. **Event-Driven & Outbox Pattern**: Asynchronous event streaming via Transactional Outbox, Redis Pub/Sub, and BullMQ queues.
4. **Deterministic Core**: Rules-based eligibility evaluation decoupled from non-deterministic generative AI.

## Backend Monolith Layering Diagram

```text
                  HTTP REST Client / WebSockets Client
                                   │
                                   ▼
                          NestJS API Gateway
         [GlobalExceptionFilter | TransformInterceptor | RolesGuard]
                                   │
                                   ▼
                             Controllers
       [AuthController | CitizenController | AiController | RealtimeGateway]
                                   │
                                   ▼
                            Domain Services
         [AuthService | CitizenService | EligibilityEvaluatorService | AiService]
                                   │
          ┌────────────────────────┼────────────────────────┐
          ▼                        ▼                        ▼
    Repositories            AI Adapters             Storage Adapters
[UserRepositoryImpl,     [GeminiAiAdapter,        [LocalStorageAdapter,
 CitizenRepositoryImpl]   AiSafetyService]         SupabaseAdapter]
          │                        │                        │
          ▼                        ▼                        ▼
    PostgreSQL DB            Google Gemini API        Object Storage / S3
```

## Production Implementation Status
- **Backend Implementation**: Fully completed & compiled cleanly (`0` TypeScript errors).
- **Frontend Code**: 0 lines generated (strictly out of scope).
- **Database Migrations / Supabase Schema**: 0 migrations executed (strictly out of scope).