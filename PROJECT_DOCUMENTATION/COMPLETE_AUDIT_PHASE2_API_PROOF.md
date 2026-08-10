# BenefitOS — Complete Codebase Audit Phase 2 API Proof
**Controller-to-Client 1:1 API Contract Proof Matrix**

---

## 1. Complete API Endpoint Proof Matrix

| # | Backend Endpoint | Frontend Caller File | HTTP Method | Input DTO | Response Contract | Auth Guard | Contract Verified |
|---|---|---|---|---|---|---|---|
| 1 | `/api/v1/auth/register` | `RegisterScreen.tsx` | POST | `RegisterDto` | User & AccessToken + HttpOnly Cookie | Public | 🟢 VERIFIED |
| 2 | `/api/v1/auth/login` | `LoginScreen.tsx` | POST | `LoginDto` | User & AccessToken + HttpOnly Cookie | Public | 🟢 VERIFIED |
| 3 | `/api/v1/auth/refresh` | `api-client.ts` | POST | `RefreshTokenDto` / Cookie | AccessToken + HttpOnly Cookie | Public | 🟢 VERIFIED |
| 4 | `/api/v1/auth/logout` | `useAuthStore.ts` | POST | Optional Cookie | Success Message + Clear Cookie | JwtAuthGuard | 🟢 VERIFIED |
| 5 | `/api/v1/citizen/profile` | `CitizenProfileScreen.tsx` | GET | None | `CitizenProfileDto` | JwtAuthGuard | 🟢 VERIFIED |
| 6 | `/api/v1/citizen/demographics`| `DemographicsEditScreen.tsx`| PATCH | `UpdateDemographicsDto`| Updated Profile DTO | JwtAuthGuard | 🟢 VERIFIED |
| 7 | `/api/v1/citizen/address` | `AddressEditScreen.tsx` | PATCH | `UpdateAddressDto` | Updated Profile DTO | JwtAuthGuard | 🟢 VERIFIED |
| 8 | `/api/v1/citizen/household` | `HouseholdMembersScreen.tsx`| POST | `CreateHouseholdDto` | Created Member DTO | JwtAuthGuard | 🟢 VERIFIED |
| 9 | `/api/v1/citizen/land` | `LandDetailsScreen.tsx` | POST | `CreateLandDto` | Created Record DTO | JwtAuthGuard | 🟢 VERIFIED |
| 10 | `/api/v1/schemes` | `SchemeCatalogScreen.tsx` | GET | Query Params | Scheme DTO Array | JwtAuthGuard | 🟢 VERIFIED |
| 11 | `/api/v1/schemes/:id` | `SchemeDetailScreen.tsx` | GET | Param `id` | Scheme Detail DTO | JwtAuthGuard | 🟢 VERIFIED |
| 12 | `/api/v1/schemes/:id/simulate`| `EligibilitySimulatorScreen.tsx`| POST | `SimulateDto` | Score & Match Reason | JwtAuthGuard | 🟢 VERIFIED |
| 13 | `/api/v1/recommendations` | `RecommendationDashboardScreen.tsx`| GET | Query Params | Recommendation DTO Array | JwtAuthGuard | 🟢 VERIFIED |
| 14 | `/api/v1/recommendations/:id`| `RecommendationDetailScreen.tsx`| GET | Param `id` | Breakdown DTO | JwtAuthGuard | 🟢 VERIFIED |
| 15 | `/api/v1/recommendations/:id/explain`| `RecommendationExplanationScreen.tsx`| GET | Param `id` | Explanation DTO | JwtAuthGuard | 🟢 VERIFIED |
| 16 | `/api/v1/documents` | `DocumentVaultScreen.tsx` | GET | Query Params | Vault Document Array | JwtAuthGuard | 🟢 VERIFIED |
| 17 | `/api/v1/documents/upload` | `DocumentUploadScreen.tsx` | POST | Multipart FormData | Uploaded Document Meta | JwtAuthGuard | 🟢 VERIFIED |
| 18 | `/api/v1/documents/:id/ocr` | `OcrReviewScreen.tsx` | POST | Param `id` | OCR Attribute Payload | JwtAuthGuard | 🟢 VERIFIED |
| 19 | `/api/v1/applications` | `ApplicationWizardScreen.tsx` | GET/POST | `CreateApplicationDto`| Applications Array/Item | JwtAuthGuard | 🟢 VERIFIED |
| 20 | `/api/v1/applications/:id/timeline`| `ApplicationTimelineScreen.tsx`| GET | Param `id` | Timeline Event Array | JwtAuthGuard | 🟢 VERIFIED |
| 21 | `/api/v1/ai/chat` | `AiAssistantScreen.tsx` | POST | `AiChatDto` | Response Text & History | JwtAuthGuard | 🟢 VERIFIED |
| 22 | `/api/v1/ai/copilot` | `AiCopilotScreen.tsx` | POST | `AiCopilotDto` | Reasoning & Source Array| JwtAuthGuard | 🟢 VERIFIED |
| 23 | `/api/v1/integrations/aadhaar/otp`| `GovernmentServicesScreen.tsx`| POST | `AadhaarOtpDto` | Transaction ID | JwtAuthGuard | 🟢 VERIFIED |

---

## 2. API Contract Verdict
All 23 NestJS endpoints map 1:1 with corresponding frontend caller methods. Zero orphan endpoints or unhandled DTO payload shapes exist.
