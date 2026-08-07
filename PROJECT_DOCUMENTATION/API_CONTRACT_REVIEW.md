# BenefitOS Enterprise API Contract Review

| Field | Value |
|-------|-------|
| Document Title | BenefitOS API Contract & DTO Audit |
| Document Number | API-REV-001 |
| Status | APPROVED WITH MINOR RECOMMENDATIONS |
| Scope | NestJS Controllers, DTO Payload Alignments, Unwrapped Data Envelopes |
| Date | 2026-08-07 |

---

## 1. Master API Alignment Matrix

| Frontend Service File | Target Backend Controller | HTTP Method | Endpoint Route | DTO / Payload Alignment | Contract Status |
|-----------------------|---------------------------|-------------|----------------|-------------------------|-----------------|
| `auth.store.ts` | `auth.controller.ts` | `POST` | `/auth/login` | `{ email, password }` -> `{ user, tokens }` | 🟢 MATCHED |
| `auth.store.ts` | `auth.controller.ts` | `POST` | `/auth/register` | `{ email, password, role }` -> `{ user, tokens }` | 🟢 MATCHED |
| `auth.store.ts` | `auth.controller.ts` | `POST` | `/auth/logout` | `{ refreshToken }` -> `{ message }` | 🟢 MATCHED |
| `citizen.service.ts` | `citizen.controller.ts` | `GET` | `/citizens/me` | `{ profile: CitizenProfile }` | 🟢 MATCHED |
| `citizen.service.ts` | `citizen.controller.ts` | `PUT` | `/citizens/me` | `UpdateCitizenProfileDto` | 🟢 MATCHED |
| `welfare.service.ts` | `welfare.controller.ts` | `GET` | `/schemes` | Params: `category, search, page, limit` | 🟢 MATCHED |
| `welfare.service.ts` | `welfare.controller.ts` | `GET` | `/schemes/:id` | `{ scheme: WelfareSchemeDetail }` | 🟢 MATCHED |
| `recommendation.service.ts` | `recommendation.controller.ts` | `GET` | `/recommendations` | `{ count, recommendations: [...] }` | 🟢 MATCHED |
| `document.service.ts` | `document.controller.ts` | `GET` | `/documents` | `{ count, documents: [...] }` | 🟢 MATCHED |
| `document.service.ts` | `document.controller.ts` | `POST` | `/documents/upload` | Multipart FormData `file`, `documentType` | 🟢 MATCHED |
| `ocr.service.ts` | `ocr.controller.ts` | `POST` | `/ocr/process/:documentId` | `{ message, result }` | 🟢 MATCHED |
| `application.service.ts` | `application.controller.ts` | `GET` | `/applications` | `{ count, applications: [...] }` | 🟢 MATCHED |
| `application.service.ts` | `application.controller.ts` | `GET` | `/applications/:id` | `{ application: ApplicationItem }` | 🟢 MATCHED |
| `application.service.ts` | `application.controller.ts` | `POST` | `/applications` | `{ schemeId, formData, attachedDocumentIds }` | 🟢 MATCHED |
| `notification.service.ts` | `notification.controller.ts` | `GET` | `/notifications` | `{ count, notifications: [...] }` | 🟢 MATCHED |

---

## 2. Payload Unwrapping & Interceptor Integrity

NestJS controllers wrap responses in `{ success: true, data: ... }`. The frontend `api-client.ts` response interceptor:
```typescript
apiClient.interceptors.response.use(
  (response) => {
    if (response.data && response.data.success !== undefined && response.data.data !== undefined) {
      return response.data.data;
    }
    return response.data;
  },
  ...
);
```
This unwrapping policy ensures seamless generic typing (`apiClient.get<any, T>(url)`) across all React Query hooks.

---

## 3. Contract Verdict: `APPROVED (PASS)`
Zero invented DTOs, zero database schema violations, 100% contract compliance verified.
