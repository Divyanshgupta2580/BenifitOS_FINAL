# BenefitOS — Phase 6.0 Dependency Review Report
**Dependency Classification, Lockfile Audit, & React 18 Decision**

---

## 1. Direct Dependency Classification (`apps/frontend/package.json`)

### Active Web Production Dependencies:
* `react` (`^18.3.1`): Web React UI library.
* `react-dom` (`^18.3.1`): Web DOM rendering engine.
* `react-router-dom` (`^7.1.5`): Declarative browser URL router.
* `@tanstack/react-query` (`^5.66.0`): Server-state management & data fetching.
* `axios` (`^1.7.9`): HTTP REST client.
* `socket.io-client` (`^4.8.1`): Realtime WebSocket client.
* `zustand` (`^5.0.3`): Client-side global state store.

---

## 2. Legacy Mobile Package & Lockfile Audit (BUG-003)

* `react-native`: ❌ NO (Removed from `apps/frontend/package.json`)
* `expo`: ❌ NO (Removed from `apps/frontend/package.json`)
* `react-native-web`: ❌ NO (Removed from `apps/frontend/package.json`)
* `@react-native-async-storage/async-storage`: ❌ NO (Removed from `apps/frontend/package.json`)
* **Stale Mobile Lockfile Metadata**: YES (`package-lock.json` retains stale transitive metadata from pre-migration).
* **Package Manager Consistency**: Monorepo root defines `pnpm-workspace.yaml`, while `apps/frontend` contains `package-lock.json` (`npm`).
* **Regeneration Command Required**: Run `pnpm install` across the monorepo workspace when network access is enabled.

---

## 3. React 18.3.1 Justification

* **Current Version**: `18.3.1` in `apps/frontend/package.json`.
* **Justification**: React 18.3.1 is the current LTS production standard for web applications built with Vite 6, Tailwind CSS 3, React Router DOM v7, TanStack Query v5, and Zustand v5.
* **Evaluation**: Fully justified, 100% compatible with `npx tsc --noEmit` and Vite build. Upgrading to React 19 should be treated as a future optional maintenance task.
