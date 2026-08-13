# BenefitOS — Phase 5.2 Document Type System & Classification Audit

## Executive Summary
This document confirms the design, implementation, and verification of the BenefitOS document classification and validation system. The platform strictly enforces **ONLY 7 canonical document types** across the entire stack (Prisma schema, domain entities, classification service, NestJS controllers, frontend screens, and API contracts).

---

## 1. Supported Document Types (Strict Enrolment)
BenefitOS supports exactly 7 document types:

| # | Enum Key | Display Name | Category & Scope |
|---|---|---|---|
| 1 | `BIRTH_CERTIFICATE` | Birth Certificate | Civil Registration & Age Proof |
| 2 | `EDUCATIONAL_CERTIFICATE` | Educational Certificate/Marksheet | Academic & Skill Qualifications |
| 3 | `DISABILITY_CERTIFICATE` | Disability Certificate | Medical Board Disability Assessment |
| 4 | `CASTE_CERTIFICATE` | Caste Certificate | Social Category (SC/ST/OBC) Proof |
| 5 | `AADHAAR` | Aadhaar Card | Primary Identity & Address Verification |
| 6 | `DRIVING_LICENSE` | Driving Licence | Transport & Identity Document |
| 7 | `VOTER_ID` | Voter ID | Elector Identity Verification |

> **Excluded Document Types**: Passport, PAN Card, Bank Statement/Passbook, Ration Card, Property Documents, Income Certificate, Land Records, and all other non-canonical document types have been removed from the schema and application domain.

---

## 2. Document Upload & Anti-Spoofing Flow

```
User Selects Expected Type (e.g. AADHAAR)
                  │
                  ▼
          Upload File (Buffer/PDF/JPEG)
                  │
                  ▼
      Extract Text Content (OCR/Vision)
                  │
                  ▼
  DocumentClassificationService (Anti-Spoofing)
  - Ignores filename (e.g. "aadhaar.pdf")
  - Ignores file extension
  - Ignores user-submitted documentType claim
  - Analyzes multi-keyword & structural patterns
                  │
                  ▼
       Determines Detected Type & Confidence
                  │
        ┌─────────┴─────────┐
        │                   │
  Detected === Expected   Detected !== Expected
        │                   │
        ▼                   ▼
    [ ACCEPT ]          [ REJECT ]
Persist in DB with     Reject Request Immediately;
Detected DocumentType   DO NOT Store in Database
```

---

## 3. Classification & Storage Rules
1. **Content-Only Analysis**: Document classification is strictly based on the extracted text buffer and structural patterns. Filenames (such as `aadhaar.pdf` containing a driving licence) are ignored during classification.
2. **Strict Required vs. Detected Match**: The system compares the detected type with the user-selected required type. If mismatched, the backend throws an HTTP 400 Bad Request exception containing a clear error message:
   `Incorrect document. Required: [Required Type], Detected: [Detected Type]. Please upload your [Required Type].`
3. **Storage Isolation Rule**: Mismatched or rejected uploads are **never** persisted to the database under the requested type. Only verified matching uploads are saved.
4. **Document Replacement Architecture**: When a citizen uploads a new valid document of a type they already have, the existing document record is superseded/updated cleanly without leaving duplicate active records.

---

## 4. Security & Privacy Rules
- **No PII Logging**: Full raw OCR text, 12-digit Aadhaar numbers, EPIC numbers, and personal contents are **never** logged to stdout/system logs.
- **Sensitive Data Minimization**: API responses expose only document metadata, verification status, and public display names.
- **Credential Protection**: Environment files (`.env`) remain untracked in Git (`.gitignore` verified).

---

## 5. Test Results & Verification Matrix

### 5.1 Document Classification & Anti-Spoofing Test Suite
- **Executed via**: `apps/backend/src/modules/document/run-document-tests.ts`
- **Total Tests**: 13
- **Passed**: 13
- **Failed**: 0

| # | Test Scenario | Expected Outcome | Actual Result |
|---|---|---|---|
| 1 | Required `AADHAAR` + actual Aadhaar content | ACCEPT | PASS |
| 2 | Required `AADHAAR` + actual Driving Licence content | REJECT | PASS |
| 3 | Required `DRIVING_LICENSE` + actual Aadhaar content | REJECT | PASS |
| 4 | Required `VOTER_ID` + actual Voter ID content | ACCEPT | PASS |
| 5 | Required `BIRTH_CERTIFICATE` + actual Caste Certificate | REJECT | PASS |
| 6 | Required `CASTE_CERTIFICATE` + actual Disability Certificate | REJECT | PASS |
| 7 | Required `EDUCATIONAL_CERTIFICATE` + actual Aadhaar content | REJECT | PASS |
| 8 | Required `DISABILITY_CERTIFICATE` + actual Disability Certificate | ACCEPT | PASS |
| 9 | Filename `aadhaar.pdf` with Driving Licence content | REJECT | PASS |
| 10 | Forged user `documentType` field with mismatched content | REJECT | PASS |
| 11 | Unrecognized / low-confidence document content | REJECT / MANUAL_REVIEW | PASS |
| 12 | Database Storage Rule: Mismatched upload attempt | NOT SAVED TO DB | PASS |
| 13 | Database Storage Rule: Matched upload attempt | SAVED TO DB | PASS |

### 5.2 Compilation & Build Status
- **Prisma Client Generation**: PASS (`apps/backend/node_modules/.bin/prisma generate`)
- **Backend Typecheck**: PASS (`npx tsc --noEmit` in `apps/backend`)
- **Backend Build**: PASS (`npx tsc` in `apps/backend`)
- **Frontend Typecheck**: PASS (`npx tsc --noEmit` in `apps/frontend`)
- **Frontend Build**: PASS (`npx vite build` in `apps/frontend`)

---

## 6. Known Limitations
- Government external API verification (UIDAI, DigiLocker, Transport Dept) is intentionally out of scope for local document type verification. The platform verifies document format and type match locally.
