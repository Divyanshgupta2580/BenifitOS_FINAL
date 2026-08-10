# BenefitOS — Phase 4.4.3 Test Inventory
**Expanded Critical-Path Test File Inventory**

---

## 1. Test File Matrix

| Path | Framework | Suites | Test Cases | Target Module |
| :--- | :--- | :---: | :---: | :--- |
| `apps/backend/src/modules/auth/auth.service.spec.ts` | Jest / `@nestjs/testing` | 1 | 3 | AuthService |
| `apps/backend/src/modules/auth/auth.controller.spec.ts` | Jest / `@nestjs/testing` | 1 | 2 | AuthController |
| `apps/backend/src/modules/documents/document.service.spec.ts` | Jest | 1 | 2 | DocumentService |
| `apps/backend/src/modules/applications/application.service.spec.ts` | Jest | 1 | 2 | ApplicationService |
| `apps/backend/src/modules/recommendations/recommendation.service.spec.ts` | Jest | 1 | 1 | RecommendationService |
| `apps/backend/src/modules/ai/ai.service.spec.ts` | Jest | 1 | 1 | AiService Contract |
| `apps/backend/src/modules/integrations/integration.service.spec.ts` | Jest | 1 | 2 | IntegrationGateway Contract |
| `apps/backend/src/modules/notifications/notification.gateway.spec.ts` | Jest | 1 | 1 | NotificationGateway |
| `apps/frontend/src/services/storage.service.spec.ts` | Vitest | 1 | 3 | StorageService |
| `apps/frontend/src/services/api-client.spec.ts` | Vitest | 1 | 2 | ApiClient |
