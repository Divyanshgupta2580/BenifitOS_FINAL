# Build & Execution Guide - BenefitOS Platform

## Prerequisites
- Node.js >= 22.0.0
- npm >= 10.0.0
- Redis Server (local or URL via `REDIS_URL`)
- PostgreSQL Database (local or URL via `DATABASE_URL`)

## Local Backend Setup & Compilation

### 1. Environment Setup
Copy `.env.example` to `.env`:
```bash
cp apps/backend/.env.example apps/backend/.env
```

### 2. Install Dependencies
```bash
cd apps/backend
npm install
```

### 3. Generate Prisma Client
```bash
npm run prisma:generate
```

### 4. Build Code
```bash
npm run build
```

### 5. Run Backend Server
- Development mode (with live reload):
  ```bash
  npm run start:dev
  ```
- Production mode:
  ```bash
  npm run start:prod
  ```
