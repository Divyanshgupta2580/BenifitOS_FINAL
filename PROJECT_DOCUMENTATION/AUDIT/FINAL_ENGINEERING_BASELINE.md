# BenefitOS — Final Engineering Safety Baseline

- **Date:** 2026-08-28T00:58:45+05:30
- **Starting Git Commit:** `669c8b22` (`feat(release): Release Candidate v1.25.0 - Final verification, Gemini 3.6-flash, Copilot timeout fix & README consolidation`)
- **Current Branch:** `main`
- **Working Tree State:** **ACTIVE PRE-DEPLOYMENT STAGING**

---

## 1. Inventory of Changes in Working Tree

### Backend Source Changes:
1. `apps/backend/src/config/env.config.ts`: Zod schema validation for `GEMINI_MODEL`, `GEMINI_SCHEME_GUIDANCE_API_KEY`, `HOST`, and `PORT`.
2. `apps/backend/src/infrastructure/ai/gemini-ai.adapter.ts`: Dual Gemini AI clients (`aiClient` for chatbot + `guidanceClient` for scheme guidance), `getModelName()` dynamic resolution via `process.env.GEMINI_MODEL`.
3. `apps/backend/src/main.ts`: Bind `app.listen(port, host)` to `process.env.HOST || '0.0.0.0'` for dynamic Render container port/host binding.
4. `apps/backend/src/modules/ai/ai.controller.ts` & `ai.service.ts`: Added `POST /api/v1/ai/scheme-instructions` with strict citizen eligibility checking.
5. `apps/backend/src/modules/auth/auth.service.ts` & `dto/auth.dto.ts`: Added `annualIncomeINR` / Household Annual Income validation.
6. `apps/backend/src/modules/ocr/ocr.controller.ts` & `ocr.service.ts`: Added `GET /api/v1/ocr/:documentId` with user ownership enforcement.

### Frontend Source Changes:
1. `apps/frontend/src/App.tsx` & `apps/frontend/src/queryClient.ts`: Centralized query client with `staleTime: 0` and `refetchOnMount: 'always'`.
2. `apps/frontend/src/store/auth.store.ts`: Added `queryClient.clear()` on `setAuth` and `logout` to prevent cross-account cache contamination.
3. `apps/frontend/src/hooks/*`: Scoped query keys by `user?.id` across all data hooks.
4. `apps/frontend/src/components/ui/SchemeInstructionsSection.tsx`: UI component for start-to-finish scheme application instructions & official portal button.
5. `apps/frontend/src/screens/*`: Integrated instructions section, scoped queries, income input formatting.
6. `apps/frontend/src/services/ai.service.ts` & `api-client.ts`: Token refresh, error normalization, and scheme instructions API method.

---

## 2. Secrets & Git Safety Verification
- Tracked `.env` files: **0** (`git ls-files | grep -i "\.env"` returns only `.env.example` templates).
- Stored credentials in code: **0** (All credentials sourced via `process.env`).
