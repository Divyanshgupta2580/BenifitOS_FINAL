# BenefitOS — Complete Codebase Audit Phase 1 Repository Inventory
**Exact Source-Tree & Directory Structure Inventory**

---

## 1. Monorepo Root Directory Structure

```
BenefitOS_FINAL/
├── .env.example                               # Public environment template (VITE_API_URL, VITE_WS_URL)
├── .gitignore                                 # Git ignore patterns (node_modules, dist, .env)
├── package.json                               # Monorepo root package definition
├── pnpm-workspace.yaml                        # Workspace definition ('apps/*', 'packages/*')
├── PROJECT_DOCUMENTATION/                     # Architecture & Audit documentation directory
└── apps/
    ├── backend/                               # NestJS Backend API Engine & Monolith
    │   ├── package.json                       # Backend dependencies (NestJS 11, Prisma, Redis, argon2)
    │   ├── tsconfig.json                      # Backend TypeScript compiler configuration
    │   ├── prisma/                            # Prisma ORM schema & database seed files
    │   │   ├── schema.prisma                  # PostgreSQL database model definitions
    │   │   └── seed.ts                        # Seed script for initial scheme & user data
    │   └── src/                               # Backend TypeScript source code
    │       ├── main.ts                        # NestJS bootstrap entrypoint (CORS, cookieParser, Helmet)
    │       ├── app.module.ts                  # Root NestJS module import graph
    │       ├── common/                        # Shared decorators, guards, filters, interceptors
    │       ├── config/                        # Environment & app configuration services
    │       ├── domain/                        # Domain entities & repository interfaces
    │       ├── infrastructure/                # Redis, Prisma, and external API gateways
    │       └── modules/                       # 13 NestJS feature modules
    │           ├── ai/                        # AI Assistant & Copilot modules
    │           ├── application/               # Application submission & timeline modules
    │           ├── auth/                      # Authentication & HttpOnly cookie controller
    │           ├── citizen/                   # Citizen profile & demographic modules
    │           ├── document/                  # Document vault storage module
    │           ├── health/                    # Terminus health check endpoint
    │           ├── integration/               # Government Aadhaar/DigiLocker integrations
    │           ├── notification/              # Notification system module
    │           ├── ocr/                       # Gemini Vision OCR extraction module
    │           ├── realtime/                  # Socket.IO WebSocket gateway module (/ws)
    │           ├── recommendation/            # Scheme recommendation engine module
    │           ├── welfare/                   # Scheme catalog & eligibility rules engine
    │           └── worker/                    # BullMQ background queue worker module
    │
    └── frontend/                              # React Web-Only Single Page Application (SPA)
        ├── index.html                         # Web HTML5 document entrypoint
        ├── package.json                       # Web dependencies (React 18, Vite 6, Tailwind, Router v7)
        ├── tsconfig.json                      # Web TypeScript compiler configuration
        ├── vite.config.ts                     # Vite bundler & alias configuration
        ├── tailwind.config.js                 # Tailwind CSS design system configuration
        ├── postcss.config.js                  # PostCSS plugins configuration
        └── src/                               # Frontend React source code
            ├── main.tsx                       # React DOM root render entrypoint
            ├── App.tsx                        # Root React Query provider wrapper
            ├── env.d.ts                       # Vite environment type declarations
            ├── index.css                      # Global Tailwind & scrollbar styles
            ├── components/                    # Web UI primitives (Button, Input, Card, Badge, Spinner)
            ├── hooks/                         # React hooks (useAuthStore, useScheme, useApplications)
            ├── navigation/                    # React Router DOM browser URL routing (AppNavigator)
            ├── screens/                       # 35+ Web screen components across 7 domain areas
            ├── services/                      # API client, storage service, WebSocket client
            ├── store/                         # Zustand global state stores (auth, language)
            └── theme/                         # Color tokens & design system theme metrics
```
