# BenefitOS Platform

---

# 05 - Use Cases

| Field | Value |
|--------|--------|
| Document Title | Use Cases |
| Document Number | 05 |
| Version | 2.0.0 |
| Status | Final |
| Project | BenefitOS Platform |
| Audience | Product Team, Developers, QA Engineers, UX Designers, AI Development Agents |
| Purpose | Define all system use cases and actor interactions for the BenefitOS Platform |

---

# Table of Contents

1. Introduction
2. Purpose
3. Actors
4. System Boundaries
5. Use Case Diagram Overview
6. Authentication Use Cases
7. Citizen Profile Use Cases
8. Recommendation Engine Use Cases
9. Document Management Use Cases
10. OCR Use Cases
11. AI Copilot Use Cases
12. Welfare Timeline Use Cases
13. Application Tracker Use Cases
14. Notification Use Cases
15. Settings Use Cases
16. Error Scenarios
17. Use Case Summary

---

# 1. Introduction

This document defines the complete set of use cases supported by the BenefitOS Platform.

A use case describes the interaction between an external actor and the system in order to accomplish a specific goal.

These use cases provide the foundation for:

- UI Design
- Backend Development
- API Design
- Testing
- Acceptance Criteria
- AI Behavior

---

# 2. Purpose

The objectives of this document are:

- Define system behavior.
- Identify actor interactions.
- Standardize workflows.
- Support implementation.
- Guide testing.
- Prevent ambiguity.

Every functional feature described in the Software Requirements Specification shall be represented by one or more use cases.

---

# 3. Actors

## Primary Actor

Citizen

A registered user who interacts with the platform to discover, prepare for, and track government welfare schemes.

---

## Supporting Systems

- Supabase Authentication
- PostgreSQL Database
- Supabase Storage
- Google Gemini
- Sarvam AI
- Redis
- BullMQ Workers

---

## Future Actors

- Government Officer
- NGO Representative
- CSR Administrator

These actors are outside the scope of Version 2.0.

---

# 4. System Boundaries

BenefitOS is responsible for:

- Authentication
- Digital Twin
- Recommendation Engine
- Document Vault
- OCR
- AI Copilot
- Welfare Timeline
- Application Tracking
- Notifications
- Settings

BenefitOS is **not** responsible for:

- Government application submission
- Government approval decisions
- Government identity verification

---

# 5. Use Case Diagram Overview

```text
Citizen

│

├── Register
├── Login
├── Complete Profile
├── Upload Documents
├── View Recommendations
├── Ask AI
├── Manage Documents
├── View Timeline
├── Track Applications
├── Receive Notifications
└── Manage Settings
```

---

# 6. Authentication Use Cases

---

## UC-01 Register

### Goal

Create a new BenefitOS account.

### Primary Actor

Citizen

### Preconditions

Citizen is not already registered.

### Main Flow

1. Open registration page.
2. Enter required information.
3. Verify email.
4. Account created.
5. User redirected to onboarding.

### Alternative Flow

- Email already exists.
- Invalid password.
- Verification expired.

### Success Outcome

Authenticated account created.

---

## UC-02 Login

### Goal

Authenticate an existing user.

### Main Flow

1. Enter credentials.
2. Credentials verified.
3. JWT issued.
4. Dashboard loaded.

### Failure

- Invalid credentials.
- Locked account.
- Expired session.

---

## UC-03 Logout

### Goal

Terminate current session.

### Outcome

JWT invalidated.

User redirected to Login.

---

# 7. Citizen Profile Use Cases

---

## UC-04 Complete Digital Twin

### Goal

Provide personal information.

### Flow

1. Open profile.
2. Enter personal details.
3. Save.
4. Profile updated.
5. Event published.
6. Recommendations refreshed asynchronously.

---

## UC-05 Update Profile

### Goal

Modify citizen information.

### Outcome

Profile saved.

Recommendation refresh queued.

Connected clients updated through WebSocket.

---

# 8. Recommendation Engine Use Cases

---

## UC-06 Generate Recommendations

### Goal

Determine welfare eligibility.

### Preconditions

Verified citizen profile exists.

### Flow

1. Recommendation engine executes.
2. Rules evaluated.
3. Eligibility calculated.
4. Results stored.
5. Event published.
6. Notification generated.
7. Dashboard updates in real time.

---

## UC-07 View Recommendation Details

Citizen selects recommendation.

System displays:

- Eligibility
- Explanation
- Missing requirements
- Required documents
- Official link

---

# 9. Document Management Use Cases

---

## UC-08 Upload Document

### Flow

1. Select document.
2. Validate.
3. Upload.
4. Queue OCR.
5. Show upload success.

---

## UC-09 Replace Document

Old version archived.

New version uploaded.

Recommendation refresh initiated.

---

## UC-10 Delete Document

System confirms deletion.

Document removed.

Recommendations refreshed.

---

## UC-11 Preview Document

Citizen opens document.

System generates temporary signed URL.

Preview displayed.

---

# 10. OCR Use Cases

---

## UC-12 Process OCR

### Flow

Upload

↓

Queue

↓

OCR Worker

↓

Extract Fields

↓

Citizen Verification

↓

Persist Verified Data

↓

Recommendation Refresh

↓

Real-Time Dashboard Update

---

## UC-13 Retry OCR

Citizen retries failed OCR processing.

Previous job cancelled.

New job created.

---

# 11. AI Copilot Use Cases

---

## UC-14 Ask AI

Citizen submits question.

System:

- Retrieves profile context.
- Retrieves recommendation context.
- Builds prompt.
- Sends request to Gemini.
- Streams response.
- Saves conversation.

---

## UC-15 Compare Schemes

Citizen selects two schemes.

AI explains:

- Differences
- Benefits
- Limitations
- Best option

---

## UC-16 Summarize Document

Citizen uploads PDF.

AI summarizes.

Summary displayed.

---

## UC-17 Generate Checklist

AI creates personalized checklist.

Checklist downloadable.

---

# 12. Welfare Timeline Use Cases

---

## UC-18 View Timeline

Citizen opens timeline.

System displays:

- Completed milestones
- Pending actions
- Future opportunities

---

## UC-19 Timeline Refresh

Profile changes.

↓

Recommendation changes.

↓

Timeline regenerated.

↓

WebSocket event.

↓

Timeline updates automatically.

---

# 13. Application Tracker Use Cases

---

## UC-20 Track Application

Citizen views application.

System displays:

- Current status
- Submission date
- Notes
- Timeline

---

## UC-21 Receive Status Update

Application changes.

↓

Notification created.

↓

WebSocket event.

↓

Dashboard updated.

---

# 14. Notification Use Cases

---

## UC-22 View Notifications

Citizen opens notification center.

Unread notifications highlighted.

---

## UC-23 Mark Notification Read

Status updated.

Badge count refreshed.

---

## UC-24 Receive Real-Time Notification

Background event occurs.

↓

Notification created.

↓

Socket event published.

↓

UI updates immediately.

---

# 15. Settings Use Cases

---

## UC-25 Change Theme

Citizen switches between:

- Light
- Dark

Theme changes instantly.

---

## UC-26 Change Language

Citizen selects preferred language.

UI updated.

Future AI responses use selected language where supported.

---

## UC-27 Delete Account

Citizen confirms deletion.

System:

- Revokes session.
- Deletes personal data according to policy.
- Logs audit event.

---

# 16. Error Scenarios

The system shall gracefully handle:

- Network failure
- Expired JWT
- AI provider unavailable
- OCR failure
- Storage unavailable
- Queue failure
- Database timeout
- Invalid uploads

Core platform functionality shall remain available whenever possible.

---

# 17. Use Case Summary

The BenefitOS Platform consists of twenty-seven primary use cases covering authentication, citizen profile management, recommendation generation, document management, OCR processing, AI assistance, application tracking, notifications, and settings.

These use cases define the expected interactions between citizens and the platform and provide the functional foundation for implementation, testing, and future enhancements.

Every implemented feature shall trace back to one or more use cases defined in this document.

---

# End of Document

**Document Status:** Final

**Document Number:** 05

**Document Version:** 2.0.0

**Next Document:** 06 - System Architecture