# BenefitOS (BenifitOS) — Master Project Handover

> **Purpose**
>
> This document is the single source of truth for the current state of the BenefitOS project.
>
> Any AI assistant, developer, or reviewer must read this document completely before making any modifications.
>
> Do NOT assume anything outside this document and the repository.

---

# 1. Project Overview

## Project Name

BenefitOS (BenifitOS)

## Purpose

BenefitOS is a production-grade citizen welfare platform that helps Indian citizens:

- Discover welfare schemes
- Check eligibility
- View AI-powered recommendations
- Upload and verify documents
- Run OCR extraction
- Submit welfare applications
- Track application status
- Receive notifications

The system is designed as an enterprise-quality application suitable for hackathons and production deployment.

---

# 2. Tech Stack

## Frontend

- Expo 52
- React Native 0.76
- React Native Web
- TypeScript
- React Navigation
- React Query
- Zustand
- Axios

---

## Backend

- NestJS 11
- Prisma ORM
- PostgreSQL
- Supabase Storage
- JWT Authentication
- Google Gemini Vision OCR

---

# 3. Architecture Rules (MUST NEVER BE VIOLATED)

## Rule 1

Frontend NEVER performs business logic.

Only backend calculates:

- eligibility
- recommendation score
- confidence score
- workflow state
- approval
- rejection
- DBT calculations
- OCR confidence

---

## Rule 2

Frontend only

- renders UI
- sends requests
- displays backend responses

---

## Rule 3

Never duplicate backend business logic inside frontend.

---

## Rule 4

Never invent DTOs.

Use existing backend DTOs only.

---

## Rule 5

Never invent API endpoints.

Only consume existing backend APIs.

---

## Rule 6

Maintain Single Source of Truth.

Backend owns all business rules.

---

# 4. Frozen Modules

The following phases are COMPLETE and FROZEN.

## Backend

✔ Frozen

## Database

✔ Frozen

## Frontend Foundation

✔ Frozen

## Phase 2.1

Citizen Profile

✔ Frozen

---

## Phase 2.2

Dashboard

✔ Frozen

---

## Phase 2.3

Scheme Discovery

✔ Frozen

---

## Phase 2.4

Recommendation Engine

✔ Frozen

---

## Phase 3.1

Document Vault

✔ Frozen

---

## Phase 3.2

Vision OCR

✔ Frozen

---

## Phase 4.1

Application Wizard

✔ Frozen

---

## Phase 4.2

Application Timeline

✔ Frozen

---

# 5. Current Progress

Current Release Version

v1.23.0

Project Status

Production Stabilization Phase 2 Completed

---

# 6. Known Bug Status

## Resolved

BUG-001

Household member persistence

Resolved

---

BUG-002

Land persistence

Resolved

---

BUG-003

Address update API

Resolved

---

BUG-004

Document upload URI

Resolved

---

BUG-005

MFA placeholder

Resolved (Requires verification)

---

BUG-006

Forgot password

Resolved (Requires verification)

---

## Remaining

BUG-007

Navigation cleanup

Low

Open

---

BUG-008

WebSocket token refresh

Low

Open

---

# 7. Required Verification

Before production deployment verify:

- BUG-005 implementation
- BUG-006 implementation
- Runtime testing
- Android testing
- iOS testing
- Web testing

Do NOT assume documentation is correct.

Verify source code.

---

# 8. Documentation Available

The repository contains:

Architecture

Release Manifest

Project Progress

Freeze Reports

Implementation Reports

Audit Reports

Production Validation

Production Certification

Bug Tracker

Security Review

Performance Review

Accessibility Review

API Review

Build Reports

Production Stabilization Reports

These documents are authoritative.

---

# 9. Coding Standards

Always

✓ TypeScript Strict

✓ React Query

✓ Zustand

✓ Reusable components

✓ Enterprise architecture

✓ Modular services

✓ DTO alignment

✓ API-first development

Never

✗ mock business logic

✗ duplicate backend logic

✗ hardcode secrets

✗ create fake APIs

✗ bypass DTO validation

✗ break frozen contracts

---

# 10. Backend Requirements

Every async backend method should satisfy one of:

Option A

Explicit

try {

}

catch {

}

Option B

Throw exceptions that propagate to the GlobalExceptionFilter.

Never swallow exceptions.

Never leave Promise rejections unhandled.

---

# 11. Before Modifying Anything

Always

1. Read RELEASE_MANIFEST.md

2. Read PROJECT_PROGRESS.md

3. Read BUG_TRACKER.md

4. Read freeze report for affected phase

5. Read implementation report

6. Verify API contract

Only then modify code.

---

# 12. Production Release Checklist

- TypeScript builds successfully

- Frontend build passes

- Backend build passes

- No broken imports

- No TODO placeholders

- No mock timers

- No fake APIs

- Runtime verified

- Authentication verified

- Upload verified

- OCR verified

- Recommendation verified

- Applications verified

- Timeline verified

---

# 13. Current Objective

Current objective:

Finish production stabilization.

Verify remaining bugs.

Complete runtime testing.

Then begin Phase 5.

---

# 14. Instructions for Future AI

You are joining an existing production project.

Do NOT redesign the architecture.

Do NOT rewrite completed modules.

Do NOT regenerate frozen phases.

Respect all freeze contracts.

Follow Release Manifest.

Follow Project Progress.

Read all relevant documentation before making changes.

If documentation conflicts with source code,

the source code is authoritative.

Always verify before claiming a feature is implemented.

Never claim a bug is fixed without tracing the code path.

---

# END OF HANDOVER