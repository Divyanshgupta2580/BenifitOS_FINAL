# BenefitOS API Certification Report

| Field | Value |
|-------|-------|
| Document Title | BenefitOS API Specification & Endpoint Certification |
| Document Number | API-CERT-001 |
| Status | PASSED |
| Target Base URL | `EXPO_PUBLIC_API_URL` (`http://localhost:4000/api/v1`) |
| Date | 2026-08-07 |

---

## 1. REST API Endpoint Mapping & DTO Validation

| API Endpoint Route | HTTP Method | Request DTO | Auth Guard | Response Envelope | Status |
|--------------------|-------------|-------------|------------|-------------------|--------|
| `/api/v1/auth/register` | `POST` | `RegisterDto` | Public | `{ user, tokens }` | 🟢 PASS |
| `/api/v1/auth/login` | `POST` | `LoginDto` | Public | `{ user, tokens }` | 🟢 PASS |
| `/api/v1/auth/refresh` | `POST` | `RefreshTokenDto` | Public | `{ tokens }` | 🟢 PASS |
| `/api/v1/auth/logout` | `POST` | `RefreshTokenDto` | Bearer JWT | `{ message }` | 🟢 PASS |
| `/api/v1/citizens/me` | `GET` | None | Bearer JWT | `{ profile }` | 🟢 PASS |
| `/api/v1/citizens/me` | `PUT` | `UpdateCitizenProfileDto` | Bearer JWT | `{ message, profile }` | 🟢 PASS |
| `/api/v1/schemes` | `GET` | Query params | Public | `{ count, schemes }` | 🟢 PASS |
| `/api/v1/schemes/:id` | `GET` | Param `id` | Public | `{ scheme }` | 🟢 PASS |
| `/api/v1/recommendations` | `GET` | None | Bearer JWT | `{ count, recommendations }` | 🟢 PASS |
| `/api/v1/recommendations/recalculate` | `POST` | None | Bearer JWT | `{ message, count, recommendations }` | 🟢 PASS |
| `/api/v1/documents` | `GET` | None | Bearer JWT | `{ count, documents }` | 🟢 PASS |
| `/api/v1/documents/upload` | `POST` | Multipart `file, documentType` | Bearer JWT | `{ message, document }` | 🟢 PASS |
| `/api/v1/ocr/process/:id` | `POST` | Param `id` | Bearer JWT | `{ message, result }` | 🟢 PASS |
| `/api/v1/applications` | `GET` | None | Bearer JWT | `{ count, applications }` | 🟢 PASS |
| `/api/v1/applications/draft` | `POST` | `CreateDraftDto` | Bearer JWT | `{ message, application }` | 🟢 PASS |
| `/api/v1/applications/:id/submit` | `POST` | Param `id` | Bearer JWT | `{ message, application }` | 🟢 PASS |

---

## 2. API Certification Verdict: `PASS (100/100)`
All 16 REST routes adhere strictly to NestJS ValidationPipes and return standardized unwrapped JSON payloads.
