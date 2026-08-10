# BenefitOS — Phase 6.0 Route Migration Map

## 1. Executive Summary
This document defines the explicit route migration strategy converting BenefitOS from state-driven switch step navigation inside `AppNavigator.tsx` to standard browser URL routes powered by `react-router-dom` (`BrowserRouter`).

---

## 2. Complete Route Mapping Matrix

| Original AppNavigator Step State | Target Web URL Route | Access Level | Screen Component | Functionality |
| :--- | :--- | :--- | :--- | :--- |
| **`LANGUAGE`** | `/language` | Public | `LanguageSelectScreen` | Language selection screen |
| **`ONBOARDING`** | `/onboarding` | Public | `OnboardingScreen` | Platform onboarding & overview |
| **`LOGIN`** | `/login` | Public (Guest) | `LoginScreen` | Citizen & Officer Auth Login |
| **`REGISTER`** | `/register` | Public (Guest) | `RegisterScreen` | New Citizen Account Registration |
| **`RESET`** | `/reset-password` | Public | `PasswordResetScreen` | Password Reset Request & Form |
| **`MFA`** | `/mfa-setup` | Public/Auth | `MfaSetupScreen` | Multi-Factor Authentication Setup |
| **`DASHBOARD`** | `/dashboard` | Protected | `DashboardScreen` | Main Citizen Central Portal |
| **`PROFILE_OVERVIEW`** | `/profile` | Protected | `CitizenProfileScreen` | Citizen Profile Overview |
| **`PROFILE_DEMOGRAPHICS`**| `/profile/demographics` | Protected | `DemographicsEditScreen` | Edit Personal Demographics |
| **`PROFILE_ADDRESS`** | `/profile/address` | Protected | `AddressEditScreen` | Edit Resident Address |
| **`PROFILE_HOUSEHOLD`** | `/profile/household` | Protected | `HouseholdMembersScreen` | Manage Household Dependents |
| **`PROFILE_LAND`** | `/profile/land` | Protected | `LandDetailsScreen` | Manage Agriculture Land Records |
| **`SCHEMES_CATALOG`** | `/schemes` | Protected | `SchemeCatalogScreen` | Search & Filter Welfare Schemes |
| **`SCHEME_DETAIL`** | `/schemes/:id` | Protected | `SchemeDetailScreen` | Welfare Scheme Full Details |
| **`ELIGIBILITY_SIMULATOR`**| `/schemes/:id/simulate` | Protected | `EligibilitySimulatorScreen` | Interactive Rule Simulator |
| **`RECOMMENDATIONS_DASHBOARD`**| `/recommendations` | Protected | `RecommendationDashboardScreen` | AI Scheme Recommendations |
| **`RECOMMENDATION_DETAIL`**| `/recommendations/:id` | Protected | `RecommendationDetailScreen` | Match Breakdown & Requirements |
| **`RECOMMENDATION_EXPLANATION`**| `/recommendations/:id/explain` | Protected | `RecommendationExplanationScreen` | AI Natural Language Explanation |
| **`RECOMMENDATION_COMPARISON`**| `/recommendations/compare` | Protected | `RecommendationComparisonScreen` | Side-by-Side Scheme Comparison |
| **`DOCUMENT_VAULT`** | `/documents` | Protected | `DocumentVaultScreen` | Digital Document Vault |
| **`DOCUMENT_UPLOAD`** | `/documents/upload` | Protected | `DocumentUploadScreen` | Web File Upload & Vault Store |
| **`DOCUMENT_VIEWER`** | `/documents/:id` | Protected | `DocumentViewerModal` | Browser Document Preview |
| **`OCR_REVIEW`** | `/documents/:id/ocr` | Protected | `OcrReviewScreen` | Vision OCR Result Review |
| **`APPLICATIONS_LIST`** | `/applications` | Protected | `ApplicationsListScreen` | Applied Welfare Schemes List |
| **`APPLICATION_WIZARD`** | `/applications/new` | Protected | `ApplicationWizardScreen` | Application Submission Wizard |
| **`APPLICATION_TIMELINE`**| `/applications/:id/timeline` | Protected | `ApplicationTimelineScreen` | Realtime Tracking Timeline |
| **`APPLICATION_DETAIL`** | `/applications/:id` | Protected | `ApplicationDetailScreen` | Submitted Application Details |
| **`AI_ASSISTANT`** | `/ai/chat` | Protected | `AiAssistantScreen` | Welfare Chatbot Interface |
| **`AI_COPILOT`** | `/ai/copilot` | Protected | `AiCopilotScreen` | AI Citizen Copilot Workspace |
| **`GOVERNMENT_SERVICES`** | `/government-services` | Protected | `GovernmentServicesScreen` | DigiLocker/Aadhaar Integrations |

---

## 3. Web Navigation Principles & Protection Guards
1. **Browser Navigation Integrity**: Full support for Browser Back, Browser Forward, and Direct URL Link Sharing.
2. **Protected Route Guard**: `ProtectedRoute` wrapper component redirects unauthenticated traffic to `/login`.
3. **Guest Route Guard**: `GuestRoute` wrapper component redirects authenticated users accessing `/login` or `/register` to `/dashboard`.
4. **Fallback Route**: Any unknown path `*` automatically redirects to `/dashboard` (or `/login` if unauthenticated).
