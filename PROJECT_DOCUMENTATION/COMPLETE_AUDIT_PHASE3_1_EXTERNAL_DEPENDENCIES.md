# BenefitOS — Complete Codebase Audit Phase 3.1 External Dependencies
**External Service & Staging Integration Inventory**

---

## 1. External Service Dependency Matrix

| Service | Category | Required Production Asset | Onboarding Status |
| :--- | :--- | :--- | :--- |
| **UIDAI Aadhaar e-KYC** | Government National Registry | SSL Client Cert + IP Allowlist | 🔴 Pending Production Credentials |
| **DigiLocker** | Government Document Locker | OAuth Client ID + Secret | 🔴 Pending Redirect URI Approval |
| **Google Gemini API** | AI & Vision OCR Provider | `GEMINI_API_KEY` | 🔴 Pending Production Env Key |
| **PostgreSQL 15+** | Relational Managed DB | `DATABASE_URL` Connection | 🟡 Configurable via ENV |
| **Redis Cache** | Distributed Revocation Store | `REDIS_URL` Connection | 🟡 Configurable via ENV |

---

## 2. Dependency Risk Assessment
All external service integrations possess clean fallback mechanisms and verified DTO contracts inside NestJS backend adapters (`GeminiAiAdapter`, `AadhaarIntegrationService`, `DigiLockerIntegrationService`).
