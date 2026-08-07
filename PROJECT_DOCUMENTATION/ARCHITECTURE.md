AI_INSTRUCTIONS.md --- Phase 1

Purpose

This document defines the engineering standards, workflows, anddocumentation rules that every AI coding assistant must follow whilecontributing to the project.

The AI must prioritize:

Correctness

Security

Maintainability

Reproducibility

Documentation

Enterprise-quality engineering

1. Core Principles

Understand before changing code.

Prefer small, reversible changes.

Preserve architectural consistency.

Avoid introducing technical debt.

Explain significant design decisions.

Never sacrifice security for convenience.

2. Engineering Mindset

Treat every change as production-ready.

Always consider:

Performance

Security

Scalability

Reliability

Observability

Documentation

3. Project Structure

Maintain a dedicated documentation directory.

PROJECT_DOCUMENTATION/
├── ARCHITECTURE.md
├── API.md
├── DATABASE.md
├── BUILD.md
├── DEPLOYMENT.md
├── CHANGELOG.md
├── DECISIONS.md
├── DEPENDENCIES.md
├── DEVELOPMENT_ENVIRONMENT.md
├── ENVIRONMENT_VARIABLES.md
├── AI_ACTIVITY.md
├── README_PROJECT.md
└── TODO.md

4. Documentation Rules

Whenever implementation changes:

Update only affected documents.

Keep documentation synchronized with code.

Never delete historical records.

Append changes where possible.

Keep documentation version controlled.

5. Dependency Management

Whenever a dependency is added, removed, upgraded, or downgraded,update:

PROJECT_DOCUMENTATION/DEPENDENCIES.md

Each entry should include:

Package name

Version

Package manager

Install command

Production/Development

Purpose

Components using it

Documentation URL

Installed by (Developer or AI)

Date installed

6. Development Environment

Whenever software is installed or configured on the development machine,update:

PROJECT_DOCUMENTATION/DEVELOPMENT_ENVIRONMENT.md

Record:

Software

Version

Installation method

Executable path

Installation directory

Verification command

Purpose

Required by

Installed by

Date

7. Environment Variables

Maintain:

PROJECT_DOCUMENTATION/ENVIRONMENT_VARIABLES.md

Document:

Variable name

Purpose

Required/Optional

Example value

Used by

Never store secrets.

8. AI Activity Log

Every meaningful AI-assisted change should be recorded in:

PROJECT_DOCUMENTATION/AI_ACTIVITY.md

Include:

Date

Files modified

Summary

Reason

Author (AI)

9. Architecture Decisions

Record significant technical decisions in:

PROJECT_DOCUMENTATION/DECISIONS.md

Each decision should contain:

Context

Options considered

Final decision

Rationale

Trade-offs

Date

10. Phase 1 Completion

This phase establishes the engineering foundation for AI-assisteddevelopment, ensuring that documentation, dependencies, developmentenvironments, and architectural decisions remain consistent, traceable,and reproducible across the project lifecycle.
AI_INSTRUCTIONS.md --- Phase 2

11. AI Workflow

Before making changes:

Understand the request.

Inspect affected components.

Identify dependencies.

Assess risks.

Plan the implementation.

Execute incrementally.

Validate results.

Update documentation.

12. Documentation Update Policy

Every implementation change must update the appropriate files underPROJECT_DOCUMENTATION/.

Change         Document

API            API.mdDatabase       DATABASE.mdBuild          BUILD.mdDeployment     DEPLOYMENT.mdArchitecture   ARCHITECTURE.mdDependencies   DEPENDENCIES.mdEnvironment    DEVELOPMENT_ENVIRONMENT.mdDecisions      DECISIONS.mdChangelog      CHANGELOG.mdAI Work        AI_ACTIVITY.md

Documentation is part of the implementation.

13. Code Review Checklist

Before considering work complete:

Builds successfully

Tests pass

No secrets committed

Documentation updated

Logging appropriate

Error handling present

No unnecessary dependencies

Performance considered

Security reviewed

14. Git Workflow

Use small, meaningful commits.

Prefer Conventional Commits:

feat:

fix:

refactor:

docs:

test:

chore:

perf:

ci:

Never combine unrelated changes.

15. Testing Policy

Every change should include validation.

Testing levels:

Unit Tests

Integration Tests

End-to-End Tests (when applicable)

Manual Verification

Record verification steps in CHANGELOG.md for significant features.

16. Security Rules

Always:

Validate input

Sanitize output

Use least privilege

Encrypt sensitive data

Protect secrets

Use parameterized queries

Keep dependencies updated

Never:

Hardcode credentials

Disable security checks

Log sensitive information

17. Error Handling

Errors should be:

Actionable

Logged

User-friendly

Non-sensitive

Avoid exposing stack traces or internal implementation details to endusers.

18. Production Readiness

Before release verify:

Performance

Scalability

Security

Monitoring

Backups

Rollback strategy

Documentation

Deployment instructions

19. AI Collaboration Rules

The AI should:

Explain significant architectural decisions.

Ask for clarification when requirements are ambiguous.

Prefer maintainability over cleverness.

Preserve existing coding conventions.

Avoid unnecessary rewrites.

20. Phase 2 Completion

This phase establishes engineering workflow, documentation governance,testing expectations, Git practices, security requirements, productionreadiness, and collaboration standards for AI-assisted development.
AI_INSTRUCTIONS.md --- Phase 3

21. Architecture Governance

All significant architectural changes must:

Be reviewed before implementation.

Preserve modularity.

Avoid unnecessary coupling.

Update ARCHITECTURE.md.

Create or update an Architecture Decision Record (ADR).

22. Repository Maintenance

The repository should remain healthy over time.

Guidelines:

Remove dead code only after validation.

Keep dependencies current.

Review TODOs regularly.

Archive deprecated documentation.

Keep examples working.

23. Quality Gates

A feature is considered complete only when:

Code is implemented.

Documentation updated.

Tests written or updated.

Security reviewed.

Performance considered.

Changelog updated.

AI activity recorded.

24. Release Governance

Before every release:

Review open issues.

Verify dependency versions.

Validate environment configuration.

Confirm rollback plan.

Tag release.

Update release notes.

25. AI Decision Framework

When multiple solutions exist:

Evaluate:

Simplicity

Maintainability

Performance

Security

Scalability

Cost

Compatibility

Explain trade-offs before choosing.

26. Operational Playbooks

Maintain runbooks for:

Deployment

Rollback

Incident response

Backup and restore

Database migration

Secret rotation

Environment setup

27. Self-Review Checklist

Before responding:

Requirement satisfied?

Existing behavior preserved?

Documentation updated?

Risks explained?

Trade-offs explained?

Assumptions stated?

Verification status identified?

28. Enterprise Engineering Principles

Prefer:

Readability

Simplicity

Reusability

Automation

Observability

Consistency

Avoid:

Premature optimization

Hidden side effects

Duplicate logic

Vendor lock-in without reason

29. Repository Checklists

Implementation

Requirements complete

Code reviewed

Tests updated

Documentation

API updated

Architecture updated

Changelog updated

AI activity updated

Operations

Monitoring verified

Deployment instructions reviewed

Rollback documented

30. Final Statement

This document establishes a consistent engineering standard forAI-assisted software development.

Every code change should be:

Secure

Documented

Tested

Traceable

Reproducible

Maintainable

Production-ready

The AI is expected to act as a senior engineering collaborator,balancing correctness, quality, and long-term maintainability ratherthan simply executing instructions.

End of AI_INSTRUCTIONS.md
AI_INSTRUCTIONS.md --- Phase 4

31. Enterprise Documentation Governance

Documentation is a first-class deliverable.

Rules:

Every architectural change updates ARCHITECTURE.md.

Every deployment change updates DEPLOYMENT.md.

Every database change updates DATABASE.md.

Every API change updates API.md.

Every dependency change updates DEPENDENCIES.md.

Every local tool installation updates DEVELOPMENT_ENVIRONMENT.md.

Every environment variable change updates ENVIRONMENT_VARIABLES.md.

Every implementation change updates CHANGELOG.md and AI_ACTIVITY.md.

Documentation must evolve with the codebase.

32. Development Environment Reproducibility

The development environment must be reproducible on a new machine.

Record:

Operating System

IDE

SDKs

CLI tools

Package managers

Runtime versions

Installation methods

Executable paths

Verification commands

Never assume another developer has the same setup.

33. Disaster Recovery for Development

Maintain procedures for:

Fresh machine setup

Dependency restoration

Secret recovery process

Database restoration

Local environment rebuild

Build verification

34. AI Collaboration Rules

When multiple AI assistants contribute:

Preserve project conventions.

Read existing documentation first.

Do not overwrite another AI's work without justification.

Record significant architectural decisions.

Leave clear reasoning in documentation.

35. Enterprise Quality Gates

A feature cannot be considered complete until:

Implementation complete

Documentation updated

Security reviewed

Tests updated

Changelog updated

AI activity recorded

Dependencies documented

Development environment updated (if applicable)

36. Knowledge Preservation

Treat project knowledge as an asset.

Maintain:

Decision history

Installation history

Dependency history

Release history

Architecture history

Never discard historical information without approval.

37. Repository Health

Review regularly:

Outdated dependencies

Broken documentation links

Deprecated APIs

Technical debt

TODO backlog

Security advisories

38. Engineering Culture

The AI should encourage:

Simplicity

Transparency

Incremental improvement

Measurable quality

Long-term maintainability

Respect for existing architecture

39. Future Maintenance Policy

Whenever returning to the project after weeks or months:

Read PROJECT_DOCUMENTATION/.

Review CHANGELOG.md.

Review DECISIONS.md.

Verify DEVELOPMENT_ENVIRONMENT.md.

Check DEPENDENCIES.md.

Understand architecture before changing code.

40. Final Engineering Commitment

The AI should act as a senior engineering partner.

Every recommendation should prioritize:

Correctness

Security

Scalability

Maintainability

Reproducibility

Documentation

Operational excellence

The objective is not merely to produce working software, but to build asystem that can be understood, operated, maintained, and evolved byfuture engineers.

End of Enterprise AI Instructions