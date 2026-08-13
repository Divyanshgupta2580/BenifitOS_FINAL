# BenefitOS — Phase 7 Manual Frontend Verification Checklist

## Overview
This document provides the structured checklist for manual browser-based verification of the BenefitOS frontend platform.

- **Frontend Dev URL**: `http://localhost:3000/`
- **Backend API Gateway**: `http://localhost:4000/api/v1`
- **Connected Database**: Remote Neon TEST PostgreSQL (`ep-lucky-violet...neon.tech:5432`)
- **Connected Cache**: Remote Upstash Redis (`just-worm-128892.upstash.io:6379`)

> [!IMPORTANT]
> **Safety Rule**: DO NOT upload real sensitive personal documents (e.g. real Aadhaar cards, Voter IDs, or Driving Licences). Use only synthetic or sample test files.

---

## Verification Checklist

| # | Feature Area | Checkbox | Expected Behavior | Actual Behavior | Status | Notes / Instructions |
|---|:---|:---:|:---|:---|:---:|:---|
| 1 | **Initial Page Load** | [ ] | Navigating to `http://localhost:3000/` loads the BenefitOS landing/welcome interface without blank screens or console errors. | | `NOT VERIFIED` | Open browser at `http://localhost:3000/`. Verify page structure and header. |
| 2 | **Language Selection** | [ ] | Citizen can view supported Indian languages (English, Hindi, etc.) and selecting a language updates the UI text smoothly. | | `NOT VERIFIED` | Choose language and proceed through the initial onboarding screen. |
| 3 | **Citizen Registration** | [ ] | Submitting `/register` with a valid email/password creates an account; invalid inputs show validation errors; duplicate email shows friendly error. | | `NOT VERIFIED` | Register a new test user (e.g., `manual_test_1@example.com` / `Password123!`). |
| 4 | **Citizen Login** | [ ] | Valid credentials log the user in, store JWT tokens in localStorage/cookie, and redirect to `/dashboard`; wrong credentials display 401 error message. | | `NOT VERIFIED` | Test invalid password first, then log in with valid credentials. |
| 5 | **Dashboard** | [ ] | `/dashboard` loads welfare stats, citizen name, recommended schemes count, application summaries, and quick navigation cards. | | `NOT VERIFIED` | Verify dashboard widgets render without infinite loading spinners. |
| 6 | **Citizen Profile** | [ ] | Citizen can view and edit demographics (name, DOB, gender, category, income) and address details; clicking "Save" persists data across page reloads. | | `NOT VERIFIED` | Edit demographics and address on `/profile`, save, and refresh page to verify persistence. |
| 7 | **Schemes Catalog** | [ ] | `/schemes` displays seeded welfare schemes; categories/search filters work; clicking a scheme opens detailed criteria and required documents. | | `NOT VERIFIED` | Browse schemes list and inspect a scheme detail view. |
| 8 | **Recommendations Engine** | [ ] | `/recommendations` computes eligibility based on profile; displays match score %, eligible benefits, and criteria met/unmet cards. | | `NOT VERIFIED` | Trigger recalculation or view recommendation cards. |
| 9 | **Document Upload (7 Types)** | [ ] | Upload UI accepts only canonical types (`BIRTH_CERTIFICATE`, `EDUCATIONAL_CERTIFICATE`, `DISABILITY_CERTIFICATE`, `CASTE_CERTIFICATE`, `AADHAAR`, `DRIVING_LICENSE`, `VOTER_ID`). Correct document is accepted. | | `NOT VERIFIED` | Test uploading a valid sample file under correct document type. |
| 10 | **Document Anti-Spoofing** | [ ] | Uploading an incorrect document type (e.g. Driving Licence content when Aadhaar is selected) returns an error; rejected file is NOT saved in vault. | | `NOT VERIFIED` | Select "Aadhaar", upload a Driving Licence sample file, confirm rejection. |
| 11 | **Document Vault** | [ ] | `/documents` displays uploaded documents with canonical type labels, verification status (`VERIFIED`), and download/view options. Rejected docs do not appear. | | `NOT VERIFIED` | Confirm vault shows only legitimately accepted documents. |
| 12 | **Application Workflow** | [ ] | Creating a scheme application creates a draft; user can fill in form fields, save draft, reopen, and submit. Application number is assigned. | | `NOT VERIFIED` | Start application for a scheme, save draft, inspect on `/applications`. |
| 13 | **Notifications** | [ ] | `/notifications` lists system alerts and application updates; unread badges update; clicking an item marks it as read. | | `NOT VERIFIED` | Inspect notifications tray and mark as read. |
| 14 | **AI Assistant (Fallback)** | [ ] | AI chat modal/drawer opens cleanly; if `GEMINI_API_KEY` is not set, fallback response is returned without crashing the UI. | | `MOCKED / FALLBACK` | Send a query in AI chat; verify fallback behavior. |
| 15 | **Mobile Viewport UI** | [ ] | Resizing browser to mobile width (375px) displays responsive layout, mobile navigation bar/drawer, and readable forms without horizontal overflow. | | `NOT VERIFIED` | Open DevTools device mode (iPhone/Android width) and check navigation/forms. |
| 16 | **WebSocket Gateway** | [ ] | Realtime gateway connects on `/ws`; connection status indicator shows green/connected; disconnect/reconnect handles cleanly. | | `NOT VERIFIED` | Check WebSocket status in Network tab (WS filter). |
| 17 | **Session Logout** | [ ] | Clicking Logout clears tokens, resets user state, and redirects to `/login`. Back navigation cannot access authenticated routes. | | `NOT VERIFIED` | Click logout and try accessing `/dashboard` or `/profile`. |

---

## Verification Result Summary Template

When manual testing is complete, please record the findings using the format below:

```markdown
### Manual Verification Results
- **Tested By**: [User Name / Date]
- **Browser Used**: [e.g. Google Chrome 127 on macOS]
- **Total Checklist Items**: 17
- **Verified Items**: [Count]
- **Failed Items**: [Count]
- **Defects Identified**:
  1. [Defect 1 description if any]
  2. [Defect 2 description if any]
```
