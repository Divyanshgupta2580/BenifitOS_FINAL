# BenefitOS — Complete Codebase Audit Phase 1 API Inventory
**REST Endpoint & DTO Contract Inventory**

---

## 1. Backend Endpoint Inventory

| Module | Route Endpoint | Method | DTO Input | Response Contract | Security Guard |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Auth** | `/api/v1/auth/register` | POST | `RegisterDto` | User & AccessToken + HttpOnly Cookie | Public |
| **Auth** | `/api/v1/auth/login` | POST | `LoginDto` | User & AccessToken + HttpOnly Cookie | Public |
| **Auth** | `/api/v1/auth/refresh` | POST | `RefreshTokenDto` / Cookie | AccessToken + HttpOnly Cookie | Public |
| **Auth** | `/api/v1/auth/logout` | POST | Optional Cookie / DTO | Success Message + Clear Cookie | JwtAuthGuard |
| **Citizen** | `/api/v1/citizen/profile` | GET | None | `CitizenProfileDto` | JwtAuthGuard |
| **Citizen** | `/api/v1/citizen/demographics`| PATCH | `UpdateDemographicsDto` | Updated Profile | JwtAuthGuard |
| **Citizen** | `/api/v1/citizen/address` | PATCH | `UpdateAddressDto` | Updated Profile | JwtAuthGuard |
| **Citizen** | `/api/v1/citizen/household` | POST | `CreateHouseholdDto` | Created Member | JwtAuthGuard |
| **Citizen** | `/api/v1/citizen/land` | POST | `CreateLandDto` | Created Record | JwtAuthGuard |
| **Schemes** | `/api/v1/schemes` | GET | Query Params | List of Schemes | JwtAuthGuard |
| **Schemes** | `/api/v1/schemes/:id` | GET | `id` param | Scheme Details | JwtAuthGuard |
| **Schemes** | `/api/v1/schemes/:id/simulate`| POST | `SimulateDto` | Score & Match Reason | JwtAuthGuard |
| **Recommendations**| `/api/v1/recommendations` | GET | Query Params | Recommended Schemes | JwtAuthGuard |
| **Recommendations**| `/api/v1/recommendations/:id`| GET | `id` param | Recommendation Breakdown | JwtAuthGuard |
| **Recommendations**| `/api/v1/recommendations/:id/explain`| GET| `id` param | Natural Language Reasoning| JwtAuthGuard |
| **Documents** | `/api/v1/documents` | GET | Query Params | List of Vault Docs | JwtAuthGuard |
| **Documents** | `/api/v1/documents/upload` | POST | Multipart FormData | Uploaded Document Meta | JwtAuthGuard |
| **OCR** | `/api/v1/documents/:id/ocr` | POST | None | Extracted OCR Attributes | JwtAuthGuard |
| **Applications** | `/api/v1/applications` | GET/POST | `CreateApplicationDto`| Applications List/Item | JwtAuthGuard |
| **Applications** | `/api/v1/applications/:id/timeline`| GET| `id` param | Lifecycle Timeline DTO | JwtAuthGuard |
| **AI Assistant** | `/api/v1/ai/chat` | POST | `AiChatDto` | Response text & history | JwtAuthGuard |
| **AI Copilot** | `/api/v1/ai/copilot` | POST | `AiCopilotDto` | Reasoning & sources | JwtAuthGuard |
| **Integrations** | `/api/v1/integrations/aadhaar/otp`| POST| `AadhaarOtpDto` | Transaction ID | JwtAuthGuard |

---

## 2. API Contract Mismatch Audit
- **Orphan Endpoints**: 0
- **Disconnected Endpoints**: 0
- **Shape Mismatches**: 0
- **Verdict**: 🟢 All 23 backend API endpoints map cleanly to frontend services.
