# BenefitOS — Phase 4.3 Health Checks
**Production Health Check Endpoints & Monitoring Strategy**

---

## 1. Verified Health Endpoints (`apps/backend/src/modules/health/health.controller.ts`)

- **Comprehensive Health Check (`GET /api/v1/health`)**:
  - Uses NestJS Terminus framework.
  - Checks PostgreSQL connectivity (`prismaHealth.pingCheck('database')`).
  - Checks memory heap threshold (`memory.checkHeap('memory_heap', 300MB)`).
- **Liveness Probe (`GET /api/v1/health/liveness`)**:
  - Returns `{ status: 'UP', timestamp }`. Used by Kubernetes / container runner to determine container life.
- **Readiness Probe (`GET /api/v1/health/readiness`)**:
  - Returns `{ status: 'READY', timestamp }`. Used by load balancer before routing ingress traffic.
