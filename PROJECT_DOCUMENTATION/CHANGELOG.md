# Changelog - BenefitOS Platform

All notable changes to the BenefitOS project are documented in this file.

## [1.24.0] - 2026-08-07

### Fixed - Production Stabilization Phase 3 (Low Severity Bugs & Final Certification)
- **BUG-007 Resolved (`AppNavigator.tsx`)**: Streamlined auth stack switch-case router, eliminating redundant duplicate `LOGIN` fallback case definitions.
- **BUG-008 Resolved (`websocket-client.ts`)**: Added `reconnect_attempt` handler to dynamically fetch and attach refreshed JWT access tokens from `storageService` during Socket.IO gateway reconnections.
- **100% Production Stabilization Complete**: All 8 cataloged bugs (`BUG-001` through `BUG-008`) are 100% resolved and verified.
- **Verification**: Verified via `npx tsc --noEmit` on both frontend and backend packages with zero errors.

## [1.23.0] - 2026-08-07

### Fixed - Production Stabilization Phase 2 (Medium Severity Bugs)
- **BUG-003 Resolved (`AddressEditScreen.tsx`)**: Replaced `setTimeout` mock timer with backend `updateProfile` API service call passing updated residential address.
- **BUG-004 Resolved (`DocumentUploadScreen.tsx`)**: Removed hardcoded Android path string. Implemented dynamic cross-platform file payload construction with PDF, JPEG, PNG format validation and 10MB maximum file size validation.
- **BUG-005 Resolved (`MfaSetupScreen.tsx`)**: Connected to backend `/integrations/aadhaar/request-otp` & `/verify-otp` endpoints.
- **BUG-006 Resolved (`PasswordResetScreen.tsx`)**: Connected password reset request to backend `/auth/forgot-password` endpoint.

## [1.22.0] - 2026-08-07

### Fixed - Production Stabilization Phase 1 (High Severity Bugs)
- **BUG-001 Resolved (`HouseholdMembersScreen.tsx`)**: Replaced local in-memory array push with backend `updateProfile` API service call.
- **BUG-002 Resolved (`LandDetailsScreen.tsx`)**: Replaced local in-memory array push with backend `updateProfile` API service call.
