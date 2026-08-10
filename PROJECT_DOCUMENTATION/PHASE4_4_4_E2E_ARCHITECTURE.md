# BenefitOS — Phase 4.4.4 E2E Architecture
**Playwright Browser E2E Architecture**

---

## 1. Playwright Test Suite Architecture (`apps/frontend/e2e/app-smoke.spec.ts`)
- **Target Application**: Web-Only Single Page Application (`React 18` + `Vite` + `React Router DOM`)
- **Smoke Specs**:
  - `E2E-001`: App Shell Root Load
  - `E2E-002`: Authentication Form Elements
  - `E2E-003`: Unauthenticated Guard Redirect
  - `E2E-004`: Scheme Discovery Catalog UI
  - `E2E-005`: AI Copilot Route Load
