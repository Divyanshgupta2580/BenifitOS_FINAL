# BenefitOS — Master Defect Register

**Repository:** `Divyanshgupta2580/BenifitOS_FINAL`  
**Governing Standard:** `AI_INSTRUCTIONS.md`  
**Last Updated:** August 14, 2026

---

## Current Defect Summary

| Metric | Count |
| :--- | :---: |
| **OPEN DEFECTS** | **0** |
| **CRITICAL DEFECTS** | **0** |
| **HIGH DEFECTS** | **0** |
| **MEDIUM DEFECTS** | **0** |
| **LOW DEFECTS** | **0** |
| **TOTAL CLOSED DEFECTS** | **12** |



---

## Defect Inventory & Audit History

### DEF-001: Registration Email Trailing-Dot Validation Failure
- **Category:** `AUTH / VALIDATION`
- **Severity:** `HIGH`
- **File:** `apps/frontend/src/screens/auth/RegisterScreen.tsx`
- **Location:** Lines 12-19 (`isValidEmail` regex)
- **Root Cause:** Incomplete RFC 5322 regex allowed trailing periods in local part (e.g. `divyansh.@gmail.com`), which failed backend class-validator with HTTP 400.
- **Security Impact:** Low (Failed securely).
- **User Impact:** High (Citizen could not submit registration form).
- **Reproduction Method:** Submit email `divyansh.@gmail.com` in registration screen.
- **Expected Behavior:** Instant clientside regex rejection prior to submission.
- **Actual Behavior:** Form submitted and server returned validation error.
- **Required Fix:** Update `isValidEmail` to RFC 5322 standard regex prohibiting consecutive and trailing dots in local part.
- **Verification Method:** Run registration validation test suite (`test-registration-flow.ts`).
- **Status:** **CLOSED**

---

### DEF-002: Missing Dark Theme Classes on Frontend Sub-Screens
- **Category:** `THEME / UI`
- **Severity:** `MEDIUM`
- **File:** `apps/frontend/src/screens/*`
- **Location:** Sub-screen headers, cards, and modal dialogs
- **Root Cause:** Some sub-screens were using hardcoded `bg-white` and `text-slate-900` without paired `dark:bg-*` classes.
- **Security Impact:** None.
- **User Impact:** Medium (Inconsistent contrast in dark mode).
- **Reproduction Method:** Inspect sub-screens with `.dark` class active.
- **Expected Behavior:** High contrast dark container styling across all screens.
- **Actual Behavior:** White boxes rendered on dark background.
- **Required Fix:** Add comprehensive Tailwind `dark:*` classes across all 28 screens and modals.
- **Verification Method:** Static audit and `verify-theme-store.js`.
- **Status:** **CLOSED**

---

### DEF-003: Theme Store Binary State vs Dynamic 3-Mode System
- **Category:** `THEME / ARCHITECTURE`
- **Severity:** `MEDIUM`
- **File:** `apps/frontend/src/store/theme.store.ts`
- **Location:** Theme state interface & initialization
- **Root Cause:** Binary boolean `'light' | 'dark'` did not support dynamic `'system'` OS media query preference.
- **Security Impact:** None.
- **User Impact:** Medium (Application failed to follow operating system dark mode).
- **Expected Behavior:** Default to `'system'`, listen to `window.matchMedia`, and allow explicit manual overrides.
- **Actual Behavior:** Static light mode default.
- **Required Fix:** Rebuild `theme.store.ts` with `'system' | 'light' | 'dark'`, media query listener, and sanitization.
- **Verification Method:** Run `verify-theme-store.js` automated suite.
- **Status:** **CLOSED**

---

### DEF-004: Flash of Unstyled Theme (FOUT) on Page Reload
- **Category:** `THEME / UX`
- **Severity:** `LOW`
- **File:** `apps/frontend/index.html`
- **Location:** `<head>` section
- **Root Cause:** Theme classes applied only after React bundle execution, causing white flash.
- **Security Impact:** None.
- **User Impact:** Low (Visual flicker on reload).
- **Expected Behavior:** DOM class applied synchronously before initial render.
- **Actual Behavior:** Brief white flash before dark styling loaded.
- **Required Fix:** Inline synchronous pre-render script in `<head>` reading `localStorage.getItem('app_theme')`.
- **Verification Method:** Inspect pre-render script in `index.html`.
- **Status:** **CLOSED**

---

### DEF-005: Redis Security Fail-Closed vs In-Memory Fallback Policy
- **Category:** `SECURITY / CACHE`
- **Severity:** `HIGH`
- **File:** `apps/backend/src/infrastructure/redis/redis.service.ts`
- **Location:** Distributed state getter/setter
- **Root Cause:** In distributed production mode, Redis connection failure must fail closed rather than silent in-memory fallback.
- **Security Impact:** High (Session integrity in multi-instance deployments).
- **User Impact:** High (Ensures distributed token revocation holds).
- **Expected Behavior:** `ServiceUnavailableException` in production distributed mode when Redis is offline.
- **Actual Behavior:** Silent in-memory fallback in all modes.
- **Required Fix:** Add `isDistributedMode()` check throwing 503 on Redis offline in production.
- **Verification Method:** Run `test-security-idor.ts` Redis test case.
- **Status:** **CLOSED**

---

### DEF-006: File MIME Spoofing Executable Bypass
- **Category:** `SECURITY / DOCUMENTS`
- **Severity:** `CRITICAL`
- **File:** `apps/backend/src/modules/document/document.service.ts`
- **Location:** `validateFileSignature()`
- **Root Cause:** Relied only on declared MIME header without inspecting magic-byte signatures (`%PDF`, `\xFF\xD8\xFF`, etc.).
- **Security Impact:** Critical (Malicious executable upload vulnerability).
- **User Impact:** None directly (Security protection).
- **Expected Behavior:** Disguised executables (`MZ` headers) rejected with HTTP 400.
- **Actual Behavior:** Executable accepted if declared `application/pdf`.
- **Required Fix:** Implement magic-byte buffer signature verification in upload pipeline.
- **Verification Method:** Run `test-security-idor.ts` magic-byte verification test.
- **Status:** **CLOSED**

---

### DEF-007: Cross-User IDOR Access on Documents & Applications
- **Category:** `SECURITY / AUTHORIZATION`
- **Severity:** `CRITICAL`
- **File:** `apps/backend/src/modules/document/document.service.ts`, `apps/backend/src/modules/application/application.service.ts`
- **Location:** Resource lookup methods
- **Root Cause:** Queries did not strictly constrain by `userId` or verify ownership prior to mutation/deletion.
- **Security Impact:** Critical (Cross-tenant data exposure / manipulation).
- **User Impact:** Critical (Data privacy violation).
- **Expected Behavior:** User B blocked from User A resources with HTTP 403/404.
- **Actual Behavior:** Any authenticated user could access resources by ID.
- **Required Fix:** Strict ownership validation on all document, application, OCR, and notification endpoints.
- **Verification Method:** Run `test-security-idor.ts` IDOR test suite.
- **Status:** **CLOSED**

---

### DEF-008: Role Injection Privilege Escalation during Registration
- **Category:** `SECURITY / AUTH`
- **Severity:** `CRITICAL`
- **File:** `apps/backend/src/modules/auth/auth.service.ts`
- **Location:** `register()`
- **Root Cause:** Did not explicitly override `role` field, allowing `"role": "ADMIN"` injection in payload.
- **Security Impact:** Critical (Unauthorized admin access).
- **User Impact:** High (System compromise).
- **Expected Behavior:** All registrations strictly create `UserRole.CITIZEN`.
- **Actual Behavior:** Role field from request body was assigned.
- **Required Fix:** Hardcode `role: UserRole.CITIZEN` in `AuthService.register()`.
- **Verification Method:** Run `test-security-idor.ts` privilege escalation test case.
- **Status:** **CLOSED**

---

### DEF-009: Missing JWT Secret Validation on Startup
- **Category:** `SECURITY / CONFIG`
- **Severity:** `HIGH`
- **File:** `apps/backend/src/config/env.validation.ts`
- **Location:** `validateEnv()`
- **Root Cause:** Missing `JWT_SECRET` did not fail fast on backend bootstrap.
- **Security Impact:** High (Insecure fallback signing keys).
- **User Impact:** High.
- **Expected Behavior:** Server startup aborts immediately if `JWT_SECRET` is shorter than 16 characters.
- **Actual Behavior:** Fallback default string used.
- **Required Fix:** Strict Zod / environment schema validation failing fast.
- **Verification Method:** Run `test-security-idor.ts` missing secret test case.
- **Status:** **CLOSED**

---

### DEF-010: Password Reset Token Replay & Anti-Enumeration Privacy
- **Category:** `SECURITY / AUTH`
- **Severity:** `HIGH`
- **File:** `apps/backend/src/modules/auth/auth.service.ts`
- **Location:** `forgotPassword()`, `resetPassword()`
- **Root Cause:** Token reuse allowed password resets multiple times; different responses leaked account existence.
- **Security Impact:** High (Account takeover via intercepted tokens and email enumeration).
- **User Impact:** High.
- **Expected Behavior:** Single-use token invalidated on first use; uniform generic responses.
- **Actual Behavior:** Tokens were reusable and existence leaked.
- **Required Fix:** Invalidate reset token upon successful password update and return uniform response.
- **Verification Method:** Run `test-password-reset-flow.ts`.
- **Status:** **CLOSED**

---

### DEF-011: Sunset Gemini Model Identifier Causing API 404
- **Category:** `AI / INTEGRATION`
- **Severity:** `MEDIUM`
- **File:** `apps/backend/src/infrastructure/ai/gemini-ai.adapter.ts`
- **Location:** `GeminiAiAdapter.generateText()` and `extractDocumentData()`
- **Root Cause:** Hardcoded sunset model name `gemini-1.5-flash` caused Google GenAI API to reject requests with HTTP 404 (`models/gemini-2.5-flash / gemini-1.5-flash is no longer available. Please update your code to use models/gemini-3.6-flash`).
- **Security Impact:** None (Triggered defensive offline fallback securely).
- **User Impact:** Medium (Live AI assistant returned offline fallback notice).
- **Expected Behavior:** Active model `gemini-3.6-flash` used for conversational inference and OCR vision.
- **Actual Behavior:** Returned HTTP 404 from Google API, triggering fallback notice.
- **Required Fix:** Update model identifier to `gemini-3.6-flash` with `process.env.GEMINI_MODEL || 'gemini-3.6-flash'` flexibility.
- **Verification Method:** Execute live `POST /api/v1/ai/chat` request and verify real response.
- **Status:** **CLOSED**

---

### DEF-012: AI Copilot Frontend Timeout Mismatch
- **Category:** `FRONTEND / AI`
- **Severity:** `HIGH`
- **File:** `apps/frontend/src/services/ai.service.ts`
- **Location:** `aiApiService.sendChatMessage()`, `explainRecommendation()`
- **Root Cause:** Axios HTTP client global timeout of 15000ms caused AI Copilot requests to abort before live Google Gemini response generation completed (~30–40s).
- **Security Impact:** None (Failed safely with network error boundary).
- **User Impact:** High (Citizen Copilot UI rendered gateway timeout notice).
- **Expected Behavior:** Copilot awaits live Gemini generative response without client-side timeout cancellation.
- **Actual Behavior:** Axios aborted request at 15s and rendered timeout notice.
- **Required Fix:** Override default Axios timeout with `{ timeout: 60000 }` on `aiApiService` POST calls.
- **Verification Method:** Live Axios endpoint verification test (`test_ai_service_fix.js`) and full regression suite.
- **Status:** **CLOSED**


