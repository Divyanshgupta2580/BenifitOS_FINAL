# BenefitOS — Complete Codebase Audit Phase 1 Dependency Inventory
**Monorepo Workspace Dependencies & Package Manager Classification**

---

## 1. Frontend Workspace Dependencies (`apps/frontend/package.json`)

### Production Web Dependencies:
- `react` (`^18.3.1`): Web React UI library
- `react-dom` (`^18.3.1`): Web DOM rendering engine
- `react-router-dom` (`^7.1.5`): Browser URL router
- `@tanstack/react-query` (`^5.66.0`): Server-state management & data fetching
- `axios` (`^1.7.9`): HTTP client (`withCredentials: true`)
- `socket.io-client` (`^4.8.1`): Realtime WebSocket client
- `zustand` (`^5.0.3`): Client state management

### Development Web Dependencies:
- `vite` (`^6.1.0`): Web application bundler & dev server
- `@vitejs/plugin-react` (`^4.3.4`): Vite React plugin
- `typescript` (`^5.7.2`): Static type checker
- `tailwindcss` (`^3.4.17`), `postcss`, `autoprefixer`: Utility-first CSS styling
- `@types/react`, `@types/react-dom`, `@types/node`: Type definitions

---

## 2. Backend Workspace Dependencies (`apps/backend/package.json`)

### Key Backend Production Dependencies:
- `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`: NestJS 11 framework
- `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`: JWT authentication engine
- `@prisma/client`: Database ORM client
- `argon2`: Password hashing
- `ioredis`: Redis caching & revocation store
- `bullmq`: Background job queues
- `cookie-parser`: HttpOnly cookie parsing
- `@google/genai`: Gemini Vision AI API integration
- `socket.io`: Realtime WebSocket server

---

## 3. Monorepo Alignment & Legacy Package Search

- **Package Manager**: `pnpm` (`pnpm-workspace.yaml`).
- **Legacy Mobile Packages**:
  - `react-native`: 0
  - `expo`: 0
  - `react-native-web`: 0
  - `@react-native-async-storage/async-storage`: 0
