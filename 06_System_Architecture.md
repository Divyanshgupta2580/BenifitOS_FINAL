# BenefitOS Platform

---

# 06 - System Architecture

| Field | Value |
|--------|--------|
| Document Title | System Architecture |
| Document Number | 06 |
| Version | 2.0.0 |
| Status | Final |
| Project | BenefitOS Platform |
| Architecture Style | Modular Event-Driven Distributed Architecture |
| Audience | Software Architects, Backend Engineers, Frontend Engineers, DevOps Engineers, QA Engineers, AI Development Agents |
| Purpose | Define the complete production architecture of the BenefitOS Platform |

---

# Table of Contents

1. Introduction
2. Architecture Vision
3. Architecture Goals
4. Engineering Principles
5. Quality Attributes
6. High-Level Architecture
7. Technology Stack
8. Architectural Styles
9. System Context
10. High-Level Component Architecture
11. Layered Architecture
12. Request Lifecycle
13. Architecture Summary

---

# 1. Introduction

The BenefitOS Platform is designed as a modern, scalable, production-grade digital welfare platform that enables citizens to discover, understand, prepare for, and track government welfare schemes.

The architecture prioritizes:

- Maintainability
- Scalability
- Security
- Performance
- Reliability
- Explainability
- Accessibility

Unlike traditional monolithic applications, BenefitOS adopts a modular, event-driven architecture that separates business domains while enabling real-time communication and asynchronous processing.

Every architectural decision is intended to support long-term maintainability and horizontal scalability.

---

# 2. Architecture Vision

BenefitOS shall become a platform capable of serving millions of citizens while maintaining:

- Fast response times
- High availability
- Explainable business logic
- Real-time synchronization
- Strong security
- Operational simplicity

The architecture shall allow independent evolution of business modules without requiring large-scale system rewrites.

---

# 3. Architecture Goals

The architecture is designed to achieve the following objectives.

## Scalability

Support horizontal scaling of frontend, backend, WebSocket gateways, and background workers.

---

## Reliability

Ensure that failures in one subsystem do not affect unrelated functionality.

---

## Performance

Provide responsive interfaces while minimizing unnecessary network requests.

---

## Security

Protect citizen information through secure authentication, authorization, encryption, and private storage.

---

## Maintainability

Encourage modular development through well-defined boundaries and separation of concerns.

---

## Extensibility

Support future capabilities without requiring architectural redesign.

---

## Observability

Provide comprehensive monitoring, structured logging, distributed tracing, and health reporting.

---

# 4. Engineering Principles

BenefitOS follows the following engineering principles.

## Citizen First

Every engineering decision should improve the citizen experience.

---

## Clean Architecture

Business logic remains independent of frameworks.

---

## SOLID Principles

Every module follows SOLID design principles.

---

## Single Responsibility

Each service, component, and module performs one responsibility.

---

## Separation of Concerns

Presentation, business logic, infrastructure, and persistence remain isolated.

---

## Event-Driven Design

Meaningful business events are published and consumed asynchronously where appropriate.

---

## API First

All business capabilities are exposed through well-defined APIs.

---

## Real-Time by Necessity

WebSockets are used only where they improve user experience.

REST remains the primary communication mechanism.

---

## Documentation Driven Development

Architecture and implementation remain synchronized throughout the project lifecycle.

---

# 5. Quality Attributes

The architecture prioritizes the following quality attributes.

| Attribute | Priority |
|-----------|----------|
| Security | Critical |
| Reliability | Critical |
| Maintainability | Critical |
| Performance | High |
| Scalability | High |
| Accessibility | High |
| Observability | High |
| Availability | High |
| Testability | High |
| Extensibility | Medium |

Every architectural decision shall support one or more of these quality attributes.

---

# 6. High-Level Architecture

BenefitOS consists of multiple independently evolving layers.

```text
                        Citizen

                           │

                           ▼

                Next.js Web Application

              REST API + WebSocket Client

                           │

            ┌──────────────┴──────────────┐

            ▼                             ▼

       REST Gateway                 Socket.IO Gateway

                    NestJS Application

                           │

     ┌──────────┬──────────┬──────────┬──────────┐

     ▼          ▼          ▼          ▼

 Domain     Recommendation   OCR       AI

 Modules       Engine       Module    Module

     │          │          │          │

     └──────────┴──────────┴──────────┘

                    Domain Event Bus

                           │

         ┌─────────────────┼─────────────────┐

         ▼                 ▼                 ▼

      Redis            BullMQ Workers     Notifications

         │

         ▼

 PostgreSQL + Supabase Storage

```

The architecture separates synchronous and asynchronous responsibilities while maintaining a single source of truth for business data.

---

# 7. Technology Stack

## Frontend

| Technology | Purpose |
|------------|---------|
| Next.js 15 | Frontend Framework |
| React 19 | UI Framework |
| TypeScript | Type Safety |
| Tailwind CSS | Styling |
| shadcn/ui | UI Components |
| Zustand | Client State |
| TanStack Query | Server State |
| React Hook Form | Forms |
| Zod | Validation |

---

## Backend

| Technology | Purpose |
|------------|---------|
| NestJS | Backend Framework |
| TypeScript | Language |
| Prisma | ORM |
| PostgreSQL | Primary Database |
| Redis | Cache & Pub/Sub |
| BullMQ | Background Jobs |
| Socket.IO | Real-Time Communication |

---

## AI

| Technology | Purpose |
|------------|---------|
| Google Gemini | Conversational AI |
| Gemini Vision | OCR |
| Sarvam AI | Speech-to-Text |

---

## Infrastructure

| Technology | Purpose |
|------------|---------|
| Turborepo | Monorepo Build System |
| pnpm | Package Management |
| GitHub Actions | CI/CD |
| Vercel | Frontend Hosting |
| Railway | Backend Hosting |
| Supabase | Database, Auth & Storage |

---

## Monitoring

| Technology | Purpose |
|------------|---------|
| Better Stack | Log Management |
| Sentry | Error Tracking |
| OpenTelemetry | Distributed Tracing |
| Prisma Metrics | Database Monitoring |

---

# 8. Architectural Styles

BenefitOS combines multiple architectural styles.

## Modular Monolith

Business domains are separated into independent modules while remaining within a single deployable backend application.

---

## Event-Driven Architecture

Modules communicate using domain events rather than direct coupling whenever asynchronous processing is appropriate.

---

## Layered Architecture

Presentation

↓

Application

↓

Domain

↓

Infrastructure

↓

Persistence

---

## Repository Pattern

Repositories encapsulate persistence logic.

---

## Service Layer Pattern

Business logic exists only inside services.

---

## Dependency Injection

All modules communicate through dependency injection.

---

## CQRS-lite

Read-heavy and write-heavy operations are logically separated without introducing full CQRS complexity.

---

# 9. System Context

The BenefitOS Platform interacts with several external systems.

```text
                Citizen

                    │

                    ▼

               BenefitOS

        ┌────────┼────────┐

        ▼        ▼        ▼

   Supabase   Gemini   Sarvam AI

        │

        ▼

 Government Scheme Information

```

BenefitOS owns its business logic while integrating with external providers for authentication, storage, AI, and speech recognition.

---

# 10. High-Level Component Architecture

The system is composed of the following major components.

Frontend

- User Interface
- State Management
- API Client
- WebSocket Client

Backend

- Authentication Module
- Citizen Profile Module
- Recommendation Engine
- OCR Module
- AI Module
- Timeline Module
- Notification Module
- Settings Module

Infrastructure

- PostgreSQL
- Redis
- BullMQ
- Supabase Storage

External Services

- Gemini
- Sarvam AI

Each component owns its own business responsibilities and communicates through well-defined interfaces.

---

# 11. Layered Architecture

```text
Presentation Layer

↓

Application Layer

↓

Domain Layer

↓

Infrastructure Layer

↓

Persistence Layer
```

Responsibilities

Presentation

- UI Rendering
- User Interaction

Application

- Request Coordination
- Validation

Domain

- Business Rules
- Recommendation Logic

Infrastructure

- External Services
- Cache
- Queue

Persistence

- Database
- Storage

Dependencies always flow downward.

Circular dependencies are prohibited.

---

# 12. Request Lifecycle

Every user request follows the same architectural pipeline.

```text
Citizen

↓

Next.js

↓

REST API

↓

NestJS Controller

↓

Service

↓

Repository

↓

Prisma

↓

PostgreSQL

↓

Response

↓

TanStack Query

↓

UI Update
```

If the request generates a background task:

```text
Service

↓

Publish Domain Event

↓

BullMQ Queue

↓

Worker

↓

Database

↓

Socket.IO Event

↓

Connected Clients
```

---

# 13. Architecture Summary

BenefitOS is designed as a modular, event-driven, production-grade platform that combines synchronous REST APIs with asynchronous processing and real-time communication.

The architecture emphasizes:

- Strong separation of concerns
- Deterministic business logic
- Explainable AI
- Horizontal scalability
- Secure infrastructure
- Operational observability
- Long-term maintainability

This document serves as the architectural foundation for all implementation, deployment, and operational decisions throughout the BenefitOS lifecycle.

---

# End of Phase 1

**Next Phase:**
- Frontend Architecture
- Backend Architecture
- Module Architecture
- Recommendation Engine Architecture
- AI Architecture
- OCR Architecture
- Timeline Architecture
- Notification Architecture
# Phase 2 – Core System Architecture

---

# 14. Frontend Architecture

## Overview

The frontend is responsible for providing a fast, responsive, accessible, and real-time user experience.

The frontend shall remain stateless.

Business logic shall never exist inside React components.

The frontend communicates with the backend through:

- REST APIs
- WebSockets

---

## Frontend Architecture

```text
                    Browser

                        │

                        ▼

                 Next.js App Router

                        │

        ┌───────────────┼───────────────┐

        ▼               ▼               ▼

    Pages          Layouts        Middleware

        │

        ▼

      Features

        │

        ▼

   Reusable Components

        │

        ▼

     Custom Hooks

        │

        ▼

     Service Layer

        │

        ▼

 REST Client + WebSocket Client

```

---

## Frontend Responsibilities

- UI Rendering
- Form Validation
- State Management
- API Communication
- WebSocket Synchronization
- Authentication
- File Upload
- AI Streaming Display

The frontend never performs business rule evaluation.

---

# 15. Backend Architecture

## Overview

The backend is the central orchestration layer.

Every business rule executes here.

The backend is divided into independent business modules.

---

## Backend Architecture

```text
                 HTTP / WebSocket

                        │

                        ▼

             Controllers / Gateway

                        │

                        ▼

                 Application Services

                        │

        ┌───────────────┼───────────────┐

        ▼               ▼               ▼

 Recommendation      OCR Service     AI Service

        ▼               ▼               ▼

      Repositories   Queue Jobs    External APIs

                ▼

             PostgreSQL

```

---

## Backend Responsibilities

- Authentication
- Authorization
- Recommendation Engine
- AI Coordination
- OCR Coordination
- Notification Generation
- Timeline Generation
- File Validation
- Business Rules
- Event Publication

---

# 16. Domain Architecture

Every business capability belongs to a dedicated domain module.

```text
Authentication

Citizen Profile

Dashboard

Documents

OCR

Recommendations

Timeline

Applications

Notifications

Settings

AI

Health
```

Each domain owns:

- Controller
- Service
- Repository
- DTOs
- Validators
- Interfaces

Modules communicate using events whenever asynchronous processing is required.

---

# 17. Recommendation Engine Architecture

The Recommendation Engine is the most critical business component.

It shall remain completely deterministic.

AI is never responsible for eligibility.

---

## Recommendation Pipeline

```text
Citizen Profile

        │

Verified Documents

        │

Scheme Rules

        │

Recommendation Engine

        │

Eligibility Result

        │

Recommendation Stored

        │

Domain Event

        │

Timeline Refresh

        │

Notification

        │

WebSocket Event

```

---

## Recommendation Categories

The engine produces one of the following states.

- Eligible
- Nearly Eligible
- Future Eligible
- Not Eligible

No additional categories may be introduced without updating the recommendation specification.

---

# 18. AI Architecture

The AI module acts as an explanation layer.

It consumes business outputs.

It never generates them.

---

## AI Pipeline

```text
Citizen Question

        │

Retrieve Citizen Context

        │

Retrieve Recommendation

        │

Prompt Builder

        │

Gemini

        │

Response Parser

        │

Streaming Response

        │

Conversation Store

```

---

## AI Responsibilities

- Explain eligibility
- Compare schemes
- Generate checklists
- Summarize documents
- Draft applications
- Translate responses

---

## AI Restrictions

The AI shall never:

- Determine eligibility
- Modify recommendations
- Invent schemes
- Invent policies
- Modify citizen data

---

# 19. OCR Architecture

OCR processing is asynchronous.

The API immediately accepts uploads.

OCR executes in the background.

---

## OCR Pipeline

```text
Upload

        │

Storage

        │

Queue Job

        │

OCR Worker

        │

Gemini Vision

        │

Field Extraction

        │

Confidence Calculation

        │

Citizen Verification

        │

Persist Data

        │

Recommendation Refresh

```

---

## OCR Responsibilities

- Image Validation
- OCR Extraction
- Confidence Scoring
- Structured Fields
- Verification Workflow

---

# 20. Timeline Architecture

The Welfare Timeline is event-driven.

It never updates itself directly.

---

## Timeline Generation

```text
Profile Updated

        │

Recommendation Updated

        │

Timeline Generator

        │

Timeline Stored

        │

WebSocket Event

        │

UI Updated

```

---

Timeline generation is idempotent.

Repeated executions produce the same result for identical inputs.

---

# 21. Notification Architecture

Notifications originate from domain events.

They are never manually created by UI components.

---

## Notification Flow

```text
Business Event

        │

Notification Service

        │

Notification Database

        │

Socket Event

        │

Connected Client

```

---

Notification types include:

- Recommendation
- Reminder
- OCR
- Application
- System
- Timeline

---

# 22. Authentication Architecture

Authentication responsibilities belong to Supabase Auth.

BenefitOS manages authorization.

---

## Authentication Flow

```text
Citizen

        │

Supabase Authentication

        │

JWT

        │

NestJS Guard

        │

Authorized Request

```

---

## Authorization

Every protected request validates:

- Identity
- Ownership
- Permissions

Authorization checks occur before business logic execution.

---

# 23. Storage Architecture

All uploaded files remain private.

Storage buckets include:

```text
documents

applications

profile-images

generated-pdfs

temporary
```

---

Files are accessed only through signed URLs.

Direct public access is prohibited.

---

# 24. Background Processing Architecture

Long-running operations execute asynchronously.

Examples include:

- OCR
- Recommendation Refresh
- Timeline Generation
- AI Context Refresh
- PDF Generation
- Notification Fan-out

These operations are processed by BullMQ workers.

---

## Worker Architecture

```text
API

        │

BullMQ Queue

        │

Worker

        │

Business Logic

        │

Database

        │

Socket Event

```

---

# 25. Health Monitoring Architecture

Every subsystem exposes health information.

Subsystems include:

- API
- Database
- Redis
- Queue
- Storage
- Gemini
- Sarvam

The aggregated health endpoint provides a unified system status.

---

# 26. Phase Summary

The BenefitOS architecture is divided into specialized modules with clearly defined responsibilities.

Key architectural characteristics include:

- Stateless frontend
- Modular backend
- Deterministic recommendation engine
- AI explanation layer
- Asynchronous OCR processing
- Event-driven timeline generation
- Real-time notifications
- Secure authentication
- Private document storage
- Background job processing

These architectural boundaries ensure maintainability, scalability, and production readiness.

---

# End of Phase 2

**Next Phase:**
Communication Architecture

- REST Architecture
- WebSocket Gateway
- Event Bus
- Redis Pub/Sub
- BullMQ
- Streaming AI
- Queue Communication
- Internal Event Flow
# Phase 3 – Communication Architecture

---

# 27. Communication Architecture

## Overview

BenefitOS uses multiple communication mechanisms, each selected according to the nature of the operation.

The platform intentionally avoids using a single communication protocol for every scenario.

Instead, the following communication patterns are used:

| Communication | Purpose |
|--------------|---------|
| REST | CRUD Operations |
| WebSockets | Real-Time Updates |
| Domain Events | Internal Module Communication |
| Redis Pub/Sub | Distributed Event Synchronization |
| BullMQ | Background Processing |
| Streaming Responses | AI Conversations |

Each communication mechanism has clearly defined responsibilities.

---

# 28. REST API Architecture

REST remains the primary communication protocol.

REST APIs are responsible for request-response operations.

Examples include:

- Authentication
- Profile Management
- Dashboard Loading
- CRUD Operations
- Scheme Search
- File Upload
- Settings
- Initial Page Load

REST APIs shall remain stateless.

---

## REST Request Flow

```text
Browser

↓

HTTP Request

↓

Next.js API Client

↓

NestJS Controller

↓

Validation

↓

Application Service

↓

Repository

↓

Database

↓

JSON Response

↓

TanStack Query Cache

↓

React Components
```

---

## REST Design Principles

Every endpoint shall:

- Be versioned.
- Return JSON.
- Validate input.
- Authenticate requests.
- Return standard response objects.
- Be idempotent where appropriate.

---

# 29. WebSocket Architecture

## Purpose

WebSockets are responsible for pushing updates to connected users.

They eliminate unnecessary polling while keeping the UI synchronized with backend events.

WebSockets are not a replacement for REST APIs.

REST retrieves data.

WebSockets synchronize changes.

---

## WebSocket Flow

```text
Browser

↓

Socket.IO Client

↓

Socket.IO Gateway

↓

Authentication

↓

Room Assignment

↓

Event Subscription

↓

Real-Time Updates
```

---

## Authentication

Every socket connection shall authenticate using JWT.

Unauthenticated connections shall be rejected.

---

## User Rooms

Every authenticated citizen joins a private room.

Example

```
user:<userId>
```

Notifications are broadcast only to the user's room.

---

## Supported Events

The WebSocket Gateway shall support:

```
notification.created

recommendation.updated

profile.updated

timeline.updated

ocr.started

ocr.progress

ocr.completed

ocr.failed

application.updated

ai.streaming

ai.completed

job.progress

system.maintenance
```

Additional events may be introduced following the established naming convention.

---

# 30. Real-Time Synchronization

The frontend shall remain synchronized without requiring manual refreshes.

Examples include:

## Profile Updates

```text
Profile Updated

↓

Database Updated

↓

Domain Event

↓

WebSocket Event

↓

Dashboard Refresh

↓

Profile Screen Refresh

↓

Recommendation Refresh
```

---

## Recommendation Updates

```text
Recommendation Engine

↓

Recommendations Saved

↓

Socket Event

↓

Dashboard Updates

↓

Recommendation Screen Updates
```

---

## OCR Progress

```text
OCR Worker

↓

25%

↓

50%

↓

75%

↓

Completed

↓

WebSocket Events

↓

Progress Indicator Updates
```

---

## AI Streaming

```text
Gemini

↓

Token Stream

↓

Backend Stream

↓

WebSocket

↓

Frontend Streaming

↓

Typing Effect
```

---

# 31. Event-Driven Architecture

BenefitOS follows Domain Event principles.

Business modules communicate through events rather than direct coupling.

---

## Event Lifecycle

```text
Business Action

↓

Domain Event

↓

Event Dispatcher

↓

Subscribers

↓

Business Reactions
```

---

## Event Naming Convention

```
profile.updated

recommendation.generated

ocr.completed

timeline.generated

notification.created

application.status.changed

document.uploaded

document.deleted

settings.updated
```

Event names follow:

```
domain.action
```

---

# 32. Event Bus Architecture

The Event Bus coordinates communication between independent modules.

```text
Recommendation Engine

↓

Event Bus

↓

Timeline

↓

Notification

↓

Analytics

↓

Socket Gateway
```

Benefits

- Loose Coupling
- Independent Modules
- Better Maintainability
- Easier Testing
- Horizontal Scalability

---

# 33. Redis Pub/Sub Architecture

Redis synchronizes events across multiple backend instances.

```text
Instance A

↓

Redis Pub/Sub

↓

Instance B

↓

Instance C

↓

Socket Gateway

↓

Connected Users
```

Redis ensures that users receive updates regardless of which backend instance processed the request.

---

## Redis Responsibilities

- Distributed Cache
- Pub/Sub
- Session Data
- Rate Limiting
- Temporary Storage

Redis is never the primary source of truth.

PostgreSQL remains authoritative.

---

# 34. Queue Architecture

BenefitOS uses BullMQ for asynchronous processing.

Queues prevent long-running operations from blocking API requests.

---

## Queue Flow

```text
REST Request

↓

Application Service

↓

Queue Job

↓

Redis

↓

Worker

↓

Business Logic

↓

Database

↓

Domain Event

↓

Socket Event
```

---

## Queue Types

| Queue | Purpose |
|--------|----------|
| OCR Queue | OCR Processing |
| Recommendation Queue | Eligibility Refresh |
| Timeline Queue | Timeline Generation |
| Notification Queue | Fan-Out |
| AI Queue | AI Processing |
| PDF Queue | PDF Generation |

---

## Retry Strategy

Every queue shall support:

- Automatic Retry
- Exponential Backoff
- Dead Letter Queue
- Failure Logging

---

# 35. AI Streaming Architecture

AI responses shall stream incrementally.

The citizen should never wait for the entire response.

---

## AI Streaming Flow

```text
Citizen Question

↓

Prompt Builder

↓

Gemini

↓

Token Stream

↓

Backend Stream

↓

Socket.IO

↓

Frontend

↓

Incremental Rendering
```

Streaming improves perceived responsiveness.

---

# 36. Cache Architecture

Caching reduces unnecessary database queries.

---

## Cache Levels

### Browser Cache

Static assets.

---

### TanStack Query Cache

API responses.

---

### Redis Cache

Frequently accessed backend data.

Examples:

- Scheme Catalog
- Static Configuration
- Language Packs

---

Cached recommendation results shall be invalidated immediately after profile or document updates.

---

# 37. Communication Security

Every communication channel shall be secured.

REST

- HTTPS
- JWT
- Input Validation

---

WebSockets

- Secure WebSocket (WSS)
- JWT Authentication
- Room Authorization

---

Redis

- Private Network
- Authentication
- TLS in Production

---

BullMQ

- Internal Network Only

---

# 38. Failure Handling

Communication failures shall degrade gracefully.

REST Failure

↓

Retry

↓

Friendly Error

↓

Manual Retry

---

WebSocket Failure

↓

Reconnect

↓

Resubscribe

↓

Resume Updates

---

Redis Failure

↓

Log

↓

Reconnect

↓

Continue REST Operations

---

Queue Failure

↓

Retry

↓

Dead Letter Queue

↓

Alert Operations Team

---

AI Failure

↓

Graceful Message

↓

Retry Option

↓

Continue Platform Usage

---

# 39. Communication Summary

BenefitOS combines multiple communication mechanisms to balance performance, scalability, and user experience.

REST APIs provide reliable request-response interactions.

WebSockets ensure real-time synchronization.

Redis Pub/Sub enables distributed event propagation.

BullMQ handles asynchronous workloads.

Domain Events decouple business modules.

Together, these mechanisms provide a responsive, scalable, and production-ready communication architecture capable of supporting large-scale deployments while maintaining clean separation of concerns.

---

# End of Phase 3

**Next Phase**

Data Architecture

- PostgreSQL Architecture
- Prisma Architecture
- Redis Data Model
- Storage Architecture
- Transaction Strategy
- Caching Strategy
- Data Consistency
- Backup Strategy
- Data Lifecycle
- Repository Pattern
# Phase 4 – Data Architecture

---

# 40. Data Architecture

## Overview

The BenefitOS Platform follows a layered data architecture designed to ensure:

- Data consistency
- High availability
- Horizontal scalability
- Secure storage
- Efficient querying
- Strong transactional guarantees

The platform maintains a single source of truth for persistent business data while using Redis for temporary and cached information.

---

# 41. Data Storage Architecture

The platform uses multiple storage technologies, each optimized for a specific responsibility.

| Storage | Purpose |
|----------|---------|
| PostgreSQL | Primary Relational Database |
| Supabase Storage | Private File Storage |
| Redis | Cache, Pub/Sub, Queue Backend |
| Browser Cache | Static Assets |
| TanStack Query Cache | Client-side API Cache |

Only PostgreSQL shall be considered the authoritative source of business data.

---

# 42. PostgreSQL Architecture

## Responsibilities

PostgreSQL stores:

- User Accounts
- Citizen Digital Twins
- Scheme Metadata
- Recommendations
- Documents Metadata
- OCR Results
- AI Conversations
- Applications
- Notifications
- Timeline Entries
- Audit Logs
- User Preferences

---

## Database Principles

The database shall:

- Normalize transactional data.
- Enforce referential integrity.
- Support ACID transactions.
- Use UUID primary keys.
- Record timestamps.
- Support optimistic concurrency where appropriate.

---

## Database Design Rules

Every table shall include:

```text
id

created_at

updated_at
```

Optional fields:

```text
deleted_at

version
```

Soft deletion shall be preferred where data recovery or auditability is required.

---

# 43. Prisma Architecture

Prisma is the only ORM used by the backend.

Database access shall occur exclusively through Prisma repositories.

---

## Request Flow

```text
Controller

↓

Service

↓

Repository

↓

Prisma Client

↓

PostgreSQL
```

---

## Prisma Responsibilities

- CRUD Operations
- Transactions
- Migrations
- Query Optimization
- Type-safe Queries
- Database Schema Management

Direct SQL queries are discouraged unless necessary for measurable performance improvements.

---

# 44. Repository Pattern

Repositories encapsulate persistence logic.

Repositories shall:

- Query the database.
- Execute transactions.
- Handle pagination.
- Apply filtering and sorting.

Repositories shall not:

- Implement business rules.
- Call external APIs.
- Publish events.
- Perform authorization.

---

# 45. Transaction Strategy

Transactions shall be used whenever multiple related database operations must succeed or fail together.

Examples include:

- User registration
- Document verification
- Recommendation updates
- Timeline regeneration
- Account deletion

---

## Transaction Flow

```text
Begin Transaction

↓

Operation A

↓

Operation B

↓

Operation C

↓

Commit

```

If any operation fails:

```text
Rollback

↓

Log Failure

↓

Return Error
```

---

# 46. Redis Data Architecture

Redis is used only for temporary data.

Redis shall never become the primary source of truth.

---

## Redis Responsibilities

- Distributed Cache
- Queue Backend
- Pub/Sub
- Rate Limiting
- Session Metadata
- Temporary Computations

---

## Cached Data

Examples include:

- Scheme Catalog
- Static Configuration
- Frequently Accessed Lookups
- Dashboard Snapshots
- Temporary AI Context

Cache entries shall define explicit expiration policies.

---

# 47. Cache Strategy

BenefitOS uses multi-level caching.

```text
Browser Cache

↓

TanStack Query Cache

↓

Redis Cache

↓

PostgreSQL
```

---

## Cache Invalidation

Caches shall be invalidated immediately after changes affecting cached data.

Examples include:

- Profile Updates
- Document Changes
- Recommendation Refresh
- Timeline Regeneration

The platform shall favor correctness over cache longevity.

---

# 48. File Storage Architecture

Uploaded files are stored in Supabase Storage.

All buckets remain private.

---

## Storage Buckets

```text
documents

applications

profile-images

generated-pdfs

temporary
```

---

## File Access

Files shall be accessed through signed URLs with configurable expiration times.

Direct public access is prohibited.

---

## File Validation

Before storage, the platform shall validate:

- MIME Type
- File Size
- File Extension
- Upload Integrity

Future versions may include malware scanning.

---

# 49. Data Consistency

The platform shall guarantee strong consistency for transactional business data.

Critical operations include:

- Profile Updates
- Recommendation Results
- Document Verification
- Application Records

Eventual consistency is acceptable only for:

- Notifications
- Timeline Updates
- Background Jobs
- Analytics

---

# 50. Data Lifecycle

Every piece of data progresses through a defined lifecycle.

### Citizen Data

```text
Created

↓

Validated

↓

Updated

↓

Archived (if required)

↓

Deleted
```

---

### Document Data

```text
Uploaded

↓

Validated

↓

OCR Processed

↓

Verified

↓

Linked

↓

Archived

↓

Deleted
```

---

### Recommendation Data

```text
Generated

↓

Stored

↓

Displayed

↓

Superseded

↓

Archived
```

---

# 51. Backup Strategy

Production data shall be backed up automatically.

Backup requirements include:

- Daily Database Backups
- Point-in-Time Recovery
- Storage Redundancy
- Backup Verification

Backups shall be encrypted at rest.

---

# 52. Disaster Recovery

The platform shall define recovery procedures for:

- Database corruption
- Storage loss
- Redis failure
- Queue failure
- Accidental deletion

Recovery objectives:

| Metric | Target |
|---------|--------|
| Recovery Time Objective (RTO) | < 2 Hours |
| Recovery Point Objective (RPO) | < 15 Minutes |

---

# 53. Audit Logging

Critical operations shall generate immutable audit records.

Examples include:

- Login
- Profile Changes
- Document Uploads
- Recommendation Generation
- Settings Changes
- Account Deletion

Audit logs shall include:

- Timestamp
- User Identifier
- Action
- Resource
- Result
- IP Address (where applicable)

Sensitive values shall not be stored in audit logs.

---

# 54. Data Privacy

BenefitOS shall follow privacy-by-design principles.

Requirements include:

- Minimal data collection
- Purpose limitation
- User ownership of personal data
- Secure deletion
- Encrypted transmission
- Private file storage

The platform shall provide mechanisms for users to export or delete their personal data.

---

# 55. Data Quality

The platform shall ensure:

- Valid input
- Referential integrity
- Duplicate prevention
- Mandatory field validation
- Consistent formatting
- Verified OCR persistence

Data quality checks shall occur before persistence.

---

# 56. Phase Summary

The BenefitOS Data Architecture establishes PostgreSQL as the authoritative source of truth while leveraging Redis, Supabase Storage, and client-side caching to optimize performance and scalability.

The architecture emphasizes:

- Strong transactional consistency
- Secure file storage
- Efficient caching
- Controlled data lifecycle
- Automated backups
- Disaster recovery
- Auditability
- Privacy by design

This data architecture provides the foundation for reliable, secure, and maintainable platform operations.

---

# End of Phase 4

**Next Phase:**

Infrastructure Architecture

- Turborepo
- Monorepo Organization
- Docker
- GitHub Actions
- CI/CD
- Vercel
- Railway
- Environment Strategy
- Monitoring
- Logging
- Observability
- Production Deployment Topology
# Phase 5 – Infrastructure Architecture

---

# 57. Infrastructure Architecture

## Overview

The BenefitOS Platform is designed for cloud-native deployment using a modular monorepo architecture.

The infrastructure prioritizes:

- High Availability
- Scalability
- Reliability
- Observability
- Automation
- Disaster Recovery
- Security

The platform separates compute, storage, caching, background processing, and monitoring into independent infrastructure components.

---

# 58. Deployment Topology

```text
                          Internet

                              │

                              ▼

                    ┌──────────────────┐
                    │      Vercel      │
                    │   Next.js Web    │
                    └──────────────────┘

                              │
                   HTTPS + WebSocket

                              ▼

                    ┌──────────────────┐
                    │     Railway      │
                    │   NestJS API     │
                    └──────────────────┘

           ┌────────────┼────────────┬─────────────┐

           ▼            ▼            ▼

     PostgreSQL      Redis       BullMQ Workers
     (Supabase)

           │            │

           ▼            ▼

    Supabase Storage  Redis Pub/Sub

           │

           ▼

     External AI Providers

      ┌───────────────┐

      │ Google Gemini │

      └───────────────┘

      ┌───────────────┐

      │  Sarvam AI    │

      └───────────────┘
```

---

# 59. Monorepo Architecture

BenefitOS follows a Turborepo-based monorepo architecture.

```text
benefitos/

├── apps/
│
│   └── web/
│
├── backend/
│
├── packages/
│
│   ├── ui/
│   ├── types/
│   ├── utils/
│   ├── constants/
│   └── config/
│
├── prisma/
│
├── docs/
│
├── scripts/
│
├── .github/
│
├── turbo.json
│
├── pnpm-workspace.yaml
│
└── package.json
```

---

## Benefits

- Shared packages
- Faster builds
- Incremental compilation
- Shared linting
- Shared testing
- Consistent dependency management

---

# 60. Build System

The project uses:

- Turborepo
- pnpm Workspaces

Build pipeline:

```text
Dependency Graph

↓

Affected Packages

↓

Parallel Build

↓

Cache

↓

Output
```

Only affected packages shall rebuild.

---

# 61. Docker Architecture

The platform shall support containerized deployments.

Each major service shall have an independent Docker image.

Examples:

- Frontend
- Backend
- Worker

Containers shall remain stateless.

Persistent data shall never be stored inside containers.

---

# 62. Environment Strategy

Separate environments shall exist for:

- Development
- Testing
- Staging
- Production

Each environment maintains independent:

- Database
- Storage
- Redis
- Environment Variables

Production secrets shall never be reused in lower environments.

---

# 63. CI/CD Architecture

GitHub Actions shall automate:

- Dependency installation
- Type checking
- Linting
- Unit testing
- Integration testing
- Build verification
- Security scanning
- Docker build validation

---

## Deployment Pipeline

```text
Developer

↓

Git Push

↓

GitHub

↓

GitHub Actions

↓

Quality Gates

↓

Build

↓

Deploy

↓

Health Checks

↓

Production
```

Deployment proceeds only if all quality gates succeed.

---

# 64. Quality Gates

Every deployment must satisfy:

- TypeScript compilation
- ESLint
- Unit tests
- Integration tests
- Build success
- Security checks

Deployment shall fail if any mandatory check fails.

---

# 65. Hosting Strategy

## Frontend

Provider

Vercel

Responsibilities

- Next.js Hosting
- CDN
- Static Assets
- Edge Delivery

---

## Backend

Provider

Railway

Responsibilities

- NestJS API
- Socket.IO Gateway
- Queue Scheduler

---

## Database

Provider

Supabase PostgreSQL

Responsibilities

- Relational Data
- Authentication
- Storage

---

## Cache

Provider

Redis

Responsibilities

- Cache
- Pub/Sub
- BullMQ Backend

---

# 66. Monitoring Architecture

The platform shall continuously monitor:

- API Health
- Database
- Redis
- Workers
- Storage
- AI Providers
- Queue Length
- Response Times

Monitoring tools include:

- Better Stack
- Sentry
- OpenTelemetry
- Prisma Metrics

---

# 67. Logging Architecture

The platform shall generate structured logs.

Log Levels:

- Error
- Warning
- Information
- Debug (Development Only)

Logs shall include:

- Timestamp
- Service
- Request ID
- User ID (where appropriate)
- Execution Time

Sensitive information shall never be logged.

---

# 68. Health Checks

Every infrastructure component shall expose health information.

Examples:

```text
/api/v1/health

↓

API

↓

Database

↓

Redis

↓

Storage

↓

Gemini

↓

Sarvam

↓

Worker

↓

Status Response
```

Health checks shall be used by deployment pipelines and monitoring systems.

---

# 69. Backup Strategy

Production infrastructure shall include:

- Automated database backups
- Storage redundancy
- Configuration backups
- Infrastructure configuration versioning

Backups shall be tested periodically.

---

# 70. Disaster Recovery

Recovery procedures shall exist for:

- API failure
- Database failure
- Redis failure
- Worker failure
- Storage failure

Recovery objectives:

| Metric | Target |
|---------|--------|
| RTO | < 2 Hours |
| RPO | < 15 Minutes |

---

# 71. Scaling Strategy

Independent scaling shall be supported for:

- Frontend
- API
- Socket Gateway
- Background Workers
- Redis
- PostgreSQL

Scaling decisions shall be based on:

- CPU Utilization
- Memory Usage
- Queue Length
- Response Time
- Active WebSocket Connections

---

# 72. Infrastructure Summary

The BenefitOS infrastructure is designed as a cloud-native, production-ready platform supporting independent scaling, automated deployments, comprehensive monitoring, and resilient operations.

Key characteristics include:

- Turborepo monorepo
- Container-ready services
- Automated CI/CD
- Stateless applications
- Managed PostgreSQL
- Redis-backed caching and messaging
- Background job processing
- Secure cloud storage
- Comprehensive monitoring
- High availability
- Disaster recovery readiness

This infrastructure architecture ensures that BenefitOS can evolve from an MVP to a large-scale citizen platform without requiring fundamental architectural changes.

---

# End of Phase 5

**Next Phase:**

Security Architecture

- Authentication
- Authorization
- JWT Strategy
- Row Level Security
- Secrets Management
- API Security
- WebSocket Security
- File Security
- Data Encryption
- Threat Model
- Security Best Practices
# Phase 6 – Security Architecture

---

# 73. Security Architecture

## Overview

BenefitOS follows a **defense-in-depth** security model.

Security is implemented at every layer of the platform rather than relying on a single protection mechanism.

The architecture protects:

- Citizen Identity
- Personal Information
- Uploaded Documents
- Authentication Tokens
- API Endpoints
- WebSocket Connections
- AI Requests
- Infrastructure Secrets

Security is considered a first-class architectural requirement.

---

# 74. Security Principles

The platform follows these principles.

## Least Privilege

Every user, service, and process shall operate with the minimum permissions required.

---

## Zero Trust

Every request shall be authenticated and authorized.

No client request is trusted by default.

---

## Secure by Default

Security mechanisms shall be enabled by default.

They shall not depend on developer configuration.

---

## Privacy by Design

Citizen privacy shall be considered during every architectural decision.

---

## Defense in Depth

Multiple independent security layers shall protect every resource.

---

# 75. Authentication Architecture

BenefitOS delegates authentication to Supabase Authentication.

Supported providers:

- Email & Password
- Google OAuth

Future providers:

- DigiLocker
- Aadhaar eKYC (if officially supported)
- Other OAuth providers

---

## Authentication Flow

```text
Citizen

↓

Supabase Authentication

↓

JWT Issued

↓

Next.js

↓

NestJS Guard

↓

Authorized Request
```

---

## Authentication Rules

Authentication shall:

- Require verified email.
- Support password reset.
- Support session persistence.
- Support multiple devices.
- Support token refresh.

Passwords are never stored by BenefitOS.

---

# 76. Authorization Architecture

Authorization determines what authenticated users may access.

---

## Authorization Rules

Every protected request shall verify:

- Identity
- Ownership
- Resource Access
- Permissions

---

## Resource Ownership

A citizen may only access:

- Their profile
- Their documents
- Their recommendations
- Their AI conversations
- Their applications
- Their notifications

Cross-user access is prohibited.

---

# 77. JWT Strategy

JWTs are issued by Supabase.

The backend validates:

- Signature
- Expiration
- Issuer
- Audience
- Subject

Expired tokens shall be rejected.

---

# 78. Row Level Security

Supabase Row Level Security (RLS) shall protect user-owned tables.

Every query shall automatically enforce ownership.

Examples:

- Citizen Profile
- Documents
- Recommendations
- Timeline
- Applications
- Notifications

Administrative bypasses shall not exist in Version 2.0.

---

# 79. API Security

Every REST endpoint shall implement:

- JWT Validation
- Input Validation
- Request Size Limits
- Rate Limiting
- Error Sanitization

---

## Validation

All incoming requests shall be validated using DTOs and Zod schemas before business logic execution.

---

## Rate Limiting

Public endpoints shall enforce rate limits to reduce abuse.

Examples:

- Login
- Registration
- Password Reset

---

# 80. WebSocket Security

Every WebSocket connection shall authenticate using JWT.

---

## Connection Flow

```text
Socket Connection

↓

JWT Verification

↓

User Validation

↓

Join Private Room

↓

Subscribe to Events
```

---

Unauthenticated socket connections shall be rejected immediately.

---

## Room Authorization

Users may subscribe only to their own room.

Example

```text
user:<userId>
```

Broadcasting to unauthorized rooms is prohibited.

---

# 81. File Security

Uploaded documents are considered sensitive assets.

---

## File Validation

Every upload shall verify:

- MIME Type
- Extension
- Maximum Size
- Upload Integrity

---

## Storage Rules

Files shall:

- Remain private.
- Be stored in Supabase Storage.
- Be accessed only through signed URLs.
- Have configurable URL expiration.

---

Future versions may integrate malware scanning before persistence.

---

# 82. Data Encryption

All communication shall use HTTPS.

Sensitive information shall be encrypted during transmission.

---

## Encryption in Transit

- HTTPS
- TLS
- Secure WebSocket (WSS)

---

## Encryption at Rest

Encryption is managed by infrastructure providers for:

- PostgreSQL
- Supabase Storage
- Redis (where supported)

---

# 83. Secret Management

Secrets shall never be committed to source control.

Secrets include:

- API Keys
- JWT Secrets
- Service Role Keys
- Database Credentials
- Redis Passwords

---

Secrets shall be managed through environment variables or cloud secret management systems.

---

# 84. AI Security

Only verified business context shall be sent to Gemini.

Personally identifiable information shall be minimized before prompt construction where possible.

AI shall never:

- Store secrets.
- Receive authentication tokens.
- Modify database records directly.

---

# 85. Logging Security

Logs shall never contain:

- Passwords
- Tokens
- API Keys
- Personal Documents
- Secret Values

Logs may include:

- Request ID
- Timestamp
- Service Name
- Error Code
- Execution Time

---

# 86. Threat Model

The architecture considers the following threats.

## Authentication Attacks

Mitigations:

- JWT Validation
- Secure Sessions
- Rate Limiting

---

## SQL Injection

Mitigation:

- Prisma ORM
- Parameterized Queries

---

## Cross-Site Scripting (XSS)

Mitigations:

- Output Escaping
- Input Validation
- Content Security Policy

---

## Cross-Site Request Forgery (CSRF)

Mitigations:

- CSRF Protection where applicable
- Secure Authentication Flows

---

## Broken Access Control

Mitigations:

- Ownership Validation
- Authorization Guards
- Row Level Security

---

## File Upload Abuse

Mitigations:

- Validation
- Private Storage
- Signed URLs

---

## Denial of Service

Mitigations:

- Rate Limiting
- Queue Isolation
- Horizontal Scaling

---

# 87. Security Monitoring

The platform shall monitor:

- Failed Login Attempts
- Suspicious Requests
- Rate Limit Violations
- Queue Failures
- Unauthorized Access Attempts
- API Errors

Critical security events shall trigger alerts.

---

# 88. Security Auditing

Security audits shall verify:

- Dependency Vulnerabilities
- Secret Exposure
- Authentication Flows
- Authorization Rules
- File Security
- Infrastructure Configuration

Audits shall occur before every production release.

---

# 89. Compliance

The platform shall align with recognized security best practices, including:

- OWASP Top 10
- Secure Coding Guidelines
- Principle of Least Privilege
- Privacy by Design

Compliance requirements shall evolve with applicable regulations.

---

# 90. Security Summary

The BenefitOS Security Architecture provides multiple independent layers of protection across authentication, authorization, communication, storage, infrastructure, and AI integration.

By combining Supabase Authentication, JWT validation, Row Level Security, encrypted communication, private storage, secure WebSocket connections, structured validation, and continuous monitoring, the platform maintains a secure foundation suitable for handling sensitive citizen information in a production environment.

---

# End of Phase 6

**Next Phase:**

Scalability & Performance Architecture

- Horizontal Scaling
- Load Balancing
- High Availability
- Performance Budgets
- Caching Strategy
- Worker Scaling
- Database Scaling
- WebSocket Scaling
- Disaster Recovery
- Capacity Planning
- Production Readiness
# Phase 7 – Scalability & Performance Architecture

---

# 91. Scalability Architecture

## Overview

The BenefitOS Platform is designed to scale horizontally without requiring significant architectural changes.

The platform separates independent responsibilities into independently scalable components.

Scalable components include:

- Frontend
- Backend API
- WebSocket Gateway
- Background Workers
- Redis
- PostgreSQL
- Object Storage

Each component may be scaled independently according to workload characteristics.

---

# 92. Horizontal Scaling

Every stateless service shall support horizontal scaling.

```text
                Load Balancer

                      │

      ┌───────────────┼───────────────┐

      ▼               ▼               ▼

 Backend A       Backend B      Backend C

      │               │               │

      └───────────────┼───────────────┘

                      ▼

              PostgreSQL Database

```

All backend instances shall remain functionally identical.

No backend instance shall store session-specific application state.

---

# 93. Frontend Scaling

The frontend shall be deployed through Vercel's global CDN.

Responsibilities:

- Static Asset Delivery
- Edge Caching
- Route Optimization
- Image Optimization

Frontend scaling shall be handled automatically by the hosting platform.

---

# 94. Backend Scaling

Backend instances shall be stateless.

Scaling considerations:

- Independent API replicas
- Independent Socket.IO gateways
- Shared Redis
- Shared PostgreSQL
- Shared Storage

Any backend instance shall be capable of serving any authenticated request.

---

# 95. WebSocket Scaling

Socket.IO shall support horizontal scaling using Redis Pub/Sub.

```text
Client

↓

Socket Gateway A

↓

Redis Pub/Sub

↓

Socket Gateway B

↓

Connected Clients
```

This ensures that events published by one backend instance reach users connected to another instance.

---

# 96. Background Worker Scaling

Workers process asynchronous tasks.

Worker instances shall scale independently of API instances.

```text
BullMQ Queue

↓

Worker A

Worker B

Worker C

↓

Database

↓

Socket Events
```

Increasing worker count shall improve throughput without affecting API latency.

---

# 97. Database Scaling

PostgreSQL remains the authoritative data source.

Scaling strategies include:

- Query Optimization
- Indexing
- Read Replicas (Future)
- Connection Pooling
- Efficient Transactions

Database sharding is intentionally out of scope for Version 2.0.

---

# 98. Cache Scaling

Redis shall handle:

- Distributed Cache
- Queue Backend
- Pub/Sub
- Temporary Data

Cache instances shall support:

- Replication
- Persistence (where configured)
- Automatic Failover (future)

---

# 99. Storage Scaling

Supabase Storage provides scalable object storage.

Characteristics:

- Private Buckets
- Signed URLs
- Automatic Scaling
- High Durability

Storage capacity shall not depend on backend instances.

---

# 100. Performance Budgets

The platform defines measurable performance targets.

| Operation | Target |
|-----------|--------|
| Initial Page Load | < 2 Seconds |
| API Response | < 300 ms |
| Dashboard Load | < 500 ms |
| Recommendation Refresh | < 2 Seconds |
| AI Streaming Start | < 2 Seconds |
| OCR Queue Acceptance | < 200 ms |
| Notification Delivery | < 500 ms |
| WebSocket Event Propagation | < 500 ms |

These targets shall be monitored continuously.

---

# 101. Resource Optimization

The platform shall minimize resource consumption.

Techniques include:

- Lazy Loading
- Dynamic Imports
- Code Splitting
- Image Optimization
- Route Prefetching
- Query Caching
- Incremental Rendering

Large resources shall not block initial rendering.

---

# 102. High Availability

The platform shall minimize downtime.

Strategies include:

- Stateless Services
- Managed Database
- Managed Storage
- Multiple API Instances
- Health Checks
- Automatic Restarts

Single points of failure shall be minimized.

---

# 103. Fault Tolerance

Failures in one subsystem shall not cause total platform failure.

Examples:

## Gemini Failure

↓

AI unavailable

↓

Core platform remains functional

---

## OCR Failure

↓

Retry Queue

↓

Manual Retry

↓

No API interruption

---

## Redis Failure

↓

Disable real-time updates temporarily

↓

REST APIs continue functioning

---

## Worker Failure

↓

Jobs remain queued

↓

Replacement worker resumes processing

---

# 104. Capacity Planning

The architecture is designed to support growth.

Expected scaling stages:

| Stage | Users |
|---------|--------|
| Development | < 100 |
| Beta | 1,000 |
| Pilot | 10,000 |
| Production | 100,000 |
| Large Scale | 1,000,000+ |

No architectural redesign should be required between these stages.

---

# 105. Production Readiness Checklist

Before production deployment, the platform shall verify:

Infrastructure

- Frontend deployed
- Backend deployed
- Redis operational
- PostgreSQL operational
- Workers operational

Quality

- TypeScript passes
- ESLint passes
- Tests pass
- Security scan passes

Operations

- Monitoring enabled
- Logging enabled
- Alerts configured
- Health checks verified

Deployment

- CI/CD successful
- Rollback strategy available
- Environment variables configured

---

# 106. Operational Metrics

The platform shall continuously collect:

Performance

- Response Time
- Throughput
- Active Users
- Queue Length

Infrastructure

- CPU Usage
- Memory Usage
- Database Connections
- Redis Memory
- Worker Utilization

Application

- Login Success Rate
- Recommendation Generation Time
- OCR Success Rate
- AI Response Time
- Notification Delivery Time

---

# 107. Alerting Strategy

Alerts shall be generated for:

Critical

- API Down
- Database Unreachable
- Queue Failure
- Storage Failure

Warning

- High CPU
- High Memory
- Slow Queries
- Long Queue Processing
- Elevated Error Rate

Informational

- Deployment Completed
- Backup Completed
- Worker Restarted

---

# 108. Load Testing Requirements

Prior to production, the platform shall undergo:

- API Load Testing
- WebSocket Load Testing
- Database Stress Testing
- Queue Throughput Testing
- AI Request Testing
- OCR Pipeline Testing

Load testing shall validate performance budgets under expected production traffic.

---

# 109. Performance Optimization Strategy

Continuous optimization shall focus on:

Frontend

- Bundle Size
- Rendering Performance
- Network Requests

Backend

- Query Optimization
- Efficient Transactions
- Connection Pooling

Infrastructure

- Cache Hit Rate
- Queue Throughput
- Worker Efficiency

Performance regressions shall be identified during CI/CD where practical.

---

# 110. Scalability & Performance Summary

The BenefitOS architecture is designed to support gradual growth from development to large-scale production without fundamental redesign.

Through stateless services, independent scaling, distributed caching, asynchronous processing, managed infrastructure, and continuous monitoring, the platform provides a resilient and performant foundation for delivering a modern digital welfare experience.

---

# End of Phase 7

**Next Phase:**

Final Architecture

- Dependency Rules
- Architectural Decision Summary
- Design Patterns
- Engineering Guidelines
- Future Evolution
- Architecture Governance
- Final System Diagram
- Complete Architecture Summary
- End of Document
# Phase 8 – Architecture Governance & Final System Architecture

---

# 111. Dependency Rules

BenefitOS follows strict dependency management.

Dependencies shall always flow downward.

```text
Presentation Layer

↓

Application Layer

↓

Domain Layer

↓

Infrastructure Layer

↓

Persistence Layer
```

Reverse dependencies are prohibited.

---

## Frontend Dependency Flow

```text
Pages

↓

Layouts

↓

Features

↓

Components

↓

Hooks

↓

Services

↓

REST Client / WebSocket Client

↓

Backend
```

Rules

- Components shall never call the database.
- Components shall never contain business logic.
- Components shall never directly call `fetch()`.
- Business logic belongs inside services.

---

## Backend Dependency Flow

```text
Controller

↓

Application Service

↓

Domain Service

↓

Repository

↓

Prisma

↓

PostgreSQL
```

Rules

Controllers

- Request validation
- Authentication
- Authorization
- Response formatting

Controllers shall never:

- Access Prisma
- Publish events
- Execute business rules

---

Repositories

Repositories shall:

- Query database
- Execute transactions
- Return entities

Repositories shall never:

- Call AI
- Publish WebSocket events
- Execute recommendation logic

---

Application Services

Application Services coordinate:

- Business rules
- Transactions
- Event publishing
- Queue creation

---

Workers

Workers execute:

- OCR
- AI Tasks
- Recommendation Refresh
- Timeline Generation
- Notification Fan-Out

Workers shall never expose HTTP endpoints.

---

# 112. Design Patterns

BenefitOS intentionally combines multiple proven software design patterns.

---

## Repository Pattern

Purpose

Separate persistence from business logic.

---

## Service Layer Pattern

Purpose

Centralize business rules.

---

## Dependency Injection

Purpose

Loose coupling.

Improve testing.

---

## Domain Events

Purpose

Decouple modules.

Allow asynchronous reactions.

---

## Observer Pattern

Purpose

Event subscribers.

Notification generation.

Timeline generation.

---

## Factory Pattern

Purpose

Create AI prompt builders.

DTO converters.

Parser creation.

---

## Strategy Pattern

Purpose

Support multiple recommendation strategies in future.

---

## Adapter Pattern

Purpose

Integrate:

- Gemini
- Sarvam
- Supabase

without affecting business logic.

---

## Builder Pattern

Purpose

Construct:

- AI prompts
- Recommendation explanations
- API responses

---

# 113. Architectural Decision Summary

The following architectural decisions are permanent unless superseded by a future Engineering Decision Record (EDR).

| Decision | Rationale |
|----------|-----------|
| Next.js 15 | Modern React framework with App Router |
| NestJS | Modular backend with dependency injection |
| PostgreSQL | Reliable relational database |
| Prisma | Type-safe ORM |
| Supabase | Managed authentication and storage |
| Redis | Distributed cache and Pub/Sub |
| BullMQ | Reliable background processing |
| Socket.IO | Real-time synchronization |
| Google Gemini | AI reasoning and document understanding |
| Sarvam AI | Speech-to-Text for multilingual support |
| Turborepo | Efficient monorepo management |
| pnpm | Fast dependency management |

All future architectural changes shall be recorded through an Engineering Decision Record.

---

# 114. Engineering Guidelines

Every engineer working on BenefitOS shall follow these principles.

- Build for maintainability.
- Keep modules small and cohesive.
- Prefer explicit code over clever code.
- Avoid unnecessary abstractions.
- Optimize only after measurement.
- Write tests for business logic.
- Keep documentation synchronized.
- Preserve architectural boundaries.
- Use strict TypeScript.
- Prioritize accessibility.

---

# 115. Future Evolution

The architecture supports future expansion without major redesign.

Potential additions include:

Platform

- Android Application
- iOS Application
- Progressive Web App

Administration

- Government Portal
- NGO Portal
- CSR Dashboard

Infrastructure

- Kubernetes
- Multi-region deployment
- Read replicas
- CDN edge caching
- AI model routing

Artificial Intelligence

- Multi-provider AI
- Offline AI inference
- Personalized AI memory
- Voice conversations

The existing architecture is intentionally designed to support these capabilities.

---

# 116. Architecture Governance

Architectural integrity shall be maintained throughout the project lifecycle.

Changes affecting architecture require:

- Architecture review.
- Documentation updates.
- Engineering approval.
- Testing verification.

Significant architectural modifications shall update:

- System Architecture
- Frontend Architecture
- Backend Architecture
- Database Architecture
- API Architecture
- File Structure
- Coding Standards

---

# 117. Complete System Diagram

```text
                                 Internet

                                     │

                                     ▼

                          ┌────────────────────┐
                          │      Vercel        │
                          │    Next.js App     │
                          └────────────────────┘

                                     │

                      HTTPS / REST / WebSocket

                                     │

                                     ▼

                          ┌────────────────────┐
                          │      Railway       │
                          │     NestJS API     │
                          └────────────────────┘

                 ┌──────────────┼───────────────┐

                 ▼              ▼               ▼

         REST Controllers   Socket Gateway   Health Module

                 │

                 ▼

         Application Services

                 │

      ┌──────────┼───────────┬────────────┐

      ▼          ▼           ▼            ▼

 Recommendation   OCR        AI      Timeline

      │          │           │            │

      └──────────┼───────────┼────────────┘

                 ▼

           Domain Event Bus

                 │

      ┌──────────┼──────────┬────────────┐

      ▼          ▼          ▼            ▼

 Notifications  Redis    BullMQ      Audit Logs

      │          │          │

      └──────────┼──────────┘

                 ▼

          PostgreSQL (Supabase)

                 │

      ┌──────────┼────────────┐

      ▼          ▼            ▼

  Auth       Storage      Signed URLs

                 │

      ┌──────────┼───────────┐

      ▼                      ▼

 Google Gemini          Sarvam AI

                 │

                 ▼

          Connected Clients
```

---

# 118. Architecture Validation Checklist

Before any release, verify:

Architecture

□ Layer boundaries maintained

□ No circular dependencies

□ No business logic in controllers

□ No business logic in repositories

□ Services remain cohesive

Performance

□ Performance budgets met

□ Queue latency acceptable

□ Database performance verified

Security

□ Authentication verified

□ Authorization verified

□ Secrets secured

□ File access validated

Quality

□ Documentation synchronized

□ Tests passing

□ Monitoring operational

□ Production build successful

---

# 119. Architecture Summary

The BenefitOS Platform is built as a modern, modular, event-driven system designed to provide secure, explainable, and scalable digital welfare services.

The architecture combines:

- Modular Monolith
- Event-Driven Communication
- REST APIs
- WebSocket Synchronization
- Distributed Caching
- Background Processing
- Cloud-Native Deployment
- AI-Assisted Guidance
- Deterministic Recommendation Engine

The resulting system is maintainable, scalable, observable, secure, and capable of supporting future platform expansion without fundamental architectural redesign.

Every engineering decision within the project shall remain consistent with the principles and constraints defined in this document.

---

# End of Document

**Document Status:** Final

**Document Number:** 06

**Document Version:** 2.0.0

**Architecture Style:** Modular Event-Driven Distributed Architecture

**Next Document:** 07 - Database Architecture