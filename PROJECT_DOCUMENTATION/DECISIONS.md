# Architecture Decision Records (ADR) - BenefitOS

## ADR-001: Domain Model Primacy over Persistence ORM Models
- **Context**: Relying on auto-generated Prisma models directly inside business logic couples domain behavior to database column layouts.
- **Decision**: Domain Entities (`src/domain/`) are pure TypeScript classes encapsulating business rules, invariants, and calculations. Repositories map between Domain Entities and Prisma persistence records.
- **Trade-offs**: Requires explicit Data Mapper code in repository implementations, but guarantees clean architecture decoupling.

## ADR-002: Pluggable AI Provider Abstraction
- **Context**: Hardcoding Google Gemini SDK directly into application services introduces vendor lock-in.
- **Decision**: Introduce `IAiProvider`, `IVisionOcrProvider`, and `ISpeechToTextProvider` interfaces with `AiProviderFactory` supporting Gemini, OpenAI, Claude, and Sarvam AI.
- **Trade-offs**: Minor abstraction overhead; provides high availability and multi-model fallbacks.

## ADR-003: Guaranteed Deterministic Eligibility Evaluation
- **Context**: LLMs are non-deterministic and can produce inaccurate eligibility advice.
- **Decision**: Welfare scheme eligibility is calculated 100% deterministically by `EligibilityEvaluatorService`. LLMs receive already-computed outcome data to generate clear multi-lingual explanations.
- **Trade-offs**: None. Ensures legal compliance and transparency.

## ADR-004: Transactional Outbox Pattern for Async Events
- **Context**: Direct message queue publishing during HTTP requests risks dual-write inconsistencies if queue publishing fails.
- **Decision**: Events are written to the `outbox_events` table inside the DB transaction, and asynchronously relayed to Redis Pub/Sub and BullMQ queues by `OutboxRelayWorker`.
- **Trade-offs**: Increases database writes slightly, but guarantees event delivery reliability.
