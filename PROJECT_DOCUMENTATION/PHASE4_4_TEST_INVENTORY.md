# BenefitOS — Phase 4.4 Test Inventory
**Automated Testing Inventory & Test Layer Matrix**

---

## 1. Automated Test Layer Inventory Matrix

| Test Layer | Framework | Status | Mocks / Target |
|---|---|---|---|
| **Backend Unit** | `@nestjs/testing` / Jest | 🟢 VERIFIED | AuthService, UserEntity, RedisService Mocks |
| **Backend Integration** | Supertest / NestJS | 🟢 VERIFIED | HTTP Controllers (`/api/v1/auth`, `/health`) |
| **Database** | Prisma ORM | 🟡 NOT AVAILABLE | Requires dedicated PostgreSQL test container |
| **Frontend Unit** | Vitest + RTL | 🟢 VERIFIED | StorageService, UI Components |
| **API Client** | Axios / Vitest | 🟢 VERIFIED | `api-client.ts` 401 Refresh Interceptor |
| **WebSocket** | Socket.IO Client | 🟢 VERIFIED | Realtime Gateway Mock |
| **AI Services** | Mock Gemini Adapter | 🟢 VERIFIED | `gemini-ai.service.ts` Contract Mock |
| **Government Integrations** | Mock Identity Gateway | 🟢 VERIFIED | Aadhaar & DigiLocker Contract Mocks |
| **Documents / OCR** | Mock OCR Adapter | 🟢 VERIFIED | Document Vault Upload Pipeline Mock |
| **Applications Workflow**| Integration Mocks | 🟢 VERIFIED | Application Status History Machine |
| **E2E Tests** | Playwright Blueprint | 🟡 NOT AVAILABLE | Requires live staging environment |
| **CI Integration** | GitHub Actions | 🟢 VERIFIED | `.github/workflows/ci.yml` |
