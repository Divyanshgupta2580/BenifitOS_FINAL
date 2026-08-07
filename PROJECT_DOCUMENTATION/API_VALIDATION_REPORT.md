# BenefitOS API Validation Report

| Field | Value |
|-------|-------|
| Document Title | BenefitOS Backend API Endpoint Audit |
| Document Number | API-VAL-001 |
| Status | PASSED |
| Target Base URL | `EXPO_PUBLIC_API_URL` (`http://localhost:4000/api/v1`) |
| Date | 2026-08-07 |

---

## 1. REST Endpoint Validation Matrix

| Frontend Service Call | Backend NestJS Route | Method | Header / Auth | Payload Structure | Unwrapping Status | Validation Result |
|-----------------------|----------------------|--------|---------------|-------------------|-------------------|-------------------|
| `apiClient.post('/auth/login', ...)` | `@Controller('auth') @Post('login')` | `POST` | Public | `{ email, password }` | `{ user, tokens }` | 🟢 PASS |
| `apiClient.post('/auth/register', ...)` | `@Controller('auth') @Post('register')` | `POST` | Public | `{ email, password, role }` | `{ user, tokens }` | 🟢 PASS |
| `apiClient.post('/auth/logout', ...)` | `@Controller('auth') @Post('logout')` | `POST` | Bearer JWT | `{ refreshToken }` | `{ message }` | 🟢 PASS |
| `apiClient.get('/citizens/me')` | `@Controller('citizens') @Get('me')` | `GET` | Bearer JWT | None | `{ profile: CitizenProfile }` | 🟢 PASS |
| `apiClient.put('/citizens/me', dto)` | `@Controller('citizens') @Put('me')` | `PUT` | Bearer JWT | `UpdateCitizenProfileDto` | `{ message, profile }` | 🟢 PASS |
| `apiClient.get('/schemes?category=...')` | `@Controller('schemes') @Get()` | `GET` | Public | Query: `category, search` | `{ count, schemes: [...] }` | 🟢 PASS |
| `apiClient.get('/schemes/:id')` | `@Controller('schemes') @Get(':id')` | `GET` | Public | Param: `id` | `{ scheme: WelfareSchemeDetail }` | 🟢 PASS |
| `apiClient.get('/recommendations')` | `@Controller('recommendations') @Get()` | `GET` | Bearer JWT | None | `{ count, recommendations: [...] }` | 🟢 PASS |
| `apiClient.get('/documents')` | `@Controller('documents') @Get()` | `GET` | Bearer JWT | None | `{ count, documents: [...] }` | 🟢 PASS |
| `apiClient.post('/documents/upload', formData)`| `@Controller('documents') @Post('upload')` | `POST` | Bearer JWT | `multipart/form-data` | `{ message, document }` | 🟢 PASS |
| `apiClient.delete('/documents/:id')` | `@Controller('documents') @Delete(':id')` | `DELETE` | Bearer JWT | Param: `id` | `{ message }` | 🟢 PASS |
| `apiClient.post('/ocr/process/:id')` | `@Controller('ocr') @Post('process/:id')` | `POST` | Bearer JWT | Param: `id` | `{ message, result }` | 🟢 PASS |
| `apiClient.get('/applications')` | `@Controller('applications') @Get()` | `GET` | Bearer JWT | None | `{ count, applications: [...] }` | 🟢 PASS |
| `apiClient.get('/applications/:id')` | `@Controller('applications') @Get(':id')` | `GET` | Bearer JWT | Param: `id` | `{ application: ApplicationItem }` | 🟢 PASS |
| `apiClient.post('/applications', data)` | `@Controller('applications') @Post()` | `POST` | Bearer JWT | `{ schemeId, formData, ... }` | `{ message, application }` | 🟢 PASS |

---

## 2. Response Interceptor & Cache Invalidation

- **Unwrapping Policy**: `apiClient.ts` handles standard backend response wrappers (`{ success: true, data: ... }`).
- **Mutation Invalidation**:
  - `useUploadDocument`: Invalidates `['documents']`.
  - `useDeleteDocument`: Invalidates `['documents']`.
  - `useCreateApplication`: Invalidates `['applications']`.
  - `useUpdateApplication`: Invalidates `['applications']` and `['application', id]`.
  - `useCitizenProfile`: Invalidates `['citizenProfile']`.
