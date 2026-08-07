# BenefitOS PAT API Tests Report

| Field | Value |
|-------|-------|
| Document Title | BenefitOS REST API Endpoint Acceptance Test Report |
| Document Number | PAT-API-2026-001 |
| Status | 100% PASSED |
| Target Base URL | `EXPO_PUBLIC_API_URL` (`http://localhost:4000/api/v1`) |
| Date | 2026-08-07 |

---

## 1. REST API Specification Test Matrix

| Test ID | API Endpoint Route | Method | Request DTO | Auth Guard | Response Envelope | Result |
|---------|--------------------|--------|-------------|------------|-------------------|--------|
| `PAT-API-01` | `/api/v1/auth/register` | `POST` | `RegisterDto` | Public | `{ user, tokens }` | 🟢 PASS |
| `PAT-API-02` | `/api/v1/auth/login` | `POST` | `LoginDto` | Public | `{ user, tokens }` | 🟢 PASS |
| `PAT-API-03` | `/api/v1/auth/refresh` | `POST` | `RefreshTokenDto` | Public | `{ tokens }` | 🟢 PASS |
| `PAT-API-04` | `/api/v1/auth/logout` | `POST` | `RefreshTokenDto` | Bearer JWT | `{ message }` | 🟢 PASS |
| `PAT-API-05` | `/api/v1/citizens/me` | `GET` | None | Bearer JWT | `{ profile }` | 🟢 PASS |
| `PAT-API-06` | `/api/v1/citizens/me` | `PUT` | `UpdateCitizenProfileDto` | Bearer JWT | `{ message, profile }` | 🟢 PASS |
| `PAT-API-07` | `/api/v1/schemes` | `GET` | Query params | Public | `{ count, schemes }` | 🟢 PASS |
| `PAT-API-08` | `/api/v1/schemes/:id` | `GET` | Param `id` | Public | `{ scheme }` | 🟢 PASS |
| `PAT-API-09` | `/api/v1/recommendations` | `GET` | None | Bearer JWT | `{ count, recommendations }` | 🟢 PASS |
| `PAT-API-10` | `/api/v1/documents` | `GET` | None | Bearer JWT | `{ count, documents }` | 🟢 PASS |
| `PAT-API-11` | `/api/v1/documents/upload` | `POST` | Multipart FormData | Bearer JWT | `{ message, document }` | 🟢 PASS |
| `PAT-API-12` | `/api/v1/documents/:id` | `DELETE` | Param `id` | Bearer JWT | `{ message }` | 🟢 PASS |
| `PAT-API-13` | `/api/v1/ocr/process/:id` | `POST` | Param `id` | Bearer JWT | `{ message, result }` | 🟢 PASS |
| `PAT-API-14` | `/api/v1/applications` | `GET` | None | Bearer JWT | `{ count, applications }` | 🟢 PASS |
| `PAT-API-15` | `/api/v1/applications/draft` | `POST` | `CreateDraftDto` | Bearer JWT | `{ message, application }` | 🟢 PASS |
| `PAT-API-16` | `/api/v1/notifications` | `GET` | None | Bearer JWT | `{ count, notifications }` | 🟢 PASS |

---

## 2. API Acceptance Verdict: `PASS (100% SPEC COMPLIANT)`
All 16 REST endpoints pass validation pipes, HTTP status codes, and unwrapped data envelopes.
