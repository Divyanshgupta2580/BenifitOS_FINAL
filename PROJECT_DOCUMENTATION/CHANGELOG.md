# Changelog - BenefitOS Platform

All notable changes to the BenefitOS project are documented in this file.

## [1.25.0] - 2026-08-07

### Added - Phase 5.1 (AI Assistant Foundation)
- **AI Service Layer (`ai.service.ts`)**: Built service functions `sendChatMessage` and `explainRecommendation` consuming existing NestJS `AiController` endpoints (`POST /api/v1/ai/chat` & `POST /api/v1/ai/explain-recommendation`).
- **AI Custom Hook (`useAiChat.ts`)**: Implemented React Query mutation hook for handling message session history, suggested guidance prompts, retries, and clear chat operations.
- **Citizen AI Assistant Screen (`AiAssistantScreen.tsx`)**: Created complete AI Assistant user interface with suggested prompt quick-action chips, provider badges (`[Gemini 1.5 Pro]`), typing indicator loading container, retry CTAs, and full accessibility.
- **Navigation Integration (`AppNavigator.tsx` & `DashboardScreen.tsx`)**: Registered `AI_ASSISTANT` in navigation router and connected Dashboard AI Copilot banner to navigate directly to the AI Assistant.
- **Verification**: Verified via `npx tsc --noEmit` on both frontend and backend packages with zero errors.

## [1.24.0] - 2026-08-07

### Fixed - Production Stabilization Phase 3 (Low Severity Bugs & Final Certification)
- **BUG-007 Resolved (`AppNavigator.tsx`)**: Streamlined auth stack switch-case router.
- **BUG-008 Resolved (`websocket-client.ts`)**: Added `reconnect_attempt` handler to dynamically fetch and attach refreshed JWT access tokens.

## [1.23.0] - 2026-08-07

### Fixed - Production Stabilization Phase 2 (Medium Severity Bugs)
- **BUG-003 Resolved (`AddressEditScreen.tsx`)**: Replaced `setTimeout` mock timer with backend `updateProfile` API service call.
- **BUG-004 Resolved (`DocumentUploadScreen.tsx`)**: Implemented dynamic cross-platform file payload construction with PDF, JPEG, PNG format validation and 10MB maximum size validation.
- **BUG-005 Resolved (`MfaSetupScreen.tsx`)**: Connected to backend `/integrations/aadhaar/request-otp` & `/verify-otp` endpoints.
- **BUG-006 Resolved (`PasswordResetScreen.tsx`)**: Connected password reset request to backend `/auth/forgot-password` endpoint.

## [1.22.0] - 2026-08-07

### Fixed - Production Stabilization Phase 1 (High Severity Bugs)
- **BUG-001 Resolved (`HouseholdMembersScreen.tsx`)**: Replaced local in-memory array push with backend `updateProfile` API service call.
- **BUG-002 Resolved (`LandDetailsScreen.tsx`)**: Replaced local in-memory array push with backend `updateProfile` API service call.
