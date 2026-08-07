# BenefitOS Platform

---

# 08 - API Specification

| Field | Value |
|--------|--------|
| Document Title | API Specification |
| Document Number | 08 |
| Version | 2.0.0 |
| Status | Final |
| Project | BenefitOS Platform |
| Architecture | REST + WebSocket + Event-Driven |
| Backend | NestJS 11 |
| Frontend | Next.js 15 |
| Primary Protocol | HTTPS REST |
| Real-Time Protocol | Socket.IO |
| API Style | Resource-Oriented |
| Authentication | Supabase JWT |
| Prepared By | BenefitOS Team |

---

# Table of Contents

1. Introduction
2. API Vision
3. API Goals
4. API Design Principles
5. API Architecture
6. Communication Model
7. REST vs WebSocket Responsibilities
8. API Versioning
9. Base URLs
10. Authentication
11. Request Lifecycle
12. Standard Response Format
13. Error Response Format
14. API Summary

---

# 1. Introduction

The BenefitOS API provides secure, scalable, and production-grade communication between all platform components.

The API serves as the single interface for:

- Web Frontend
- Future Mobile Applications
- AI Services
- OCR Services
- Recommendation Engine
- Background Workers
- Real-Time Gateway

Every client shall communicate exclusively through documented APIs.

Direct database access from clients is prohibited.

---

# 2. API Vision

The BenefitOS API shall provide a predictable, secure, and maintainable interface capable of supporting millions of requests while maintaining strong consistency and low latency.

The API is designed around:

- Resource-oriented REST endpoints
- Event-driven WebSockets
- Stateless request processing
- Strong typing
- Standardized responses
- Secure authentication
- Versioned contracts

---

# 3. API Goals

The API shall achieve the following objectives.

## Reliability

Provide deterministic responses for identical requests.

---

## Consistency

Maintain identical request and response structures across all endpoints.

---

## Security

Protect all authenticated resources using JWT authentication and authorization.

---

## Performance

Minimize response times through caching, pagination, and efficient queries.

---

## Scalability

Support horizontal backend scaling without API contract changes.

---

## Maintainability

Allow future features without breaking existing clients.

---

# 4. API Design Principles

The BenefitOS API follows these engineering principles.

- Stateless communication.
- Resource-oriented URLs.
- Predictable HTTP methods.
- Consistent JSON responses.
- Strong request validation.
- Explicit versioning.
- Secure by default.
- Backward compatibility where practical.

---

# 5. API Architecture

```text
                Client

                   │

        HTTPS REST / WebSocket

                   │

                   ▼

          API Gateway (NestJS)

                   │

      ┌────────────┼─────────────┐

      ▼            ▼             ▼

 REST Controllers Socket Gateway Workers

      │

      ▼

 Application Services

      │

      ▼

Repositories → Prisma → PostgreSQL
```

REST APIs handle request-response interactions.

Socket.IO provides real-time synchronization.

Background workers process asynchronous workloads.

---

# 6. Communication Model

BenefitOS uses multiple communication mechanisms.

| Protocol | Purpose |
|----------|----------|
| REST | CRUD Operations |
| WebSocket | Real-Time Updates |
| Redis Pub/Sub | Internal Event Distribution |
| BullMQ | Background Processing |

Each protocol has a clearly defined responsibility.

---

# 7. REST vs WebSocket Responsibilities

## REST APIs

REST endpoints are responsible for:

- Authentication
- CRUD Operations
- File Uploads
- Searches
- Dashboard Retrieval
- Recommendation Retrieval
- AI Requests
- Settings

REST shall never push unsolicited updates.

---

## WebSockets

WebSockets are responsible for:

- Recommendation Updates
- OCR Progress
- Notification Delivery
- Timeline Updates
- Dashboard Refresh
- AI Streaming
- Background Job Progress
- Presence Events

Clients shall not repeatedly poll REST endpoints for frequently changing information.

---

# 8. API Versioning

Every public endpoint shall include an explicit version.

Example

```text
/api/v1/profile

/api/v1/documents

/api/v1/recommendations
```

Breaking changes require a new API version.

Non-breaking enhancements may remain within the existing version.

---

# 9. Base URLs

Development

```text
Frontend

http://localhost:3000

Backend

http://localhost:4000
```

REST

```text
http://localhost:4000/api/v1
```

WebSocket

```text
ws://localhost:4000
```

Production

```text
https://api.benefitos.in/api/v1

wss://api.benefitos.in
```

---

# 10. Authentication

Protected endpoints require a valid JWT issued by Supabase Authentication.

Authentication Flow

```text
User

↓

Supabase Auth

↓

JWT

↓

Authorization Header

↓

NestJS Guard

↓

Protected Endpoint
```

Header

```http
Authorization: Bearer <JWT_TOKEN>
```

Public endpoints shall not require authentication.

---

# 11. Request Lifecycle

```text
Client

↓

HTTP Request

↓

Middleware

↓

Authentication Guard

↓

Validation Pipe

↓

Controller

↓

Application Service

↓

Repository

↓

Database

↓

Response

↓

Client
```

Every request shall receive a unique request identifier for observability.

---

# 12. Standard Success Response

Every successful REST response follows the same structure.

```json
{
  "success": true,
  "message": "Profile retrieved successfully.",
  "data": {},
  "meta": {
    "requestId": "req_xxxxxxxxx",
    "timestamp": "2026-08-06T12:00:00Z"
  }
}
```

---

## Pagination Response

```json
{
  "success": true,
  "message": "Schemes retrieved successfully.",
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 250,
    "hasNext": true,
    "requestId": "req_xxxxx"
  }
}
```

---

# 13. Standard Error Response

Every failure response follows the same contract.

```json
{
  "success": false,
  "message": "Validation failed.",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format."
      }
    ]
  },
  "meta": {
    "requestId": "req_xxxxxxxxx",
    "timestamp": "2026-08-06T12:00:00Z"
  }
}
```

No internal stack traces shall be exposed to clients.

---

# 14. API Summary

The BenefitOS API establishes a secure, consistent, and scalable communication layer for the entire platform.

By combining REST APIs for deterministic operations with WebSockets for real-time synchronization, the platform minimizes unnecessary polling while maintaining responsive user experiences.

Every endpoint follows standardized request and response contracts, strong validation, explicit versioning, and production-grade security practices.

This specification serves as the authoritative contract between frontend, backend, AI services, background workers, and future client applications.

---

# End of Phase 1

**Next Phase:**

Authentication APIs

- Register
- Login
- Google Login
- Refresh Token
- Logout
- Forgot Password
- Reset Password
- Session Management
- Device Management
- Authentication Error Codes
# Phase 2 – Authentication APIs

---

# 15. Authentication Overview

The Authentication Module is responsible for:

- User Registration
- Email Login
- Google Login
- Session Management
- Device Management
- Password Reset
- Logout
- Token Refresh
- Account Verification

Authentication is provided by Supabase Authentication.

BenefitOS stores additional application metadata within its own database.

---

# 16. Authentication Flow

```text
User

↓

Frontend

↓

Supabase Authentication

↓

JWT

↓

NestJS Authentication Guard

↓

Protected APIs
```

Only authenticated users may access protected resources.

---

# 17. Authentication Endpoints

| Method | Endpoint | Authentication |
|----------|------------------------------|----------------|
| POST | /auth/register | Public |
| POST | /auth/login | Public |
| POST | /auth/google | Public |
| POST | /auth/refresh | Refresh Token |
| POST | /auth/logout | JWT |
| POST | /auth/logout-all | JWT |
| POST | /auth/forgot-password | Public |
| POST | /auth/reset-password | Public |
| GET | /auth/me | JWT |
| GET | /auth/sessions | JWT |
| DELETE | /auth/sessions/{id} | JWT |
| GET | /auth/devices | JWT |
| DELETE | /auth/devices/{id} | JWT |

---

# 18. Register

## Endpoint

```http
POST /api/v1/auth/register
```

---

## Description

Creates a new BenefitOS account.

---

## Request

```json
{
  "fullName": "Rahul Sharma",
  "email": "rahul@example.com",
  "password": "StrongPassword123!"
}
```

---

## Validation

- Name required
- Email required
- Email unique
- Password minimum 12 characters
- Password must contain:

  - Uppercase
  - Lowercase
  - Number
  - Special Character

---

## Success Response

```json
{
  "success": true,
  "message": "Account created successfully.",
  "data": {
    "userId": "uuid",
    "emailVerificationRequired": true
  }
}
```

---

# 19. Login

## Endpoint

```http
POST /api/v1/auth/login
```

---

## Request

```json
{
  "email": "rahul@example.com",
  "password": "StrongPassword123!"
}
```

---

## Success Response

```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "expiresIn": 3600
  }
}
```

---

Business Rules

- Failed attempts shall be rate limited.
- Login generates a Session.
- Login generates a Device record.
- Login publishes:

```text
user.logged_in
```

---

# 20. Google Login

## Endpoint

```http
POST /api/v1/auth/google
```

---

## Description

Authenticates using Google OAuth through Supabase.

---

## Request

```json
{
  "idToken": "<google_id_token>"
}
```

---

## Success Response

Same as Login.

---

# 21. Refresh Token

## Endpoint

```http
POST /api/v1/auth/refresh
```

---

## Description

Issues a new access token.

---

## Request

```json
{
  "refreshToken": "..."
}
```

---

## Response

```json
{
  "success": true,
  "data": {
    "accessToken": "...",
    "expiresIn": 3600
  }
}
```

---

Expired refresh tokens shall return HTTP 401.

---

# 22. Logout

## Endpoint

```http
POST /api/v1/auth/logout
```

---

## Description

Invalidates the current session.

---

## Header

```http
Authorization: Bearer <JWT>
```

---

## Success Response

```json
{
  "success": true,
  "message": "Logged out successfully."
}
```

---

Logout publishes

```text
user.logged_out
```

---

# 23. Logout From All Devices

## Endpoint

```http
POST /api/v1/auth/logout-all
```

---

## Description

Revokes every active session.

---

## Success Response

```json
{
  "success": true,
  "message": "All sessions revoked."
}
```

---

# 24. Forgot Password

## Endpoint

```http
POST /api/v1/auth/forgot-password
```

---

## Request

```json
{
  "email": "rahul@example.com"
}
```

---

Response

Always returns

```json
{
  "success": true,
  "message": "If an account exists, password reset instructions have been sent."
}
```

This prevents email enumeration attacks.

---

# 25. Reset Password

## Endpoint

```http
POST /api/v1/auth/reset-password
```

---

## Request

```json
{
  "token": "...",
  "password": "NewStrongPassword123!"
}
```

---

Password policy is identical to registration.

---

# 26. Current User

## Endpoint

```http
GET /api/v1/auth/me
```

---

## Description

Returns authenticated user information.

---

## Response

```json
{
  "success": true,
  "data": {
    "id": "...",
    "email": "...",
    "profileCompletion": 82,
    "role": "Citizen"
  }
}
```

---

# 27. Active Sessions

## Endpoint

```http
GET /api/v1/auth/sessions
```

---

## Description

Returns every active login session.

---

Response

```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "device": "Chrome",
      "location": "Delhi",
      "lastActive": "...",
      "current": true
    }
  ]
}
```

---

# 28. Revoke Session

## Endpoint

```http
DELETE /api/v1/auth/sessions/{id}
```

---

Revokes one session.

Current session cannot revoke itself using this endpoint.

---

# 29. Device Management

## Endpoint

```http
GET /api/v1/auth/devices
```

Returns trusted devices.

---

Example Response

```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "device": "MacBook Air",
      "browser": "Chrome",
      "lastActive": "...",
      "trusted": true
    }
  ]
}
```

---

Delete Device

```http
DELETE /api/v1/auth/devices/{id}
```

Removes trust from that device.

---

# 30. Authentication Events

Authentication publishes domain events.

```text
user.registered

user.logged_in

user.logged_out

user.password_reset

user.session_created

user.session_revoked

device.registered

device.removed
```

These events are consumed by:

- Notifications
- Activity Logs
- Audit Logs
- WebSocket Gateway

---

# 31. Authentication Error Codes

| Code | Meaning |
|------|---------|
| INVALID_CREDENTIALS | Incorrect email or password |
| ACCOUNT_LOCKED | Account temporarily locked |
| EMAIL_NOT_VERIFIED | Email verification required |
| INVALID_REFRESH_TOKEN | Refresh token expired |
| SESSION_EXPIRED | Session expired |
| PASSWORD_TOO_WEAK | Password policy failed |
| TOO_MANY_ATTEMPTS | Rate limit exceeded |
| DEVICE_NOT_FOUND | Device not registered |

---

# 32. Security Rules

The Authentication Module shall enforce:

- HTTPS only
- JWT Authentication
- Secure Cookies (where applicable)
- Refresh Token Rotation
- Rate Limiting
- Password Hashing
- Session Revocation
- Device Tracking
- Audit Logging
- CSRF Protection (browser clients)
- Brute Force Protection

---

# 33. Authentication Summary

The BenefitOS Authentication API provides secure identity management through Supabase Authentication while extending functionality with session management, trusted devices, audit logging, and domain events.

The design supports scalable, stateless authentication with strong security controls, standardized responses, and integration with the platform's event-driven architecture.

---

# End of Phase 2

**Next Phase:**

Citizen APIs

- Citizen Digital Twin
- Profile
- Address
- Education
- Employment
- Family
- Preferences
- Dashboard
- Settings
- Profile Completion APIs
# Phase 3 – Citizen APIs

---

# 34. Citizen API Overview

The Citizen APIs manage the BenefitOS Digital Twin.

The Digital Twin represents the complete citizen profile used by the Recommendation Engine.

The Citizen APIs include:

- Profile
- Address
- Education
- Employment
- Family
- Preferences
- Dashboard
- Profile Completion
- Settings

Any successful update to the Digital Twin shall publish a domain event.

---

# 35. Citizen API Endpoints

| Method | Endpoint | Authentication |
|----------|-------------------------------|----------------|
| GET | /profile | JWT |
| PATCH | /profile | JWT |
| GET | /profile/completion | JWT |
| GET | /profile/address | JWT |
| PUT | /profile/address | JWT |
| GET | /profile/education | JWT |
| POST | /profile/education | JWT |
| PATCH | /profile/education/{id} | JWT |
| DELETE | /profile/education/{id} | JWT |
| GET | /profile/employment | JWT |
| PUT | /profile/employment | JWT |
| GET | /profile/family | JWT |
| PUT | /profile/family | JWT |
| GET | /profile/preferences | JWT |
| PATCH | /profile/preferences | JWT |
| GET | /dashboard | JWT |
| GET | /settings | JWT |
| PATCH | /settings | JWT |

---

# 36. Get Citizen Profile

## Endpoint

```http
GET /api/v1/profile
```

---

## Description

Returns the complete Citizen Digital Twin.

---

## Success Response

```json
{
  "success": true,
  "data": {
    "personalInformation": {},
    "address": {},
    "education": [],
    "employment": {},
    "family": {},
    "preferences": {},
    "profileCompletion": 82
  }
}
```

---

# 37. Update Citizen Profile

## Endpoint

```http
PATCH /api/v1/profile
```

---

## Description

Updates personal information.

Only submitted fields are modified.

---

## Example Request

```json
{
  "firstName": "Rahul",
  "lastName": "Sharma",
  "dateOfBirth": "2003-05-12",
  "gender": "Male",
  "profession": "Student"
}
```

---

Business Rules

- Partial updates only.
- Validation occurs before persistence.
- Recommendation refresh is queued.
- Timeline regeneration is queued.
- Dashboard cache is invalidated.

---

Published Events

```text
profile.updated
```

---

# 38. Profile Completion

## Endpoint

```http
GET /api/v1/profile/completion
```

---

## Description

Returns profile completion status.

---

## Example Response

```json
{
  "success": true,
  "data": {
    "completion": 82,
    "missingFields": [
      "Annual Income",
      "Permanent Address"
    ]
  }
}
```

---

Completion shall be calculated automatically.

---

# 39. Address APIs

## Retrieve Address

```http
GET /api/v1/profile/address
```

---

## Update Address

```http
PUT /api/v1/profile/address
```

---

Example Request

```json
{
  "addressType": "Permanent",
  "line1": "...",
  "city": "...",
  "state": "...",
  "postalCode": "..."
}
```

---

Published Event

```text
profile.address.updated
```

---

# 40. Education APIs

Retrieve

```http
GET /api/v1/profile/education
```

---

Add

```http
POST /api/v1/profile/education
```

---

Update

```http
PATCH /api/v1/profile/education/{id}
```

---

Delete

```http
DELETE /api/v1/profile/education/{id}
```

---

Business Rules

- Citizens may maintain multiple education records.
- Deletion is soft where applicable.
- Recommendation refresh occurs asynchronously.

---

# 41. Employment APIs

Retrieve

```http
GET /api/v1/profile/employment
```

---

Update

```http
PUT /api/v1/profile/employment
```

---

Example Request

```json
{
  "employmentType": "Student",
  "profession": "Engineering Student",
  "organization": "AKTU"
}
```

---

Published Event

```text
profile.employment.updated
```

---

# 42. Family APIs

Retrieve

```http
GET /api/v1/profile/family
```

---

Update

```http
PUT /api/v1/profile/family
```

---

Example Request

```json
{
  "familySize": 5,
  "dependents": 2,
  "annualFamilyIncome": 420000
}
```

---

Published Event

```text
profile.family.updated
```

---

# 43. Preference APIs

Retrieve

```http
GET /api/v1/profile/preferences
```

---

Update

```http
PATCH /api/v1/profile/preferences
```

---

Example Request

```json
{
  "preferredLanguage": "Hindi",
  "theme": "Dark",
  "emailNotifications": true,
  "pushNotifications": true
}
```

---

Published Event

```text
preferences.updated
```

---

# 44. Dashboard API

## Endpoint

```http
GET /api/v1/dashboard
```

---

## Description

Returns all dashboard data in a single optimized request.

---

## Response

```json
{
  "success": true,
  "data": {
    "profileCompletion": {},
    "recommendations": [],
    "timelinePreview": [],
    "recentActivities": [],
    "documentStatus": {}
  }
}
```

---

Dashboard data shall be served from cache whenever possible.

---

# 45. Settings APIs

Retrieve

```http
GET /api/v1/settings
```

---

Update

```http
PATCH /api/v1/settings
```

---

Supported Settings

- Theme
- Language
- Accessibility
- Notification Preferences
- Privacy Preferences

---

Published Event

```text
settings.updated
```

---

# 46. Automatic Side Effects

Certain profile updates automatically trigger background workflows.

| Update | Background Action |
|---------|-------------------|
| Profile | Recommendation Refresh |
| Address | Recommendation Refresh |
| Education | Recommendation Refresh |
| Employment | Recommendation Refresh |
| Family | Recommendation Refresh |
| Preferences | Dashboard Refresh |
| Settings | Client Synchronization |

These actions execute asynchronously through BullMQ.

---

# 47. WebSocket Events

After successful updates, connected clients receive real-time events.

| Event | Purpose |
|--------|----------|
| profile.updated | Profile refreshed |
| recommendation.updated | Recommendations changed |
| dashboard.updated | Dashboard refreshed |
| timeline.updated | Timeline regenerated |
| settings.updated | Settings synchronized |

Clients should update only affected UI components.

---

# 48. Validation Rules

All Citizen APIs enforce:

- JWT authentication
- Zod request validation
- Ownership verification
- Field-level validation
- Input sanitization

Invalid requests return HTTP 400.

Unauthorized requests return HTTP 401.

Forbidden updates return HTTP 403.

---

# 49. Error Codes

| Code | Description |
|------|-------------|
| PROFILE_NOT_FOUND | Profile does not exist |
| INVALID_PROFILE_DATA | Validation failed |
| ADDRESS_NOT_FOUND | Address missing |
| EDUCATION_NOT_FOUND | Education record missing |
| EMPLOYMENT_NOT_FOUND | Employment record missing |
| FAMILY_DATA_INVALID | Invalid family information |
| SETTINGS_INVALID | Invalid settings payload |

---

# 50. Citizen API Summary

The Citizen APIs provide secure management of the BenefitOS Digital Twin while preserving the platform's event-driven architecture.

Profile changes automatically trigger recommendation recalculation, timeline regeneration, dashboard refresh, cache invalidation, and real-time client synchronization through WebSockets.

This design ensures that every connected device remains consistent without requiring manual page refreshes.

---

# End of Phase 3

**Next Phase:**

Document Management APIs

- Upload Documents
- Replace Documents
- Delete Documents
- OCR Processing
- OCR Status
- OCR Results
- Verification
- Generated PDFs
- Signed URLs
- WebSocket Progress Events
# Phase 4 – Document Management APIs

---

# 51. Document API Overview

The Document Management APIs allow citizens to securely upload, manage, verify, and retrieve personal documents.

Document processing is asynchronous.

The workflow integrates:

- Supabase Storage
- OCR Pipeline
- Gemini Vision
- BullMQ
- Redis
- Socket.IO

The frontend shall never poll for OCR progress.

All processing updates are delivered through WebSockets.

---

# 52. Document Endpoints

| Method | Endpoint | Authentication |
|----------|--------------------------------------|----------------|
| GET | /documents | JWT |
| GET | /documents/{id} | JWT |
| POST | /documents/upload | JWT |
| PUT | /documents/{id}/replace | JWT |
| DELETE | /documents/{id} | JWT |
| GET | /documents/{id}/status | JWT |
| GET | /documents/{id}/ocr | JWT |
| POST | /documents/{id}/verify | JWT |
| GET | /documents/{id}/download | JWT |
| GET | /documents/generated-pdfs | JWT |
| GET | /documents/generated-pdfs/{id} | JWT |

---

# 53. Upload Document

## Endpoint

```http
POST /api/v1/documents/upload
```

---

## Description

Uploads a citizen document.

The upload endpoint immediately returns after storing the file.

OCR processing begins asynchronously.

---

## Request

Content-Type

```http
multipart/form-data
```

---

Fields

```text
file

documentType

expiryDate (optional)
```

---

## Success Response

```json
{
  "success": true,
  "message": "Document uploaded successfully.",
  "data": {
    "documentId": "uuid",
    "status": "Uploaded"
  }
}
```

---

Published Events

```text
document.uploaded

ocr.job.created
```

---

Background Actions

- Store file
- Queue OCR
- Publish events

No OCR occurs during the HTTP request.

---

# 54. Replace Document

## Endpoint

```http
PUT /api/v1/documents/{id}/replace
```

---

Previous versions remain stored.

A new OCR process automatically begins.

---

Published Events

```text
document.replaced

ocr.job.created
```

---

# 55. Delete Document

## Endpoint

```http
DELETE /api/v1/documents/{id}
```

---

Business Rules

- Soft delete
- Recommendation refresh
- Timeline regeneration
- Cache invalidation

---

Published Events

```text
document.deleted

recommendation.refresh

timeline.refresh
```

---

# 56. List Documents

## Endpoint

```http
GET /api/v1/documents
```

---

Response

```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "documentType": "Aadhaar Card",
      "verificationStatus": "Verified",
      "uploadedAt": "...",
      "expiryDate": null
    }
  ]
}
```

---

Supports

- Filtering
- Sorting
- Pagination

---

# 57. Get Document

## Endpoint

```http
GET /api/v1/documents/{id}
```

---

Returns

- Metadata
- Verification
- OCR Summary
- Version Information

Never returns raw storage paths.

---

# 58. Get OCR Result

## Endpoint

```http
GET /api/v1/documents/{id}/ocr
```

---

Returns

```json
{
  "success": true,
  "data": {
    "confidence": 98.2,
    "fields": [
      {
        "name": "Name",
        "value": "Rahul Sharma",
        "verified": true
      }
    ]
  }
}
```

Only verified fields may be used by business logic.

---

# 59. Verify OCR

## Endpoint

```http
POST /api/v1/documents/{id}/verify
```

---

Example Request

```json
{
  "fields": [
    {
      "field": "Name",
      "value": "Rahul Sharma"
    },
    {
      "field": "DateOfBirth",
      "value": "2003-05-12"
    }
  ]
}
```

---

Background Actions

- Update Citizen Profile
- Refresh Recommendations
- Refresh Timeline

---

Published Events

```text
ocr.verified

profile.updated

recommendation.refresh
```

---

# 60. Document Status

## Endpoint

```http
GET /api/v1/documents/{id}/status
```

---

Response

```json
{
  "success": true,
  "data": {
    "status": "Processing",
    "progress": 72
  }
}
```

Normally this endpoint is used only when reconnecting after connection loss.

Real-time updates should come from WebSockets.

---

# 61. Download Document

## Endpoint

```http
GET /api/v1/documents/{id}/download
```

---

Returns

Temporary signed URL.

Example

```json
{
  "success": true,
  "data": {
    "downloadUrl": "...",
    "expiresIn": 300
  }
}
```

Storage paths are never exposed.

---

# 62. Generated PDFs

Retrieve

```http
GET /api/v1/documents/generated-pdfs
```

---

Retrieve One

```http
GET /api/v1/documents/generated-pdfs/{id}
```

---

Examples

- AI Checklist
- Recommendation Report
- Timeline Report
- Application Summary

Downloads always use signed URLs.

---

# 63. OCR Processing Flow

```text
Upload

↓

Supabase Storage

↓

BullMQ OCR Queue

↓

Gemini Vision OCR

↓

Extract Fields

↓

Citizen Verification

↓

Profile Update

↓

Recommendation Refresh

↓

Timeline Refresh

↓

Dashboard Refresh
```

Every stage publishes domain events.

---

# 64. WebSocket Events

The frontend shall subscribe to the following events.

| Event | Purpose |
|---------|----------|
| document.uploaded | Upload complete |
| document.processing | OCR started |
| document.progress | OCR progress |
| document.completed | OCR finished |
| document.failed | OCR failed |
| ocr.verified | Verification completed |
| recommendation.updated | Recommendations refreshed |
| timeline.updated | Timeline refreshed |
| dashboard.updated | Dashboard refreshed |

Example

```text
document.progress

↓

{
  "documentId":"...",
  "progress":67
}
```

---

# 65. Error Codes

| Code | Description |
|---------|---------------------------|
| INVALID_DOCUMENT | Unsupported document |
| FILE_TOO_LARGE | Upload exceeds limit |
| INVALID_FILE_FORMAT | Unsupported format |
| OCR_FAILED | OCR processing failed |
| DOCUMENT_NOT_FOUND | Document missing |
| VERIFICATION_FAILED | Verification unsuccessful |
| STORAGE_ERROR | Storage unavailable |
| DOWNLOAD_EXPIRED | Signed URL expired |

---

# 66. Security Rules

The Document APIs enforce:

- JWT Authentication
- Ownership Verification
- File Type Validation
- File Size Validation
- Virus Scanning
- Signed URLs
- Private Storage
- Audit Logging
- Rate Limiting

Citizens may only access their own documents.

---

# 67. API Summary

The Document Management APIs provide secure, asynchronous, and event-driven document handling for the BenefitOS Platform.

Documents are uploaded once, processed through background workers, verified by the citizen, and automatically synchronized across connected devices through WebSockets.

This design eliminates unnecessary polling while maintaining scalability, security, and production-grade user experience.

---

# End of Phase 4

**Next Phase:**

Welfare APIs

- Government Scheme APIs
- Categories
- Search
- Advanced Filtering
- Recommendation APIs
- Timeline APIs
- Application APIs
- Notification APIs
- Dashboard Aggregation APIs
- Real-Time Recommendation Updates
# Phase 5 – Welfare APIs

---

# 68. Welfare API Overview

The Welfare APIs expose the core business capabilities of the BenefitOS Platform.

These APIs allow citizens to:

- Discover government schemes
- Search and filter schemes
- View personalized recommendations
- Understand eligibility
- View missing requirements
- Track welfare timelines
- Manage applications
- Receive notifications

The Recommendation Engine remains the only component responsible for eligibility calculation.

---

# 69. Welfare API Endpoints

| Method | Endpoint | Authentication |
|----------|-----------------------------------------|----------------|
| GET | /schemes | Public |
| GET | /schemes/{id} | Public |
| GET | /schemes/categories | Public |
| GET | /schemes/search | Public |
| GET | /recommendations | JWT |
| GET | /recommendations/{id} | JWT |
| POST | /recommendations/refresh | JWT |
| GET | /timeline | JWT |
| GET | /applications | JWT |
| POST | /applications | JWT |
| GET | /applications/{id} | JWT |
| PATCH | /applications/{id} | JWT |
| GET | /notifications | JWT |
| PATCH | /notifications/{id}/read | JWT |
| PATCH | /notifications/read-all | JWT |

---

# 70. List Government Schemes

## Endpoint

```http
GET /api/v1/schemes
```

---

Supports

- Pagination
- Filtering
- Sorting
- Search

---

Query Parameters

```text
page

pageSize

category

state

benefitType

search

status
```

---

Example Response

```json
{
  "success": true,
  "data": [
    {
      "id":"...",
      "name":"PM Scholarship",
      "category":"Education",
      "benefitType":"Scholarship"
    }
  ]
}
```

---

# 71. Scheme Details

## Endpoint

```http
GET /api/v1/schemes/{id}
```

---

Returns

- Complete description
- Eligibility
- Required documents
- Benefits
- Official links

Example Response

```json
{
  "success": true,
  "data": {
    "scheme": {},
    "requiredDocuments": [],
    "eligibilitySummary": [],
    "officialLinks": []
  }
}
```

---

# 72. Scheme Categories

## Endpoint

```http
GET /api/v1/schemes/categories
```

---

Returns

```json
{
  "success": true,
  "data": [
    {
      "id":"...",
      "name":"Education"
    }
  ]
}
```

---

# 73. Scheme Search

## Endpoint

```http
GET /api/v1/schemes/search
```

---

Query

```text
?q=scholarship
```

---

Supports

- Full-text search
- Category filtering
- State filtering
- Ministry filtering

---

# 74. Recommendations

## Endpoint

```http
GET /api/v1/recommendations
```

---

Returns

```json
{
  "success": true,
  "data":[
    {
      "scheme":"...",
      "status":"Eligible",
      "score":98,
      "benefitEstimate":"₹50,000"
    }
  ]
}
```

---

Business Rule

Recommendations are always retrieved from the Recommendation Engine output.

The AI never generates recommendations.

---

# 75. Recommendation Details

## Endpoint

```http
GET /api/v1/recommendations/{id}
```

---

Returns

- Recommendation status
- Explanation
- Missing requirements
- Required documents
- Benefit estimate

Example

```json
{
  "success":true,
  "data":{
    "status":"Nearly Eligible",
    "missingRequirements":[],
    "requiredDocuments":[],
    "benefits":{}
  }
}
```

---

# 76. Refresh Recommendations

## Endpoint

```http
POST /api/v1/recommendations/refresh
```

---

Description

Queues a recommendation recalculation.

---

Success Response

```json
{
  "success":true,
  "message":"Recommendation refresh queued."
}
```

---

Background Workflow

```text
Queue Job

↓

Recommendation Engine

↓

Store Results

↓

Publish Event

↓

Dashboard Refresh
```

---

# 77. Welfare Timeline

## Endpoint

```http
GET /api/v1/timeline
```

---

Returns

```json
{
  "success":true,
  "data":[
    {
      "title":"Upload Income Certificate",
      "status":"Pending"
    }
  ]
}
```

Timeline is regenerated asynchronously.

---

# 78. Applications

Retrieve

```http
GET /api/v1/applications
```

---

Retrieve One

```http
GET /api/v1/applications/{id}
```

---

Create

```http
POST /api/v1/applications
```

---

Update

```http
PATCH /api/v1/applications/{id}
```

---

Example Request

```json
{
  "schemeId":"...",
  "applicationNumber":"ABC123456"
}
```

---

Applications represent externally submitted government applications.

BenefitOS does not submit applications to government portals.

---

# 79. Notifications

Retrieve

```http
GET /api/v1/notifications
```

---

Mark Read

```http
PATCH /api/v1/notifications/{id}/read
```

---

Mark All Read

```http
PATCH /api/v1/notifications/read-all
```

---

Example Response

```json
{
  "success":true,
  "data":[
    {
      "title":"Recommendation Updated",
      "read":false
    }
  ]
}
```

---

# 80. Background Events

The following actions publish domain events.

```text
recommendation.generated

timeline.updated

application.created

application.updated

notification.created

notification.read
```

---

# 81. WebSocket Events

Connected clients subscribe to:

| Event | Description |
|---------|-------------|
| recommendation.updated | Recommendation changed |
| recommendation.refresh.started | Refresh started |
| recommendation.refresh.completed | Refresh finished |
| timeline.updated | Timeline regenerated |
| application.created | New application |
| application.updated | Application status changed |
| notification.created | New notification |
| notification.read | Notification synchronized |

Example

```json
{
  "event":"recommendation.updated",
  "payload":{
    "recommendationCount":12
  }
}
```

Clients update only affected UI components.

---

# 82. Error Codes

| Code | Description |
|------|-------------|
| SCHEME_NOT_FOUND | Invalid scheme |
| RECOMMENDATION_NOT_FOUND | Recommendation unavailable |
| TIMELINE_NOT_FOUND | Timeline unavailable |
| APPLICATION_NOT_FOUND | Application missing |
| INVALID_APPLICATION | Invalid application data |
| NOTIFICATION_NOT_FOUND | Notification missing |

---

# 83. Security Rules

The Welfare APIs enforce:

- JWT Authentication (protected endpoints)
- Ownership validation
- Request validation
- Pagination limits
- Rate limiting
- Audit logging

Recommendation data is accessible only to its owner.

---

# 84. API Summary

The Welfare APIs provide secure and deterministic access to government schemes, personalized recommendations, welfare timelines, applications, and notifications.

Recommendation generation remains fully deterministic and independent of AI. Long-running operations execute asynchronously through BullMQ, while connected clients receive updates through WebSockets, ensuring a responsive user experience without unnecessary polling.

---

# End of Phase 5

**Next Phase:**

AI APIs

- AI Chat
- Streaming Responses
- Conversation Management
- Speech-to-Text
- PDF Summaries
- Document Checklists
- Translation
- AI Context APIs
- Streaming Protocol
- AI WebSocket Events
# Phase 6 – AI APIs

---

# 85. AI API Overview

The AI APIs provide conversational and assistive capabilities for the BenefitOS Platform.

The AI Copilot is responsible for:

- Explaining eligibility
- Comparing schemes
- Summarizing uploaded documents
- Generating document checklists
- Drafting application text
- Translating responses
- Answering welfare-related questions

The AI never:

- Determines eligibility
- Creates recommendation scores
- Invents government schemes
- Modifies business data directly

All AI responses are generated using verified business data and the Citizen Digital Twin.

---

# 86. AI Endpoints

| Method | Endpoint | Authentication |
|----------|-------------------------------------------|----------------|
| POST | /ai/chat | JWT |
| GET | /ai/conversations | JWT |
| GET | /ai/conversations/{id} | JWT |
| DELETE | /ai/conversations/{id} | JWT |
| POST | /ai/summarize | JWT |
| POST | /ai/checklist | JWT |
| POST | /ai/translate | JWT |
| POST | /ai/explain-recommendation | JWT |
| POST | /ai/context | JWT |
| POST | /speech/transcribe | JWT |

---

# 87. AI Chat

## Endpoint

```http
POST /api/v1/ai/chat
```

---

## Description

Creates a new AI interaction.

Responses are streamed.

---

## Request

```json
{
  "conversationId": "optional",
  "message": "Which scholarship should I apply for?"
}
```

---

## Response

```json
{
  "success": true,
  "data": {
    "conversationId": "uuid",
    "streamId": "uuid"
  }
}
```

The HTTP request acknowledges creation.

The AI response is streamed through WebSockets.

---

# 88. AI Conversation History

Retrieve Conversations

```http
GET /api/v1/ai/conversations
```

---

Retrieve One Conversation

```http
GET /api/v1/ai/conversations/{id}
```

---

Response

```json
{
  "success": true,
  "data": {
    "conversation": {},
    "messages": []
  }
}
```

---

Delete Conversation

```http
DELETE /api/v1/ai/conversations/{id}
```

Soft deletion shall be used.

---

# 89. Explain Recommendation

## Endpoint

```http
POST /api/v1/ai/explain-recommendation
```

---

Example Request

```json
{
  "recommendationId": "uuid"
}
```

---

Returns

- Plain-language explanation
- Missing requirements
- Recommended next actions

The AI consumes Recommendation Engine output without recalculating eligibility.

---

# 90. Document Summary

## Endpoint

```http
POST /api/v1/ai/summarize
```

---

Example Request

```json
{
  "documentId": "uuid"
}
```

---

Returns

- Summary
- Important details
- Actionable information

Only verified OCR content is used.

---

# 91. Document Checklist

## Endpoint

```http
POST /api/v1/ai/checklist
```

---

Example Request

```json
{
  "schemeId": "uuid"
}
```

---

Returns

```json
{
  "success": true,
  "data": {
    "checklist": [
      "Upload Aadhaar Card",
      "Upload Income Certificate"
    ]
  }
}
```

Checklist generation combines:

- Scheme requirements
- Citizen documents
- Recommendation results

---

# 92. Translation

## Endpoint

```http
POST /api/v1/ai/translate
```

---

Example Request

```json
{
  "text": "...",
  "targetLanguage": "Hindi"
}
```

---

Supported Languages

- English
- Hindi
- Tamil
- Telugu
- Bengali
- Marathi
- Gujarati
- Kannada
- Punjabi
- Malayalam

Additional languages may be added in future.

---

# 93. AI Context

## Endpoint

```http
POST /api/v1/ai/context
```

---

Purpose

Returns the business context used by AI.

This endpoint supports debugging and explainability.

Example Response

```json
{
  "success": true,
  "data": {
    "profileVersion": 12,
    "recommendationVersion": 8,
    "documentVersion": 5
  }
}
```

---

# 94. Speech-to-Text

## Endpoint

```http
POST /api/v1/speech/transcribe
```

---

Content Type

```http
multipart/form-data
```

---

Request

```text
audio

language
```

---

Workflow

```text
Audio

↓

Sarvam AI

↓

Text

↓

Frontend
```

The AI model receives text only.

Sarvam is never used for conversational responses.

---

# 95. AI Streaming

The AI response is streamed through Socket.IO.

Flow

```text
Client

↓

POST /ai/chat

↓

Queue AI Job

↓

Build Context

↓

Gemini

↓

Stream Tokens

↓

Socket.IO

↓

Client
```

Streaming begins immediately after the AI starts generating tokens.

---

# 96. WebSocket Events

The frontend subscribes to:

| Event | Description |
|---------|-------------|
| ai.stream.started | AI response started |
| ai.stream.token | Incremental response token |
| ai.stream.completed | Stream completed |
| ai.stream.error | Generation failed |
| ai.conversation.updated | Conversation metadata changed |
| ai.summary.completed | PDF summary generated |
| ai.checklist.generated | Checklist available |

---

Example Token Event

```json
{
  "event": "ai.stream.token",
  "payload": {
    "conversationId": "uuid",
    "content": "Based on your profile..."
  }
}
```

Clients append streamed content without waiting for the final response.

---

# 97. AI Background Workflow

```text
User Message

↓

Queue AI Job

↓

Build AI Context

↓

Fetch Recommendation Data

↓

Fetch Verified Documents

↓

Generate Prompt

↓

Gemini

↓

Stream Response

↓

Store Conversation

↓

Publish Completion Event
```

The Recommendation Engine remains independent of the AI pipeline.

---

# 98. AI Error Codes

| Code | Description |
|------|-------------|
| AI_UNAVAILABLE | AI service unavailable |
| AI_TIMEOUT | Request timed out |
| CONVERSATION_NOT_FOUND | Invalid conversation |
| INVALID_DOCUMENT | Document unavailable |
| CONTEXT_BUILD_FAILED | Context generation failed |
| TRANSLATION_FAILED | Translation unsuccessful |
| SPEECH_PROCESSING_FAILED | Speech transcription failed |

---

# 99. Security Rules

The AI APIs enforce:

- JWT Authentication
- Ownership validation
- Prompt sanitization
- Rate limiting
- Request size limits
- Conversation isolation
- Audit logging

AI requests shall never expose another citizen's data.

---

# 100. AI API Summary

The AI APIs provide intelligent assistance while preserving deterministic business logic.

The AI operates exclusively on verified citizen data and Recommendation Engine outputs, streaming responses in real time through WebSockets for a responsive user experience.

This architecture separates AI reasoning from eligibility calculation, ensuring transparency, explainability, scalability, and production readiness.

---

# End of Phase 6

**Next Phase:**

Real-Time APIs (WebSocket)

- Socket Authentication
- Connection Lifecycle
- User Rooms
- Event Contracts
- Event Payloads
- Heartbeats
- Presence
- Reconnection Strategy
- Error Handling
- Complete Socket Event Reference
# Phase 7 – Real-Time APIs (WebSocket Specification)

---

# 101. Real-Time API Overview

BenefitOS uses Socket.IO to provide real-time synchronization across all connected clients.

WebSockets eliminate unnecessary polling by pushing updates directly to authenticated users.

Real-time updates include:

- AI Streaming
- OCR Progress
- Recommendation Updates
- Dashboard Updates
- Timeline Updates
- Notifications
- Application Status
- System Events

The REST API remains the authoritative interface for CRUD operations.

WebSockets are used exclusively for server-initiated updates and bidirectional streaming.

---

# 102. Connection Architecture

```text
Frontend

↓

Socket.IO Client

↓

JWT Authentication

↓

Socket Gateway

↓

Redis Pub/Sub

↓

Application Services

↓

BullMQ Workers

↓

Database
```

Every connected client joins one or more logical rooms after authentication.

---

# 103. Connection Endpoint

Development

```text
ws://localhost:4000
```

Production

```text
wss://api.benefitos.in
```

Transport

```
WebSocket

Fallback

HTTP Long Polling
```

---

# 104. Socket Authentication

Authentication occurs during the connection handshake.

Client

```javascript
io(API_URL,{
    auth:{
        token:JWT
    }
})
```

Handshake Flow

```text
Client

↓

JWT

↓

NestJS Gateway

↓

JWT Validation

↓

User Lookup

↓

Socket Connected
```

Invalid tokens immediately disconnect the socket.

---

# 105. User Rooms

Each authenticated user joins dedicated Socket.IO rooms.

```text
user:{userId}

profile:{profileId}

conversation:{conversationId}

application:{applicationId}
```

Example

```text
user:7d83...

↓

Notification

↓

Recommendation

↓

Dashboard
```

Messages are emitted to rooms rather than individual socket IDs.

---

# 106. Connection Lifecycle

```text
Connect

↓

Authenticate

↓

Join Rooms

↓

Receive Events

↓

Heartbeat

↓

Reconnect (if disconnected)

↓

Disconnect
```

---

# 107. Heartbeats

Socket.IO heartbeat configuration:

Ping Interval

```
25 seconds
```

Ping Timeout

```
20 seconds
```

Inactive sockets are automatically disconnected.

---

# 108. Automatic Reconnection

The frontend shall automatically reconnect.

Recommended strategy

```
1 second

↓

2 seconds

↓

4 seconds

↓

8 seconds

↓

16 seconds

↓

Maximum 30 seconds
```

After reconnection the client shall:

- Rejoin rooms
- Synchronize missed notifications
- Refresh stale cache if necessary

---

# 109. WebSocket Event Categories

The platform groups events into logical domains.

```text
Authentication

Profile

Documents

OCR

Recommendations

Timeline

Dashboard

Notifications

Applications

AI

System
```

---

# 110. Authentication Events

| Event | Direction |
|---------|-----------|
| auth.connected | Server → Client |
| auth.disconnected | Server → Client |
| auth.session.expired | Server → Client |

---

Example

```json
{
    "event":"auth.connected",
    "payload":{
        "userId":"..."
    }
}
```

---

# 111. Profile Events

| Event |
|---------|
| profile.updated |
| profile.completion.updated |

Payload Example

```json
{
    "event":"profile.updated",
    "payload":{
        "completion":86
    }
}
```

---

# 112. Document Events

| Event |
|---------|
| document.uploaded |
| document.processing |
| document.progress |
| document.completed |
| document.failed |

Progress Example

```json
{
    "event":"document.progress",
    "payload":{
        "documentId":"...",
        "progress":62
    }
}
```

---

# 113. OCR Events

| Event |
|---------|
| ocr.started |
| ocr.completed |
| ocr.failed |
| ocr.verified |

---

# 114. Recommendation Events

| Event |
|---------|
| recommendation.refresh.started |
| recommendation.updated |
| recommendation.failed |

Payload

```json
{
    "event":"recommendation.updated",
    "payload":{
        "count":14
    }
}
```

---

# 115. Dashboard Events

| Event |
|---------|
| dashboard.updated |

Dashboard widgets update without refreshing the page.

---

# 116. Timeline Events

| Event |
|---------|
| timeline.updated |

Only affected timeline cards should refresh.

---

# 117. Notification Events

| Event |
|---------|
| notification.created |
| notification.updated |
| notification.deleted |
| notification.read |

Payload

```json
{
    "event":"notification.created",
    "payload":{
        "title":"Recommendation Updated"
    }
}
```

---

# 118. Application Events

| Event |
|---------|
| application.created |
| application.updated |
| application.closed |

Applications synchronize across all logged-in devices.

---

# 119. AI Streaming Events

| Event |
|---------|
| ai.stream.started |
| ai.stream.token |
| ai.stream.completed |
| ai.stream.error |

Example

```json
{
    "event":"ai.stream.token",
    "payload":{
        "conversationId":"...",
        "content":"Based on your profile..."
    }
}
```

Tokens are streamed incrementally.

Clients append content as it arrives.

---

# 120. System Events

| Event |
|---------|
| system.maintenance |
| system.shutdown |
| system.update.available |

These events notify users of platform-wide operational changes.

---

# 121. Event Envelope

Every WebSocket message follows the same structure.

```json
{
    "event":"recommendation.updated",
    "payload":{},
    "timestamp":"2026-08-06T10:00:00Z",
    "requestId":"req_xxxxx"
}
```

This matches the REST API response philosophy.

---

# 122. Error Events

Errors are standardized.

Example

```json
{
    "event":"socket.error",
    "payload":{
        "code":"UNAUTHORIZED",
        "message":"Session expired."
    }
}
```

---

# 123. Rate Limits

WebSocket events generated by clients shall be rate limited.

Examples

| Event | Limit |
|---------|--------|
| AI Chat | 10/min |
| Typing Indicator | 60/min |
| Read Notification | 120/min |

Server-generated events are not rate limited.

---

# 124. Security

WebSocket security includes:

- JWT Authentication
- Room Authorization
- Event Validation
- Payload Validation
- Rate Limiting
- TLS Encryption
- Replay Protection

Clients shall never subscribe to arbitrary rooms.

---

# 125. Real-Time API Summary

The BenefitOS WebSocket architecture enables low-latency, event-driven synchronization across the platform.

By combining authenticated Socket.IO connections, Redis Pub/Sub, BullMQ workers, and standardized event contracts, the platform delivers AI streaming, OCR progress, recommendation updates, timeline changes, and notifications without requiring repeated REST polling.

This architecture provides a scalable, secure, and production-ready real-time communication layer for both current web clients and future mobile applications.

---

# End of Phase 7

**Next Phase:**

API Engineering

- HTTP Status Codes
- Error Codes
- Pagination
- Filtering
- Sorting
- Idempotency
- API Security
- OpenAPI Standards
- API Testing
- API Versioning Strategy
- Complete Endpoint Index
- Final API Summary
# Phase 8 – API Engineering & Standards

---

# 126. HTTP Status Codes

BenefitOS follows standard HTTP status codes.

| Status | Meaning |
|---------|---------|
| 200 OK | Request successful |
| 201 Created | Resource created |
| 202 Accepted | Background job accepted |
| 204 No Content | Resource deleted |
| 400 Bad Request | Validation failed |
| 401 Unauthorized | Authentication required |
| 403 Forbidden | Permission denied |
| 404 Not Found | Resource not found |
| 409 Conflict | Duplicate resource |
| 413 Payload Too Large | Upload exceeds limit |
| 415 Unsupported Media Type | Invalid file format |
| 422 Unprocessable Entity | Business validation failed |
| 429 Too Many Requests | Rate limit exceeded |
| 500 Internal Server Error | Unexpected server error |
| 503 Service Unavailable | Dependency unavailable |

---

# 127. Standard Error Codes

Application errors use stable machine-readable codes.

Examples

```text
VALIDATION_ERROR

UNAUTHORIZED

FORBIDDEN

NOT_FOUND

DUPLICATE_RESOURCE

RATE_LIMIT_EXCEEDED

AI_UNAVAILABLE

OCR_FAILED

RECOMMENDATION_FAILED

STORAGE_UNAVAILABLE

DATABASE_ERROR

QUEUE_UNAVAILABLE

WEBSOCKET_DISCONNECTED
```

Error codes are part of the public API contract.

---

# 128. Pagination

Large collections shall use cursor pagination.

Example

```http
GET /api/v1/schemes?cursor=abc123&limit=20
```

Response

```json
{
  "success": true,
  "data": [],
  "meta": {
    "nextCursor": "xyz456",
    "hasNext": true
  }
}
```

Offset pagination may be used only for administrative dashboards.

---

# 129. Filtering

Filtering follows query parameter conventions.

Example

```http
GET /api/v1/schemes

?category=Education

&state=Delhi

&benefitType=Scholarship
```

Multiple filters are combined using logical AND.

---

# 130. Sorting

Sorting syntax

```http
?sort=createdAt

?order=desc
```

Supported values

Ascending

```text
asc
```

Descending

```text
desc
```

---

# 131. Search

Search parameter

```http
?q=scholarship
```

Search uses PostgreSQL Full-Text Search.

Search results are ranked by relevance.

---

# 132. Idempotency

Operations that may be retried shall support idempotency.

Supported endpoints

- Document Upload
- AI Requests
- Application Creation
- Recommendation Refresh

Header

```http
Idempotency-Key: uuid
```

Duplicate requests with the same key shall not create duplicate resources.

---

# 133. Caching Strategy

Response caching shall be applied where appropriate.

Examples

| Resource | Strategy |
|----------|----------|
| Scheme Categories | Long Cache |
| Scheme Details | Medium Cache |
| Dashboard | Redis Cache |
| Recommendations | Redis Cache |
| Notifications | No Cache |
| AI Responses | No Cache |

Redis is the primary cache provider.

---

# 134. Rate Limiting

Default limits

| Endpoint | Limit |
|----------|-------|
| Authentication | 10/min |
| AI Chat | 10/min |
| OCR Upload | 20/hour |
| Search | 120/min |
| General APIs | 300/min |

Rate limiting is enforced per authenticated user.

---

# 135. API Security

Every endpoint shall enforce:

- HTTPS
- JWT Authentication
- Ownership Validation
- Input Sanitization
- Request Validation
- File Validation
- Secure Headers
- Rate Limiting
- Audit Logging

No endpoint shall trust client-provided data.

---

# 136. API Observability

Every request receives a unique Request ID.

Example

```http
X-Request-ID: req_123456789
```

Every request shall be logged with:

- Request ID
- User ID (if authenticated)
- Endpoint
- Method
- Duration
- Status Code

Sensitive information shall never be logged.

---

# 137. OpenAPI Documentation

Swagger shall be generated automatically.

Documentation shall include:

- Request Schemas
- Response Schemas
- Authentication
- Error Responses
- Example Payloads

Endpoint

```text
/api/docs
```

Swagger is disabled in production unless explicitly enabled.

---

# 138. API Testing

Every endpoint shall include automated tests.

Required test categories

- Unit Tests
- Integration Tests
- Contract Tests
- Authentication Tests
- Authorization Tests
- Validation Tests
- Performance Tests

Real-time APIs shall include WebSocket integration tests.

---

# 139. Backward Compatibility

Breaking API changes require:

- New version
- Migration guide
- Deprecation notice

Existing clients shall continue functioning throughout the deprecation period.

---

# 140. API Lifecycle

Every endpoint follows this lifecycle.

```text
Design

↓

Implementation

↓

Unit Testing

↓

Integration Testing

↓

Documentation

↓

Review

↓

Deployment

↓

Monitoring
```

Documentation is updated before deployment.

---

# 141. Endpoint Naming Rules

Rules

- Use plural resources.
- Use nouns instead of verbs.
- Keep URLs lowercase.
- Avoid deeply nested resources.

Correct

```text
/api/v1/documents

/api/v1/recommendations

/api/v1/notifications
```

Incorrect

```text
/api/v1/getRecommendations

/api/v1/updateProfile
```

HTTP methods express the action.

---

# 142. Complete API Modules

The BenefitOS API consists of the following modules.

- Authentication
- Citizen Profile
- Dashboard
- Documents
- OCR
- Government Schemes
- Recommendations
- Timeline
- Applications
- Notifications
- AI Copilot
- Speech-to-Text
- WebSocket Gateway
- Health
- Settings

Each module owns its own controllers, DTOs, services, validation, and documentation.

---

# 143. API Review Checklist

Before releasing any API change, verify:

□ OpenAPI documentation updated

□ Validation implemented

□ Authentication verified

□ Authorization verified

□ Error responses standardized

□ Logging implemented

□ Metrics collected

□ Rate limiting configured

□ WebSocket events documented

□ Tests passing

□ No breaking changes

---

# 144. API Summary

The BenefitOS API Specification defines a secure, scalable, and production-ready communication contract for the entire platform.

The architecture combines:

- REST APIs for deterministic request-response operations
- Socket.IO for real-time synchronization
- BullMQ for asynchronous processing
- Redis for distributed caching and messaging
- Supabase Authentication for identity
- Standardized request and response contracts
- Strong validation and security
- Comprehensive observability
- Automatic API documentation

This specification serves as the single source of truth for frontend, backend, AI services, background workers, and future client applications.

---

# End of Document

**Document Status:** Final

**Document Number:** 08

**Document Version:** 2.0.0

**Primary Protocol:** HTTPS REST

**Real-Time Protocol:** Socket.IO

**Authentication:** Supabase JWT

**Documentation:** OpenAPI 3.1 (Swagger)

**Next Document:** 09 – AI Architecture