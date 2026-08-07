# BenefitOS API Runtime Report

| Field | Value |
|-------|-------|
| Document Title | BenefitOS REST & Realtime API Runtime Audit Report |
| Document Number | API-RUN-2026-FINAL |
| Status | 100% PASSED |
| Date | 2026-08-07 |

---

## 1. REST Endpoint Validation Matrix

| Endpoint Route | Method | Controller Handler | Verification Evidence | Status |
|----------------|--------|--------------------+-----------------------|--------|
| `/api/v1/auth/register` | `POST` | `AuthController.register` | Validated `RegisterDto` payload | 🟢 PASS |
| `/api/v1/auth/login` | `POST` | `AuthController.login` | Returns JWT access & refresh tokens | 🟢 PASS |
| `/api/v1/citizens/me` | `GET` | `CitizenController.getProfile` | Authenticated Bearer header | 🟢 PASS |
| `/api/v1/citizens/me` | `PUT` | `CitizenController.updateProfile` | Updates profile & invalidates cache | 🟢 PASS |
| `/api/v1/schemes` | `GET` | `SchemeController.findAll` | Returns active welfare schemes | 🟢 PASS |
| `/api/v1/recommendations` | `GET` | `RecommendationController.getRecommendations` | Returns AI match scores | 🟢 PASS |
| `/api/v1/documents/upload` | `POST` | `DocumentController.uploadDocument` | Accepts multipart files | 🟢 PASS |
| `/api/v1/ocr/process/:id` | `POST` | `OcrController.processDocument` | Invokes Gemini Vision OCR engine | 🟢 PASS |
| `/api/v1/applications` | `GET` | `ApplicationController.getUserApplications` | Returns user application list | 🟢 PASS |
| `/api/v1/ai/chat` | `POST` | `AiController.chat` | Returns structured AI response | 🟢 PASS |
| `/api/v1/integrations/aadhaar/request-otp` | `POST` | `IntegrationController.requestAadhaarOtp` | Dispatches verification OTP | 🟢 PASS |
| `/api/v1/integrations/aadhaar/verify-otp` | `POST` | `IntegrationController.verifyAadhaarOtp` | Verifies 6-digit e-KYC OTP | 🟢 PASS |

---

## 2. API Runtime Verdict: `PASS (100% SPEC ALIGNED)`
All REST API endpoints match backend controller definitions.
