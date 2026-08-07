# BenefitOS Platform

---

# 07 - Database Design

| Field | Value |
|--------|--------|
| Document Title | Database Design |
| Document Number | 07 |
| Version | 2.0.0 |
| Status | Final |
| Project | BenefitOS Platform |
| Primary Database | PostgreSQL (Supabase) |
| ORM | Prisma |
| Cache | Redis |
| Object Storage | Supabase Storage |
| Audience | Software Architects, Backend Engineers, Database Engineers, DevOps Engineers, AI Development Agents |
| Purpose | Define the complete data architecture and relational database design of the BenefitOS Platform |

---

# Table of Contents

1. Introduction
2. Database Vision
3. Database Goals
4. Database Principles
5. Data Storage Architecture
6. Technology Stack
7. High-Level Database Architecture
8. Data Classification
9. Core Business Domains
10. Entity Relationship Overview
11. Database Standards
12. Database Summary

---

# 1. Introduction

The BenefitOS database is the authoritative source of truth for all persistent business data.

It stores citizen profiles, welfare schemes, recommendations, document metadata, OCR results, AI conversations, application tracking information, timelines, notifications, and system audit records.

The database is designed to provide:

- Strong consistency
- High availability
- Scalability
- Security
- Auditability
- Long-term maintainability

All business-critical information shall persist within PostgreSQL.

Redis and browser caches are optimization layers and shall never become the primary source of truth.

---

# 2. Database Vision

The BenefitOS data layer shall provide a reliable, secure, and scalable foundation capable of supporting millions of citizens while maintaining accurate welfare eligibility, explainable recommendations, and complete auditability.

The database shall support:

- Deterministic recommendation generation
- AI-assisted citizen guidance
- Real-time synchronization
- Secure document management
- Event-driven workflows
- Future platform expansion

without requiring major schema redesign.

---

# 3. Database Goals

The database architecture is designed to achieve the following objectives.

## Data Integrity

Maintain referential integrity across all business entities.

---

## Consistency

Guarantee ACID-compliant transactions for all critical operations.

---

## Performance

Provide efficient query execution through indexing, optimized relationships, and caching.

---

## Security

Protect citizen information using Row Level Security, private storage, and encrypted communication.

---

## Scalability

Support increasing data volumes without significant redesign.

---

## Maintainability

Encourage modular schema organization and predictable migrations.

---

## Auditability

Maintain historical records of important business events.

---

## Extensibility

Allow future modules to integrate without breaking existing data models.

---

# 4. Database Principles

The following principles apply to every table and relationship.

## Single Source of Truth

Persistent business data shall exist only in PostgreSQL.

---

## Strong Typing

Every column shall use the most appropriate PostgreSQL data type.

---

## Referential Integrity

Foreign key constraints shall enforce valid relationships.

---

## Minimal Redundancy

Data duplication shall be avoided unless justified by measurable performance improvements.

---

## Immutable History

Historical business events shall remain available for auditing where required.

---

## Soft Deletes

Entities requiring recovery or historical analysis shall use soft deletion.

---

## Event Consistency

Background jobs shall update the database through clearly defined transactional boundaries.

---

## Privacy by Design

Only necessary personal information shall be collected and stored.

---

# 5. Data Storage Architecture

BenefitOS uses multiple storage technologies, each optimized for a specific responsibility.

| Storage Layer | Purpose |
|---------------|---------|
| PostgreSQL | Persistent Business Data |
| Redis | Cache, Pub/Sub, Queue Backend |
| Supabase Storage | Private Files |
| Browser Cache | Static Assets |
| TanStack Query Cache | Client-side API Cache |

PostgreSQL remains the authoritative source for all business data.

Redis shall never replace relational persistence.

---

# 6. Technology Stack

## Relational Database

| Technology | Purpose |
|------------|---------|
| PostgreSQL 16+ | Primary Database |

---

## ORM

| Technology | Purpose |
|------------|---------|
| Prisma ORM | Type-safe Data Access |

---

## Cache

| Technology | Purpose |
|------------|---------|
| Redis | Cache, Pub/Sub, Queue Backend |

---

## Object Storage

| Technology | Purpose |
|------------|---------|
| Supabase Storage | Private Document Storage |

---

## Queue Metadata

| Technology | Purpose |
|------------|---------|
| BullMQ | Background Job Metadata |

---

# 7. High-Level Database Architecture

```text
                        Next.js

                           │

                           ▼

                      NestJS API

                           │

                     Prisma ORM

                           │

      ┌──────────────┼──────────────┐

      ▼              ▼              ▼

 PostgreSQL      Redis Cache   Supabase Storage

      │              │              │

      ▼              ▼              ▼

 Business Data   Temporary Data   Private Files

```

Each storage layer owns a distinct responsibility.

Persistent business information shall not be stored in Redis.

Files shall not be stored inside PostgreSQL.

---

# 8. Data Classification

The platform manages several categories of data.

## Identity Data

Examples:

- User Account
- Authentication Metadata
- Session Information

---

## Citizen Data

Examples:

- Personal Details
- Address
- Education
- Employment
- Family
- Preferences

---

## Welfare Data

Examples:

- Government Schemes
- Eligibility Rules
- Recommendation Results

---

## Document Data

Examples:

- Uploaded Documents
- OCR Results
- Verification Status

---

## AI Data

Examples:

- Conversations
- Messages
- Prompt Metadata

---

## Operational Data

Examples:

- Notifications
- Timeline Entries
- Audit Logs
- Activity History

---

## Infrastructure Data

Examples:

- Cache Keys
- Queue Metadata
- Session Metadata

---

# 9. Core Business Domains

The database is organized around independent business domains.

```text
Authentication

Citizen Profile

Documents

OCR

Government Schemes

Recommendations

AI

Timeline

Applications

Notifications

Settings

Audit

Infrastructure
```

Each domain owns its own set of entities while maintaining controlled relationships with other domains.

---

# 10. Entity Relationship Overview

The core relationships are illustrated below.

```text
User

│

├── Citizen Profile

│       │

│       ├── Address

│       ├── Education

│       ├── Employment

│       ├── Family

│       └── Preferences

│

├── Documents

│       │

│       └── OCR Results

│

├── Recommendations

│

├── Timeline

│

├── Applications

│

├── Notifications

│

└── AI Conversations

        │

        └── AI Messages
```

All relationships shall enforce referential integrity through foreign key constraints.

---

# 11. Database Standards

Every persistent table shall include the following fields.

Mandatory:

```text
id

created_at

updated_at
```

Optional:

```text
deleted_at

version
```

Primary keys shall use UUIDs.

Timestamp fields shall use UTC.

Naming conventions:

- Tables: snake_case plural
- Columns: snake_case
- Foreign Keys: <entity>_id
- Indexes: idx_<table>_<column>

Schema changes shall be managed exclusively through Prisma migrations.

Direct production schema modifications are prohibited.

---

# 12. Database Summary

The BenefitOS Database Design establishes PostgreSQL as the authoritative source of truth while integrating Redis for temporary data and Supabase Storage for secure document management.

The architecture emphasizes:

- Strong consistency
- Referential integrity
- Modular domain organization
- Secure storage
- Optimized performance
- Event-driven updates
- Long-term maintainability

This document provides the foundation for every database entity, migration, query, and persistence strategy used throughout the BenefitOS Platform.

---

# End of Phase 1

**Next Phase:**

Core Data Model

- User
- Citizen Digital Twin
- Address
- Education
- Employment
- Family
- Preferences
- Sessions
- Devices
- Complete relational schema

# Phase 2 – Core Data Model

---

# 13. Core Data Model

## Overview

The BenefitOS database is organized into domain-driven entities.

The **Citizen Digital Twin** serves as the central aggregate, with all user-specific information linked to it through normalized relationships.

```text
User

↓

Citizen Profile

├── Address
├── Education
├── Employment
├── Family
├── Preferences
├── Devices
├── Sessions
└── Activity
```

Every recommendation, document, timeline, and AI interaction references the Citizen Digital Twin.

---

# 14. User Entity

## Purpose

Represents an authenticated account.

Authentication is handled by Supabase Auth, while BenefitOS stores additional application-specific information.

---

## Table

```text
users
```

---

## Fields

| Field | Type | Description |
|--------|------|-------------|
| id | UUID | Primary Key |
| auth_user_id | UUID | Supabase User ID |
| email | VARCHAR | Verified Email |
| full_name | VARCHAR | Display Name |
| avatar_url | TEXT | Profile Image |
| status | ENUM | Active / Suspended / Deleted |
| last_login_at | TIMESTAMP | Last Successful Login |
| created_at | TIMESTAMP | Creation Time |
| updated_at | TIMESTAMP | Last Update |

---

## Relationships

```text
User

1

↓

1

Citizen Profile

1

↓

N

Sessions

1

↓

N

Devices
```

---

# 15. Citizen Profile Entity

## Purpose

Represents the Citizen Digital Twin.

This entity contains the primary demographic information used by the Recommendation Engine.

---

## Table

```text
citizen_profiles
```

---

## Fields

| Field | Type |
|--------|------|
| id | UUID |
| user_id | UUID |
| first_name | VARCHAR |
| middle_name | VARCHAR |
| last_name | VARCHAR |
| gender | ENUM |
| date_of_birth | DATE |
| marital_status | ENUM |
| nationality | VARCHAR |
| occupation | VARCHAR |
| profession | VARCHAR |
| annual_income | DECIMAL |
| disability_status | BOOLEAN |
| disability_percentage | INTEGER |
| profile_completion | INTEGER |
| language | VARCHAR |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

Profile completion shall be automatically calculated.

Recommendation generation depends upon profile completeness.

---

# 16. Address Entity

Citizens may maintain multiple addresses.

Examples:

- Permanent
- Current
- Communication

---

## Table

```text
addresses
```

---

## Fields

| Field | Type |
|--------|------|
| id | UUID |
| profile_id | UUID |
| address_type | ENUM |
| line_1 | TEXT |
| line_2 | TEXT |
| city | VARCHAR |
| district | VARCHAR |
| state | VARCHAR |
| postal_code | VARCHAR |
| country | VARCHAR |
| is_primary | BOOLEAN |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Relationship

```text
Citizen Profile

1

↓

N

Addresses
```

---

# 17. Education Entity

Stores educational history.

---

## Table

```text
educations
```

---

## Fields

| Field | Type |
|--------|------|
| id | UUID |
| profile_id | UUID |
| qualification | VARCHAR |
| institution | VARCHAR |
| board_university | VARCHAR |
| completion_year | INTEGER |
| percentage | DECIMAL |
| currently_studying | BOOLEAN |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

Relationship

```text
Citizen Profile

1

↓

N

Education Records
```

---

# 18. Employment Entity

Stores employment and profession information.

---

## Table

```text
employments
```

---

## Fields

| Field | Type |
|--------|------|
| id | UUID |
| profile_id | UUID |
| employment_type | ENUM |
| organization | VARCHAR |
| designation | VARCHAR |
| profession | VARCHAR |
| monthly_income | DECIMAL |
| annual_income | DECIMAL |
| employment_status | ENUM |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

Employment information contributes directly to recommendation eligibility.

---

# 19. Family Entity

Stores family composition.

---

## Table

```text
families
```

---

## Fields

| Field | Type |
|--------|------|
| id | UUID |
| profile_id | UUID |
| family_size | INTEGER |
| dependents | INTEGER |
| annual_family_income | DECIMAL |
| ration_card_category | ENUM |
| bpl_status | BOOLEAN |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

This information is used by multiple welfare schemes.

---

# 20. Preference Entity

Stores citizen preferences.

---

## Table

```text
preferences
```

---

## Fields

| Field | Type |
|--------|------|
| id | UUID |
| profile_id | UUID |
| preferred_language | VARCHAR |
| theme | ENUM |
| email_notifications | BOOLEAN |
| push_notifications | BOOLEAN |
| ai_language | VARCHAR |
| accessibility_mode | BOOLEAN |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

Preferences personalize the user experience without affecting eligibility calculations.

---

# 21. Device Entity

Tracks authenticated devices.

---

## Table

```text
devices
```

---

## Fields

| Field | Type |
|--------|------|
| id | UUID |
| user_id | UUID |
| device_name | VARCHAR |
| operating_system | VARCHAR |
| browser | VARCHAR |
| last_active_at | TIMESTAMP |
| trusted | BOOLEAN |
| created_at | TIMESTAMP |

---

Future versions may expose device management to citizens.

---

# 22. Session Entity

Tracks active authenticated sessions.

---

## Table

```text
sessions
```

---

## Fields

| Field | Type |
|--------|------|
| id | UUID |
| user_id | UUID |
| refresh_token_hash | TEXT |
| ip_address | VARCHAR |
| user_agent | TEXT |
| expires_at | TIMESTAMP |
| created_at | TIMESTAMP |

---

Sessions enable:

- Multi-device login
- Session revocation
- Security auditing

---

# 23. Activity Entity

Maintains a chronological history of important user actions.

---

## Table

```text
activities
```

---

## Fields

| Field | Type |
|--------|------|
| id | UUID |
| user_id | UUID |
| activity_type | VARCHAR |
| description | TEXT |
| metadata | JSONB |
| created_at | TIMESTAMP |

---

Examples

- Profile Updated
- Document Uploaded
- Recommendation Generated
- OCR Completed
- AI Conversation Started

---

# 24. Relationship Diagram

```text
User

│

├────────────── Citizen Profile

│                     │

│                     ├──────── Addresses

│                     ├──────── Education

│                     ├──────── Employment

│                     ├──────── Family

│                     └──────── Preferences

│

├────────────── Devices

├────────────── Sessions

└────────────── Activities
```

---

# 25. Index Strategy

Recommended indexes include:

```text
users.email

citizen_profiles.user_id

addresses.profile_id

educations.profile_id

employments.profile_id

families.profile_id

preferences.profile_id

devices.user_id

sessions.user_id

activities.user_id
```

Indexes shall be created through Prisma migrations.

---

# 26. Constraints

The following constraints shall apply:

- Every Citizen Profile must belong to one User.
- Every Address must reference one Citizen Profile.
- Sessions must reference valid Users.
- Devices must reference valid Users.
- Activities must reference valid Users.
- Foreign keys shall enforce referential integrity.
- UUIDs shall be used for all primary keys.

---

# 27. Phase Summary

The Core Data Model establishes the Citizen Digital Twin as the central business entity of the BenefitOS Platform.

Supporting entities such as addresses, education, employment, family information, preferences, devices, sessions, and activities extend the Digital Twin while maintaining normalized relationships and strong referential integrity.

This data model provides the foundation for recommendation generation, AI personalization, document verification, application tracking, and timeline creation.

---

# End of Phase 2

**Next Phase:**

Welfare Data Model

- Government Schemes
- Scheme Categories
- Eligibility Rules
- Recommendation Results
- Missing Requirements
- Recommendation History
- Benefit Estimation
- Recommendation Relationships
```
# Phase 3 – Welfare Data Model

---

# 28. Welfare Domain Overview

The Welfare Domain stores all information required to determine a citizen's eligibility for government welfare schemes.

The Recommendation Engine evaluates citizen data against this domain to generate deterministic recommendations.

The AI module consumes recommendation results but shall never modify or generate them.

The Welfare Domain consists of:

- Scheme Categories
- Government Schemes
- Eligibility Rules
- Required Documents
- Recommendation Results
- Missing Requirements
- Recommendation History
- Benefit Estimates

---

# 29. Scheme Category Entity

## Purpose

Organizes schemes into logical categories for navigation and filtering.

---

## Table

```text
scheme_categories
```

---

## Fields

| Field | Type |
|--------|------|
| id | UUID |
| name | VARCHAR |
| slug | VARCHAR |
| description | TEXT |
| icon | VARCHAR |
| display_order | INTEGER |
| is_active | BOOLEAN |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Example Categories

- Education
- Agriculture
- Healthcare
- Employment
- Housing
- Women Empowerment
- Senior Citizens
- Disability
- Entrepreneurship
- Social Welfare

---

Relationship

```text
Scheme Category

1

↓

N

Government Schemes
```

---

# 30. Government Scheme Entity

## Purpose

Represents an official government welfare scheme.

---

## Table

```text
government_schemes
```

---

## Fields

| Field | Type |
|--------|------|
| id | UUID |
| category_id | UUID |
| scheme_code | VARCHAR |
| name | VARCHAR |
| short_description | TEXT |
| detailed_description | TEXT |
| ministry | VARCHAR |
| implementing_agency | VARCHAR |
| official_url | TEXT |
| application_url | TEXT |
| scheme_level | ENUM |
| benefit_type | ENUM |
| application_mode | ENUM |
| status | ENUM |
| launch_date | DATE |
| expiry_date | DATE |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Scheme Levels

- Central
- State
- District
- Municipal

---

## Benefit Types

- Scholarship
- Subsidy
- Pension
- Loan
- Insurance
- Training
- Financial Assistance
- Healthcare
- Housing
- Employment

---

# 31. Eligibility Rule Entity

## Purpose

Stores deterministic rules used by the Recommendation Engine.

The AI never evaluates these rules.

---

## Table

```text
eligibility_rules
```

---

## Fields

| Field | Type |
|--------|------|
| id | UUID |
| scheme_id | UUID |
| rule_name | VARCHAR |
| attribute | VARCHAR |
| operator | ENUM |
| expected_value | TEXT |
| priority | INTEGER |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Example Rules

- Age ≥ 18
- Annual Income ≤ ₹2,50,000
- Gender = Female
- State = Uttar Pradesh
- Student = True
- Disability ≥ 40%

---

Relationship

```text
Government Scheme

1

↓

N

Eligibility Rules
```

---

# 32. Required Document Entity

## Purpose

Defines documents required for a scheme application.

---

## Table

```text
required_documents
```

---

## Fields

| Field | Type |
|--------|------|
| id | UUID |
| scheme_id | UUID |
| document_type | VARCHAR |
| mandatory | BOOLEAN |
| description | TEXT |
| created_at | TIMESTAMP |

---

Examples

- Aadhaar Card
- PAN Card
- Income Certificate
- Caste Certificate
- Disability Certificate
- Bank Passbook

---

# 33. Recommendation Entity

## Purpose

Stores recommendation results generated by the Recommendation Engine.

Recommendations are persisted so they can be viewed without recalculating eligibility on every request.

---

## Table

```text
recommendations
```

---

## Fields

| Field | Type |
|--------|------|
| id | UUID |
| profile_id | UUID |
| scheme_id | UUID |
| recommendation_status | ENUM |
| recommendation_score | DECIMAL |
| explanation | TEXT |
| generated_at | TIMESTAMP |
| expires_at | TIMESTAMP |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Recommendation Status

- Eligible
- Nearly Eligible
- Future Eligible
- Not Eligible

---

Business Rule

Recommendation results shall only be generated by the Recommendation Engine.

Manual editing is prohibited.

---

# 34. Missing Requirement Entity

## Purpose

Stores unmet eligibility conditions.

---

## Table

```text
missing_requirements
```

---

## Fields

| Field | Type |
|--------|------|
| id | UUID |
| recommendation_id | UUID |
| requirement_name | VARCHAR |
| current_value | TEXT |
| required_value | TEXT |
| created_at | TIMESTAMP |

---

Examples

- Income exceeds threshold
- Missing income certificate
- Age requirement not satisfied

---

Relationship

```text
Recommendation

1

↓

N

Missing Requirements
```

---

# 35. Benefit Estimate Entity

## Purpose

Stores structured benefit information associated with a recommendation.

---

## Table

```text
benefit_estimates
```

---

## Fields

| Field | Type |
|--------|------|
| id | UUID |
| recommendation_id | UUID |
| benefit_type | VARCHAR |
| estimated_amount | DECIMAL |
| currency | VARCHAR |
| notes | TEXT |
| created_at | TIMESTAMP |

---

Examples

- ₹50,000 Scholarship
- ₹1,20,000 Housing Subsidy
- ₹3,000 Monthly Pension

---

# 36. Recommendation History Entity

## Purpose

Maintains historical recommendation snapshots.

---

## Table

```text
recommendation_history
```

---

## Fields

| Field | Type |
|--------|------|
| id | UUID |
| profile_id | UUID |
| recommendation_id | UUID |
| trigger_reason | ENUM |
| snapshot | JSONB |
| generated_at | TIMESTAMP |

---

## Trigger Reasons

- Profile Updated
- Document Uploaded
- Scheme Updated
- Manual Refresh
- Scheduled Refresh

---

Historical recommendations shall never be modified after creation.

---

# 37. Welfare Relationships

```text
Scheme Category

│

└──────── Government Scheme

               │

      ┌────────┼─────────┐

      ▼        ▼         ▼

Eligibility  Documents  Recommendations

                            │

                    ┌───────┼────────┐

                    ▼       ▼        ▼

             Missing Req  Benefits  History
```

---

# 38. Index Strategy

Recommended indexes:

```text
government_schemes.category_id

government_schemes.status

eligibility_rules.scheme_id

recommendations.profile_id

recommendations.scheme_id

recommendations.recommendation_status

missing_requirements.recommendation_id

benefit_estimates.recommendation_id

recommendation_history.profile_id
```

---

# 39. Constraints

The following rules apply:

- Every Government Scheme belongs to one Scheme Category.
- Every Eligibility Rule belongs to one Scheme.
- Every Recommendation belongs to one Citizen Profile and one Scheme.
- Every Missing Requirement belongs to one Recommendation.
- Every Benefit Estimate belongs to one Recommendation.
- Recommendation History records are immutable.

---

# 40. Phase Summary

The Welfare Data Model defines the deterministic data structures that power the Recommendation Engine.

Government schemes, eligibility rules, required documents, recommendation results, benefit estimates, and recommendation history are modeled as independent but related entities, ensuring explainable, auditable, and reproducible eligibility calculations.

This design preserves a strict separation between deterministic business logic and AI-generated explanations, allowing BenefitOS to remain transparent, maintainable, and production-ready.

---

# End of Phase 3

**Next Phase:**

Document Management Data Model

- Uploaded Documents
- Document Types
- OCR Results
- OCR Fields
- Verification Records
- Generated PDFs
- File Metadata
- Storage References
- Document Versioning
- Document Relationships
```
# Phase 4 – Document Management Data Model

---

# 41. Document Management Overview

The Document Management System is responsible for securely storing, processing, verifying, and managing all citizen documents.

Every uploaded document progresses through a controlled lifecycle before becoming eligible for use by the Recommendation Engine.

The Document Domain consists of:

- Document Types
- Uploaded Documents
- OCR Jobs
- OCR Results
- Extracted Fields
- Verification Records
- Generated PDFs
- File Metadata
- Document Versions

Only verified document data may influence recommendation generation.

---

# 42. Document Type Entity

## Purpose

Defines the supported document categories within the platform.

---

## Table

```text
document_types
```

---

## Fields

| Field | Type |
|--------|------|
| id | UUID |
| name | VARCHAR |
| code | VARCHAR |
| description | TEXT |
| accepted_formats | JSONB |
| max_file_size_mb | INTEGER |
| expiry_supported | BOOLEAN |
| ocr_supported | BOOLEAN |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Example Types

- Aadhaar Card
- PAN Card
- Income Certificate
- Caste Certificate
- Disability Certificate
- Birth Certificate
- Domicile Certificate
- Bank Passbook
- Student ID

---

# 43. Uploaded Document Entity

## Purpose

Stores metadata for every uploaded document.

The actual file remains in Supabase Storage.

---

## Table

```text
documents
```

---

## Fields

| Field | Type |
|--------|------|
| id | UUID |
| profile_id | UUID |
| document_type_id | UUID |
| original_file_name | VARCHAR |
| storage_path | TEXT |
| mime_type | VARCHAR |
| file_size | BIGINT |
| checksum | VARCHAR |
| upload_status | ENUM |
| verification_status | ENUM |
| expiry_date | DATE |
| uploaded_at | TIMESTAMP |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Upload Status

- Uploaded
- Processing
- Completed
- Failed

---

## Verification Status

- Pending
- Verified
- Rejected
- Expired

---

Business Rule

A document becomes eligible for recommendation processing only after successful verification.

---

# 44. OCR Job Entity

## Purpose

Tracks asynchronous OCR processing.

---

## Table

```text
ocr_jobs
```

---

## Fields

| Field | Type |
|--------|------|
| id | UUID |
| document_id | UUID |
| queue_job_id | VARCHAR |
| status | ENUM |
| progress | INTEGER |
| started_at | TIMESTAMP |
| completed_at | TIMESTAMP |
| created_at | TIMESTAMP |

---

## Status

- Queued
- Processing
- Completed
- Failed
- Cancelled

---

Each uploaded document may generate one OCR job.

---

# 45. OCR Result Entity

## Purpose

Stores structured OCR output returned by Gemini Vision.

---

## Table

```text
ocr_results
```

---

## Fields

| Field | Type |
|--------|------|
| id | UUID |
| document_id | UUID |
| confidence_score | DECIMAL |
| raw_text | TEXT |
| processing_time_ms | INTEGER |
| created_at | TIMESTAMP |

---

Business Rule

Raw OCR output is stored for audit purposes.

Recommendation generation uses only verified extracted fields.

---

# 46. OCR Extracted Field Entity

## Purpose

Stores individual fields extracted from OCR.

---

## Table

```text
ocr_fields
```

---

## Fields

| Field | Type |
|--------|------|
| id | UUID |
| ocr_result_id | UUID |
| field_name | VARCHAR |
| extracted_value | TEXT |
| confidence | DECIMAL |
| verified_value | TEXT |
| verification_status | ENUM |
| created_at | TIMESTAMP |

---

## Verification Status

- Pending
- Confirmed
- Corrected
- Rejected

---

Examples

- Name
- Date of Birth
- Aadhaar Number
- PAN Number
- Income
- Address

---

# 47. Document Verification Entity

## Purpose

Tracks manual verification performed by the citizen.

---

## Table

```text
document_verifications
```

---

## Fields

| Field | Type |
|--------|------|
| id | UUID |
| document_id | UUID |
| verified_by | UUID |
| verification_method | ENUM |
| verification_notes | TEXT |
| verified_at | TIMESTAMP |

---

## Verification Methods

- Citizen Confirmation
- Manual Review
- Automatic Validation

---

Only verified fields shall update the Citizen Digital Twin.

---

# 48. Generated PDF Entity

## Purpose

Stores metadata for system-generated PDF documents.

---

## Table

```text
generated_pdfs
```

---

## Fields

| Field | Type |
|--------|------|
| id | UUID |
| profile_id | UUID |
| pdf_type | ENUM |
| storage_path | TEXT |
| generated_at | TIMESTAMP |
| expires_at | TIMESTAMP |

---

Examples

- AI Checklist
- Recommendation Report
- Application Summary
- Welfare Timeline

---

# 49. Document Version Entity

## Purpose

Maintains document history.

Replacing a document shall not overwrite previous versions.

---

## Table

```text
document_versions
```

---

## Fields

| Field | Type |
|--------|------|
| id | UUID |
| document_id | UUID |
| version_number | INTEGER |
| storage_path | TEXT |
| replaced_at | TIMESTAMP |
| created_at | TIMESTAMP |

---

Previous versions remain available for auditing.

---

# 50. File Metadata Entity

## Purpose

Stores additional metadata associated with uploaded files.

---

## Table

```text
file_metadata
```

---

## Fields

| Field | Type |
|--------|------|
| id | UUID |
| document_id | UUID |
| width | INTEGER |
| height | INTEGER |
| page_count | INTEGER |
| checksum | VARCHAR |
| hash_algorithm | VARCHAR |
| created_at | TIMESTAMP |

---

This metadata supports validation and integrity verification.

---

# 51. Document Lifecycle

Every uploaded document follows the same lifecycle.

```text
Upload

↓

Storage

↓

OCR Queue

↓

OCR Processing

↓

Field Extraction

↓

Citizen Verification

↓

Profile Update

↓

Recommendation Refresh

↓

Timeline Update
```

Each stage generates domain events consumed by downstream services.

---

# 52. Relationships

```text
Citizen Profile

│

└──────── Documents

              │

      ┌───────┼────────────┐

      ▼       ▼            ▼

 OCR Job   OCR Result   Versions

              │

              ▼

        Extracted Fields

              │

              ▼

      Verification Records

              │

              ▼

    Recommendation Engine
```

---

# 53. Index Strategy

Recommended indexes:

```text
documents.profile_id

documents.document_type_id

documents.verification_status

ocr_jobs.document_id

ocr_jobs.status

ocr_results.document_id

ocr_fields.ocr_result_id

document_verifications.document_id

document_versions.document_id
```

---

# 54. Constraints

The following constraints apply:

- Every Document belongs to one Citizen Profile.
- Every OCR Job references one Document.
- Every OCR Result references one Document.
- Every OCR Field belongs to one OCR Result.
- Every Verification references one Document.
- Every Version references one Document.
- Generated PDFs belong to one Citizen Profile.
- Deleted documents retain historical versions unless explicitly purged.

---

# 55. Phase Summary

The Document Management Data Model provides a secure and auditable framework for storing, processing, and verifying citizen documents.

By separating uploaded files, OCR jobs, extracted fields, verification records, generated PDFs, and version history into dedicated entities, the platform maintains traceability, integrity, and scalability while ensuring that only verified document data influences the Recommendation Engine.

---

# End of Phase 4

**Next Phase:**

AI & Citizen Activity Data Model

- AI Conversations
- AI Messages
- Prompt Metadata
- Welfare Timeline
- Timeline Events
- Notifications
- Application Tracker
- Activity Logs
- AI Memory
- Conversation Relationships
```
# Phase 5 – AI, Timeline & Citizen Activity Data Model

---

# 56. AI Domain Overview

The AI Domain stores all conversational interactions between the citizen and the AI Copilot.

The AI is an explanation layer.

It never determines eligibility or modifies business data directly.

The AI Domain consists of:

- AI Conversations
- AI Messages
- Prompt Metadata
- AI Context Snapshots
- Timeline
- Notifications
- Applications
- Activity History

---

# 57. AI Conversation Entity

## Purpose

Represents a conversation session between a citizen and the AI Copilot.

---

## Table

```text
ai_conversations
```

---

## Fields

| Field | Type |
|--------|------|
| id | UUID |
| profile_id | UUID |
| title | VARCHAR |
| language | VARCHAR |
| status | ENUM |
| started_at | TIMESTAMP |
| last_message_at | TIMESTAMP |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Status

- Active
- Archived
- Deleted

---

Business Rule

Each conversation belongs to exactly one citizen profile.

---

# 58. AI Message Entity

## Purpose

Stores individual messages exchanged during a conversation.

---

## Table

```text
ai_messages
```

---

## Fields

| Field | Type |
|--------|------|
| id | UUID |
| conversation_id | UUID |
| sender | ENUM |
| message | TEXT |
| model | VARCHAR |
| response_time_ms | INTEGER |
| token_count | INTEGER |
| created_at | TIMESTAMP |

---

## Sender

- User
- Assistant
- System

---

Business Rule

Messages are immutable after creation.

---

# 59. AI Prompt Metadata Entity

## Purpose

Stores metadata related to prompt generation.

The full prompt is not stored permanently unless required for auditing.

---

## Table

```text
ai_prompt_metadata
```

---

## Fields

| Field | Type |
|--------|------|
| id | UUID |
| conversation_id | UUID |
| context_version | INTEGER |
| profile_snapshot_id | UUID |
| recommendation_snapshot_id | UUID |
| prompt_hash | VARCHAR |
| model_name | VARCHAR |
| created_at | TIMESTAMP |

---

This allows reproducibility without storing sensitive prompt contents.

---

# 60. AI Context Snapshot Entity

## Purpose

Captures the business context used by AI at the time of a response.

---

## Table

```text
ai_context_snapshots
```

---

## Fields

| Field | Type |
|--------|------|
| id | UUID |
| profile_id | UUID |
| recommendation_snapshot | JSONB |
| document_snapshot | JSONB |
| timeline_snapshot | JSONB |
| created_at | TIMESTAMP |

---

Snapshots ensure AI responses remain explainable even after profile changes.

---

# 61. Welfare Timeline Entity

## Purpose

Represents the personalized welfare journey.

---

## Table

```text
timelines
```

---

## Fields

| Field | Type |
|--------|------|
| id | UUID |
| profile_id | UUID |
| generated_at | TIMESTAMP |
| version | INTEGER |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

Timeline regeneration occurs after:

- Profile updates
- Document verification
- Recommendation refresh

---

# 62. Timeline Event Entity

## Purpose

Stores milestones displayed on the citizen timeline.

---

## Table

```text
timeline_events
```

---

## Fields

| Field | Type |
|--------|------|
| id | UUID |
| timeline_id | UUID |
| event_type | ENUM |
| title | VARCHAR |
| description | TEXT |
| status | ENUM |
| due_date | DATE |
| completed_at | TIMESTAMP |
| display_order | INTEGER |
| created_at | TIMESTAMP |

---

## Status

- Pending
- Completed
- Missed
- Suggested

---

Examples

- Complete Profile
- Upload Income Certificate
- Eligible for Scholarship
- Submit Application

---

# 63. Notification Entity

## Purpose

Stores notifications generated by business events.

---

## Table

```text
notifications
```

---

## Fields

| Field | Type |
|--------|------|
| id | UUID |
| profile_id | UUID |
| notification_type | ENUM |
| title | VARCHAR |
| message | TEXT |
| is_read | BOOLEAN |
| created_at | TIMESTAMP |
| read_at | TIMESTAMP |

---

## Types

- Recommendation
- OCR
- Timeline
- Application
- Reminder
- System

---

Notifications are delivered through WebSockets.

---

# 64. Application Entity

## Purpose

Tracks external government scheme applications.

---

## Table

```text
applications
```

---

## Fields

| Field | Type |
|--------|------|
| id | UUID |
| profile_id | UUID |
| scheme_id | UUID |
| application_number | VARCHAR |
| status | ENUM |
| submitted_at | TIMESTAMP |
| last_updated_at | TIMESTAMP |
| official_reference | VARCHAR |
| notes | TEXT |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Status

- Draft
- Submitted
- Under Review
- Approved
- Rejected
- Closed

---

BenefitOS records application progress but does not submit applications on behalf of citizens.

---

# 65. Application Status History Entity

## Purpose

Maintains the complete lifecycle of an application.

---

## Table

```text
application_status_history
```

---

## Fields

| Field | Type |
|--------|------|
| id | UUID |
| application_id | UUID |
| previous_status | ENUM |
| current_status | ENUM |
| remarks | TEXT |
| changed_at | TIMESTAMP |

---

Historical records are immutable.

---

# 66. Activity Log Entity

## Purpose

Captures significant user actions across the platform.

---

## Table

```text
activity_logs
```

---

## Fields

| Field | Type |
|--------|------|
| id | UUID |
| profile_id | UUID |
| activity_type | VARCHAR |
| entity_name | VARCHAR |
| entity_id | UUID |
| metadata | JSONB |
| created_at | TIMESTAMP |

---

Examples

- Logged In
- Uploaded Document
- OCR Completed
- Recommendation Generated
- AI Conversation Started
- Timeline Regenerated

---

# 67. Relationship Diagram

```text
Citizen Profile

│

├──────── AI Conversations

│             │

│             ├──────── AI Messages

│             ├──────── Prompt Metadata

│             └──────── Context Snapshots

│

├──────── Timeline

│             │

│             └──────── Timeline Events

│

├──────── Notifications

│

├──────── Applications

│             │

│             └──────── Status History

│

└──────── Activity Logs
```

---

# 68. Index Strategy

Recommended indexes:

```text
ai_conversations.profile_id

ai_messages.conversation_id

timeline_events.timeline_id

notifications.profile_id

notifications.is_read

applications.profile_id

applications.scheme_id

activity_logs.profile_id

application_status_history.application_id
```

---

# 69. Constraints

The following constraints apply:

- Every AI Conversation belongs to one Citizen Profile.
- Every AI Message belongs to one Conversation.
- Every Timeline belongs to one Citizen Profile.
- Every Timeline Event belongs to one Timeline.
- Every Notification belongs to one Citizen Profile.
- Every Application belongs to one Citizen Profile.
- Every Status History record belongs to one Application.
- AI Messages and Application Status History records are immutable.

---

# 70. Phase Summary

The AI, Timeline, and Citizen Activity Data Model establishes the conversational, operational, and historical backbone of the BenefitOS Platform.

AI conversations, timeline events, notifications, application tracking, and activity logs are modeled as independent yet connected entities, providing complete traceability, explainability, and personalization while preserving deterministic business logic.

The resulting architecture supports long-term conversation history, real-time synchronization, transparent application tracking, and a continuously evolving Citizen Digital Twin.

---

# End of Phase 5

**Next Phase:**

Infrastructure Data Model

- Redis Data Structures
- BullMQ Queue Metadata
- Cache Keys
- Pub/Sub Channels
- Session Cache
- Rate Limiter Storage
- Background Job Metadata
- Event Store
- Distributed Locking
- Infrastructure Relationships
# Phase 6 – Infrastructure Data Model

---

# 71. Infrastructure Data Overview

The Infrastructure Data Layer supports the operational behavior of the BenefitOS Platform.

Unlike PostgreSQL, infrastructure data is temporary, operational, and performance-oriented.

It is responsible for:

- Distributed caching
- Queue management
- Pub/Sub messaging
- Session caching
- Rate limiting
- Distributed locking
- Background job tracking
- Temporary AI context
- Health monitoring

Infrastructure data shall never become the authoritative source of business information.

---

# 72. Redis Architecture

Redis serves as the platform's distributed in-memory infrastructure.

Responsibilities include:

- Cache
- Pub/Sub
- BullMQ Backend
- Rate Limiting
- Temporary Sessions
- Distributed Locks

Redis data is considered disposable.

Persistent recovery depends on PostgreSQL.

---

# 73. Cache Data Model

The platform maintains multiple cache namespaces.

---

## Citizen Cache

```text
citizen:{profileId}
```

Contains:

- Profile Summary
- Completion Percentage
- Dashboard Snapshot

TTL

```
10 minutes
```

---

## Recommendation Cache

```text
recommendation:{profileId}
```

Contains

- Recommendation Summary
- Recommendation Cards
- Dashboard Statistics

TTL

```
5 minutes
```

Automatically invalidated after profile or document changes.

---

## Scheme Cache

```text
scheme:{schemeId}
```

Stores

- Scheme Details
- Eligibility Metadata

TTL

```
1 hour
```

---

## Timeline Cache

```text
timeline:{profileId}
```

Stores

- Timeline Preview
- Pending Actions

TTL

```
10 minutes
```

---

## Dashboard Cache

```text
dashboard:{profileId}
```

Contains aggregated dashboard widgets.

TTL

```
2 minutes
```

---

# 74. BullMQ Queue Data

BullMQ manages asynchronous workloads.

Each queue represents an independent processing pipeline.

---

## OCR Queue

```text
ocr_queue
```

Processes:

- OCR Extraction
- Field Detection
- Confidence Calculation

---

## Recommendation Queue

```text
recommendation_queue
```

Processes:

- Eligibility Refresh
- Recommendation Generation

---

## Timeline Queue

```text
timeline_queue
```

Processes:

- Timeline Regeneration

---

## Notification Queue

```text
notification_queue
```

Processes:

- Notification Fan-Out
- WebSocket Broadcast

---

## AI Queue

```text
ai_queue
```

Processes:

- AI Context Construction
- Prompt Preparation
- Streaming Coordination

---

## PDF Queue

```text
pdf_queue
```

Processes:

- Checklist Generation
- Recommendation Reports
- Timeline PDFs

---

# 75. Queue Metadata

Each BullMQ job contains metadata.

```text
Job ID

↓

Queue Name

↓

Priority

↓

Attempts

↓

Status

↓

Progress

↓

Started At

↓

Completed At

↓

Failure Reason
```

Job metadata shall not be permanently stored after retention policies expire unless required for auditing.

---

# 76. Redis Pub/Sub Channels

Distributed communication occurs through Redis Pub/Sub.

---

## Channels

```text
profile.updated

recommendation.updated

timeline.updated

notification.created

ocr.completed

ocr.failed

application.updated

ai.completed

system.maintenance
```

Channel names follow:

```text
domain.action
```

---

# 77. WebSocket Event Mapping

Each Pub/Sub event maps directly to a WebSocket event.

```text
Redis Pub/Sub

↓

Socket Gateway

↓

User Room

↓

Connected Browser
```

Example

```text
recommendation.updated

↓

Socket.IO

↓

user:9d28...

↓

Dashboard Updated
```

---

# 78. Session Cache

Redis stores temporary session metadata.

```text
session:{userId}:{sessionId}
```

Contains:

- Login Time
- Device
- IP Address
- Last Activity

TTL equals session expiration.

Authentication remains managed by Supabase.

---

# 79. Rate Limiter Storage

Rate limiting uses Redis counters.

Examples

```text
login:{ip}

ai:{profileId}

ocr:{profileId}

upload:{profileId}
```

Counters automatically expire.

---

# 80. Distributed Locking

Certain operations require distributed locks.

Examples:

- Recommendation Refresh
- Timeline Regeneration
- OCR Processing

Lock format

```text
lock:{resourceId}
```

Lock expiration prevents deadlocks.

---

# 81. Event Store

The platform maintains temporary event metadata.

Events include:

- Recommendation Generated
- Profile Updated
- OCR Completed
- Notification Created
- Timeline Regenerated

Events are processed and discarded after successful delivery unless auditing requires persistence.

---

# 82. Health Metadata

Infrastructure health information includes:

- Queue Length
- Redis Memory
- Worker Status
- Active Connections
- Cache Hit Rate

These metrics support monitoring and alerting.

---

# 83. Infrastructure Relationships

```text
REST API

│

├──────── Redis Cache

├──────── BullMQ

├──────── Pub/Sub

└──────── WebSocket Gateway

                │

                ▼

        Connected Clients
```

Infrastructure services support business modules without becoming business data owners.

---

# 84. Expiration Policies

Infrastructure data shall define explicit expiration.

| Data | TTL |
|------|------|
| Dashboard Cache | 2 Minutes |
| Recommendation Cache | 5 Minutes |
| Timeline Cache | 10 Minutes |
| Citizen Cache | 10 Minutes |
| Scheme Cache | 1 Hour |
| Session Cache | Session Lifetime |
| Rate Limit Counters | Configurable |
| Distributed Locks | 30 Seconds |
| Pub/Sub Events | Immediate |

Expired infrastructure data may be recreated from PostgreSQL.

---

# 85. Failure Recovery

If Redis becomes unavailable:

- REST APIs continue using PostgreSQL.
- Recommendation generation continues.
- OCR jobs remain queued until Redis recovers.
- WebSocket synchronization pauses.
- Cache is rebuilt after recovery.

The platform shall degrade gracefully without data loss.

---

# 86. Infrastructure Summary

The Infrastructure Data Model provides the operational backbone of the BenefitOS Platform through Redis, BullMQ, distributed caching, Pub/Sub messaging, session storage, and temporary metadata.

By separating infrastructure data from persistent business data, the platform achieves high performance, horizontal scalability, real-time synchronization, and resilient background processing while preserving PostgreSQL as the single source of truth.

---

# End of Phase 6

**Next Phase:**

Database Engineering

- Index Strategy
- Constraints
- Foreign Keys
- Transactions
- Soft Deletes
- Versioning
- Audit Logging
- Partitioning
- Performance Optimization
- Query Design
- Migration Strategy
```
# Phase 7 – Database Engineering

---

# 87. Database Engineering Principles

The BenefitOS database shall follow engineering practices that ensure:

- Strong consistency
- High performance
- Scalability
- Reliability
- Maintainability
- Auditability

Every schema change shall preserve backward compatibility whenever practical.

---

# 88. Primary Key Strategy

Every business entity shall use UUID version 7 (UUIDv7) as its primary key.

Advantages include:

- Globally unique identifiers
- Better insertion locality than random UUIDs
- Easier distributed system support
- No database sequence dependency

Example

```text
id UUID PRIMARY KEY
```

---

# 89. Foreign Key Strategy

Every relationship shall be enforced through foreign keys.

Example

```text
recommendations.profile_id

↓

citizen_profiles.id
```

Foreign keys shall never be optional unless the relationship itself is optional.

---

# 90. Constraints

Every table shall enforce appropriate constraints.

Examples include:

Unique Constraints

- users.email
- government_schemes.scheme_code
- document_types.code

Check Constraints

- annual_income >= 0
- disability_percentage BETWEEN 0 AND 100
- profile_completion BETWEEN 0 AND 100

Not Null Constraints

Applied to all mandatory business fields.

---

# 91. Index Strategy

Indexes shall be created based on query patterns rather than assumptions.

---

## Primary Indexes

Automatically created for:

- Primary Keys
- Unique Constraints

---

## Secondary Indexes

Examples:

```text
citizen_profiles.user_id

documents.profile_id

recommendations.profile_id

government_schemes.category_id

applications.profile_id

notifications.profile_id

timeline_events.timeline_id
```

---

## Composite Indexes

Used for frequently combined filters.

Examples:

```text
recommendations(profile_id, recommendation_status)

documents(profile_id, verification_status)

applications(profile_id, status)

notifications(profile_id, is_read)
```

---

## Full-Text Search Indexes

The following fields shall support full-text search:

- Scheme Name
- Scheme Description
- Ministry
- AI Conversation Titles

PostgreSQL Full-Text Search shall be preferred over custom implementations.

---

# 92. Transaction Strategy

Critical business operations shall execute inside database transactions.

Examples include:

- User Registration
- Document Verification
- Recommendation Refresh
- Timeline Regeneration
- Account Deletion

---

## Transaction Flow

```text
Begin Transaction

↓

Validate

↓

Insert / Update

↓

Publish Domain Event

↓

Commit

↓

Queue Background Jobs
```

Events shall only be published after a successful transaction commit.

---

# 93. Soft Delete Strategy

Certain entities shall support soft deletion.

Fields:

```text
deleted_at TIMESTAMP NULL
```

Entities using soft deletes:

- Users
- Citizen Profiles
- Documents
- AI Conversations
- Applications

Lookup queries shall exclude soft-deleted records by default.

---

# 94. Versioning Strategy

Versioning shall preserve historical data.

Versioned entities include:

- Documents
- Recommendations
- Timelines
- OCR Results
- Generated PDFs

Version numbers shall increase monotonically.

Previous versions remain immutable.

---

# 95. Audit Logging

Critical operations shall generate audit records.

Audit events include:

- Login
- Logout
- Profile Updates
- Document Upload
- OCR Verification
- Recommendation Generation
- AI Conversation
- Settings Changes
- Account Deletion

---

## Audit Table

```text
audit_logs
```

---

## Fields

| Field | Type |
|--------|------|
| id | UUID |
| actor_id | UUID |
| entity_name | VARCHAR |
| entity_id | UUID |
| action | VARCHAR |
| metadata | JSONB |
| ip_address | VARCHAR |
| created_at | TIMESTAMP |

---

Audit logs are immutable.

---

# 96. Data Integrity Rules

The database shall guarantee:

- Referential integrity
- No orphan records
- Valid foreign keys
- Mandatory field validation
- Consistent timestamps

Invalid states shall not be representable.

---

# 97. Query Optimization

Query optimization guidelines include:

- Select only required columns.
- Avoid N+1 queries.
- Use pagination.
- Prefer indexed filters.
- Batch related lookups.
- Avoid unnecessary joins.

Performance shall be measured before optimization.

---

# 98. Pagination Strategy

Large datasets shall never be fully loaded.

Preferred pagination method:

Cursor-based pagination.

Examples:

- AI Conversations
- Notifications
- Timeline Events
- Applications
- Activity Logs

Offset pagination may be used only where ordering is stable and datasets are small.

---

# 99. Migration Strategy

Schema changes shall be managed exclusively through Prisma Migrations.

Migration rules:

- Never edit applied migrations.
- One logical change per migration.
- Test migrations in staging.
- Review destructive changes.
- Backup production before deployment.

---

## Migration Flow

```text
Schema Change

↓

Prisma Migration

↓

Code Review

↓

Staging

↓

Production
```

---

# 100. Seed Strategy

Development and testing environments shall use deterministic seed data.

Seed categories:

- Government Schemes
- Scheme Categories
- Demo Users
- Demo Recommendations
- Document Types
- Notification Templates

Production environments shall never use development seed data.

---

# 101. Performance Monitoring

Database metrics shall include:

- Query latency
- Slow queries
- Index usage
- Connection pool utilization
- Lock contention
- Transaction duration

Slow queries shall be reviewed and optimized.

---

# 102. Backup & Recovery Validation

Backups shall be verified regularly.

Validation includes:

- Restore testing
- Integrity verification
- Migration compatibility
- Recovery time measurement

Backups that cannot be restored are considered failed backups.

---

# 103. Database Testing

Database testing shall include:

- Migration testing
- Repository testing
- Transaction testing
- Constraint validation
- Index verification
- Query performance testing

Every production release shall include database regression testing.

---

# 104. Engineering Summary

The BenefitOS Database Engineering standards establish the operational rules that ensure the platform's data layer remains reliable, performant, and maintainable.

By enforcing strong constraints, optimized indexing, transactional integrity, immutable audit logs, controlled migrations, and continuous performance monitoring, the database architecture provides a robust foundation for long-term platform evolution.

---

# End of Phase 7

**Next Phase:**

Database Governance

- Backup Strategy
- Disaster Recovery
- Naming Standards
- Prisma Conventions
- Data Retention
- Privacy Rules
- Compliance
- Complete Entity Relationship Diagram
- Final Database Summary
- End of Document
# Phase 8 – Database Governance & Final Database Design

---

# 105. Database Governance

## Overview

Database governance defines the standards, controls, and operational policies that ensure the BenefitOS data layer remains secure, maintainable, auditable, and consistent throughout the lifetime of the platform.

Every schema modification shall comply with this document.

---

# 106. Naming Standards

The following naming conventions shall be followed consistently.

---

## Tables

Format

```text
snake_case (plural)
```

Examples

```text
users

citizen_profiles

government_schemes

recommendations

documents

timeline_events
```

---

## Columns

Format

```text
snake_case
```

Examples

```text
first_name

annual_income

created_at

updated_at
```

---

## Primary Keys

Every table shall use

```text
id
```

---

## Foreign Keys

Format

```text
<entity>_id
```

Examples

```text
profile_id

scheme_id

document_id

recommendation_id
```

---

## Indexes

Format

```text
idx_<table>_<column>
```

Examples

```text
idx_users_email

idx_documents_profile_id

idx_recommendations_status
```

---

## Unique Constraints

Format

```text
uq_<table>_<column>
```

---

## Foreign Keys

Format

```text
fk_<table>_<referenced_table>
```

---

# 107. Prisma Standards

Prisma is the only supported ORM.

Rules

- Every table shall have a corresponding Prisma model.
- Every migration shall be generated through Prisma.
- Raw SQL should be avoided unless justified by measurable performance improvements.
- Prisma Client shall be regenerated after every schema change.

Relationships shall be explicitly defined using Prisma relation fields.

---

# 108. Migration Governance

Schema evolution shall follow a controlled migration process.

Workflow

```text
Schema Change

↓

Prisma Migration

↓

Code Review

↓

Staging Deployment

↓

Validation

↓

Production Deployment
```

Rules

- Never modify an applied migration.
- Never manually edit production schemas.
- Every migration shall have a clear purpose.
- Destructive changes require a backup and approval.

---

# 109. Data Retention Policy

Different categories of data have different retention requirements.

| Data Type | Retention |
|-----------|-----------|
| User Profile | Until account deletion |
| Documents | Until deletion request or legal requirement |
| OCR Results | Until associated document is removed |
| AI Conversations | Until deleted by user |
| Recommendations | Historical records retained |
| Notifications | Configurable |
| Audit Logs | Minimum 1 year |
| Queue Metadata | Temporary |
| Cache | Temporary |

Expired infrastructure data shall be removed automatically.

---

# 110. Privacy Rules

BenefitOS follows privacy-by-design principles.

Requirements

- Collect only necessary information.
- Store only required personal data.
- Use private object storage.
- Encrypt data in transit.
- Respect user ownership.
- Support account deletion.
- Support data export.

Personally identifiable information shall never be shared with unauthorized services.

---

# 111. Backup Strategy

Production databases shall implement:

- Daily automated backups
- Point-in-Time Recovery (PITR)
- Encrypted backup storage
- Backup verification
- Geographic redundancy where supported

Backup procedures shall be documented and tested.

---

# 112. Disaster Recovery

Recovery plans shall exist for:

- Database corruption
- Accidental deletion
- Failed migration
- Storage failure
- Redis failure

Recovery objectives

| Metric | Target |
|---------|--------|
| Recovery Time Objective (RTO) | < 2 Hours |
| Recovery Point Objective (RPO) | < 15 Minutes |

---

# 113. Compliance & Privacy

The database design aligns with widely accepted engineering and security practices.

Objectives

- Privacy by Design
- Secure Storage
- Auditability
- Data Minimization
- Least Privilege Access

Future regulatory requirements may extend these controls.

---

# 114. Complete Entity Relationship Diagram

```text
Users
 │
 ├──────── Citizen Profiles
 │               │
 │               ├──────── Addresses
 │               ├──────── Educations
 │               ├──────── Employments
 │               ├──────── Families
 │               ├──────── Preferences
 │               │
 │               ├──────── Documents
 │               │          │
 │               │          ├──────── OCR Jobs
 │               │          ├──────── OCR Results
 │               │          ├──────── OCR Fields
 │               │          ├──────── Verification Records
 │               │          └──────── Document Versions
 │               │
 │               ├──────── Recommendations
 │               │          │
 │               │          ├──────── Missing Requirements
 │               │          ├──────── Benefit Estimates
 │               │          └──────── Recommendation History
 │               │
 │               ├──────── AI Conversations
 │               │          │
 │               │          ├──────── AI Messages
 │               │          ├──────── Prompt Metadata
 │               │          └──────── Context Snapshots
 │               │
 │               ├──────── Timeline
 │               │          │
 │               │          └──────── Timeline Events
 │               │
 │               ├──────── Applications
 │               │          │
 │               │          └──────── Status History
 │               │
 │               ├──────── Notifications
 │               │
 │               └──────── Activity Logs
 │
 ├──────── Devices
 │
 └──────── Sessions


Government Schemes
 │
 ├──────── Scheme Categories
 │
 ├──────── Eligibility Rules
 │
 └──────── Required Documents
```

---

# 115. Database Lifecycle

Every schema change shall follow the lifecycle below.

```text
Requirement

↓

Data Model

↓

Architecture Review

↓

Prisma Schema

↓

Migration

↓

Testing

↓

Deployment

↓

Monitoring

↓

Documentation Update
```

Documentation shall always be updated alongside schema changes.

---

# 116. Database Review Checklist

Before merging database changes, verify:

Schema

□ Naming standards followed

□ Relationships validated

□ Constraints defined

□ Indexes reviewed

Performance

□ Query performance reviewed

□ New indexes evaluated

□ Pagination considered

Security

□ RLS policies updated

□ Sensitive fields protected

□ Secrets unaffected

Operations

□ Migration tested

□ Backup verified

□ Rollback plan prepared

Documentation

□ Database Design updated

□ Prisma schema updated

□ API documentation updated (if required)

---

# 117. Database Summary

The BenefitOS Database Design provides a comprehensive, production-ready blueprint for managing all persistent, operational, and infrastructure data within the platform.

The architecture combines:

- PostgreSQL as the authoritative source of truth
- Prisma ORM for type-safe data access
- Redis for distributed caching and messaging
- Supabase Storage for secure file management
- BullMQ for background processing
- Strong relational integrity
- Controlled schema evolution
- Immutable audit trails
- Privacy-first data management

This design supports deterministic recommendation generation, AI-assisted guidance, secure document management, real-time synchronization, and scalable platform growth while maintaining high standards of security, reliability, and maintainability.

Every database implementation, migration, and optimization shall conform to the principles defined in this document.

---

# End of Document

**Document Status:** Final

**Document Number:** 07

**Document Version:** 2.0.0

**Primary Database:** PostgreSQL (Supabase)

**ORM:** Prisma

**Cache:** Redis

**Object Storage:** Supabase Storage

**Next Document:** 08 – API Specification