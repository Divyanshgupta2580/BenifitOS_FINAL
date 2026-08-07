# BenefitOS Phase 5.2 API Matrix

| Field | Value |
|-------|-------|
| Document Title | BenefitOS Phase 5.2 Government Integration API Specification |
| Document Number | P52-API-2026-001 |
| Status | 100% ALIGNED |
| Date | 2026-08-07 |

---

## 1. Backend Integration Endpoints Matrix

| Route Path | Method | Controller Handler | DTO / Payload | Description | Status |
|------------|--------|--------------------|---------------|-------------|--------|
| `/api/v1/integrations/aadhaar/request-otp` | `POST` | `IntegrationController.requestAadhaarOtp` | `RequestAadhaarOtpDto` (`aadhaarNumber`) | Dispatches e-KYC verification OTP | 🟢 PASS |
| `/api/v1/integrations/aadhaar/verify-otp` | `POST` | `IntegrationController.verifyAadhaarOtp` | `VerifyAadhaarOtpDto` (`txnId`, `otp`) | Verifies 6-digit e-KYC OTP | 🟢 PASS |
| `/api/v1/integrations/digilocker/authorize` | `GET` | `IntegrationController.getDigiLockerAuthUrl` | None | Returns OAuth2 authorization URL | 🟢 PASS |
| `/api/v1/integrations/digilocker/callback` | `POST` | `IntegrationController.digiLockerCallback` | `{ code: string }` | Handles OAuth2 callback & account link | 🟢 PASS |
| `/api/v1/integrations/dbt/status` | `GET` | `IntegrationController.getDbtStatus` | `aadhaarHash` query param | Retrieves DBT status from PFMS gateway | 🟢 PASS |

---

## 2. API Alignment Verdict: `PASS (0 MISSING ENDPOINTS)`
All consumed APIs exist in NestJS `IntegrationController`. Zero endpoints invented.
