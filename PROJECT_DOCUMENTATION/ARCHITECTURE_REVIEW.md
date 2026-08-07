# BenefitOS Enterprise Architecture Review

| Field | Value |
|-------|-------|
| Document Title | BenefitOS Full System Architecture & Layering Review |
| Document Number | ARC-REV-001 |
| Status | APPROVED WITH MINOR RECOMMENDATIONS |
| Date | 2026-08-07 |

---

## 1. System Architecture Overview

BenefitOS is structured as a decoupled, multi-tier microservices architecture:

```text
┌─────────────────────────────────────────────────────────────┐
│                 BENEFITOS CLIENT LAYER                      │
│      Expo 52 / React Native 0.76 / React Native Web        │
└──────────────┬──────────────────────────────┬───────────────┘
               │ REST HTTP (axios)            │ Socket.IO /ws
               ▼                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 NESTJS 11 BACKEND ENGINE                    │
│   Auth • Citizen • Welfare • Recs • Vault • OCR • App       │
└──────────────┬──────────────────────────────┬───────────────┘
               │ Prisma ORM 6                 │ Supabase Storage
               ▼                              ▼
┌──────────────────────────────────────────────┐┌──────────────┐
│           POSTGRESQL 15 DATABASE             ││ SUPABASE S3  │
│        Tables • Schemas • RLS Policies       ││ BUCKET VAULT │
└──────────────────────────────────────────────┘└──────────────┘
```

---

## 2. Layering Integrity & Separation of Concerns

1. **Frontend Non-Execution Policy**:
   - **Verification**: 100% verified across all screens and services.
   - The frontend NEVER calculates workflow state, application status, scheme match percentage, or OCR confidence scores. All evaluation logic resides in backend NestJS services (`EligibilityEvaluatorService`, `RecommendationEngineService`, `OcrPipelineService`, `ApplicationWorkflowService`).
2. **State Management Cleanliness**:
   - `auth.store.ts` (Zustand): Clean token & user state persistence via `storageService`.
   - `language.store.ts` (Zustand): Locale persistence (`en`, `hi`, `ta`, `te`, etc.).
   - `@tanstack/react-query`: Server state caching with `staleTime` ranging from 2 minutes (notifications) to 10 minutes (scheme catalog).
3. **Navigation Architecture**:
   - Single-root conditional state stack router in `AppNavigator.tsx` cleanly separates `AuthStack` from `AuthenticatedAppStack`.

---

## 3. Architecture Strengths & Identified Risks

### Strengths
- **Clean Interface Decoupling**: Frontend services wrap HTTP requests into strongly typed TypeScript contracts matching NestJS controller DTOs.
- **Unwrapped Response Interceptor**: `apiClient` response interceptor standardizes backend `{ success: true, data: ... }` unwrapping across all hooks.
- **Zero Heavy Native Dependencies**: Framework relies strictly on Expo 52 compatible web/mobile modules (`AsyncStorage`, `axios`, `socket.io-client`).

### Identified Architecture Risks
- **In-Memory Component Mutations**: As detailed in `BUG-001` and `BUG-002`, `HouseholdMembersScreen` and `LandDetailsScreen` bypass React Query mutations to mutate arrays in component state.
- **WebSocket Reconnection Handling**: Socket.IO client requires dynamic token supplier to prevent reconnection failures upon JWT token rotation (`BUG-008`).

---

## 4. Architectural Verdict: `APPROVED (PASS)`
The overall architecture of BenefitOS demonstrates enterprise maturity, clean layering, strict separation of concerns, and compliance with the backend single-source-of-truth governance policy.
