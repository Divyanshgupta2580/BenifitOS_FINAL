# BenefitOS — Phase 4.2 Backup & Recovery
**Database Backup & Disaster Recovery Strategy**

---

## 1. Backup & Recovery Guidelines

- **Pre-Migration Snapshot**: Execute database snapshot/pg_dump backup prior to running `npx prisma migrate deploy` in production.
- **Point-in-Time Recovery**: Database hosting provider (Managed PostgreSQL) must enable 7-day WAL archiving for point-in-time recovery.
- **Rollback Procedure**: Revert to pre-migration snapshot if schema deployment encounters database errors.
