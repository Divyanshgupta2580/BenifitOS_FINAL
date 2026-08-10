# BenefitOS — Phase 6.0 API Review Report
**Frontend → Backend API Contract & WebSocket Compatibility Audit**

---

## 1. REST API Contract Audit

An audit of all API client wrappers and React Query service hooks was performed against NestJS backend controllers.

| Service Module | Endpoint Route | HTTP Method | Contract Safety Evaluation |
| :--- | :--- | :--- | :--- |
| **Auth Service** | `/auth/login` | POST | 🟢 UNCHANGED (Preserved payload & tokens) |
| **Auth Service** | `/auth/register` | POST | 🟢 UNCHANGED (Preserved citizen payload) |
| **Auth Service** | `/auth/forgot-password` | POST | 🟢 UNCHANGED |
| **Citizen Profile** | `/citizen/profile` | GET / PATCH | 🟢 UNCHANGED (Preserved profile DTOs) |
| **Schemes** | `/schemes` | GET | 🟢 UNCHANGED (Filter parameters preserved) |
| **Eligibility** | `/schemes/:id/eligibility` | GET / POST | 🟢 UNCHANGED (Deterministic rules call) |
| **Recommendations** | `/recommendations` | GET | 🟢 UNCHANGED |
| **Documents** | `/documents` | GET / POST / DELETE | 🟢 UNCHANGED (Multipart formData preserved) |
| **OCR Extraction** | `/documents/:id/ocr` | GET / POST | 🟢 UNCHANGED |
| **Applications** | `/applications` | GET / POST / PATCH | 🟢 UNCHANGED |
| **AI Assistant** | `/ai/chat` | POST | 🟢 UNCHANGED |
| **AI Copilot** | `/ai/copilot` | POST | 🟢 UNCHANGED |
| **Government Hub** | `/integrations/aadhaar/...` | POST | 🟢 UNCHANGED |

---

## 2. Realtime WebSocket Gateway Audit (`/ws`)

* **Client Library**: `socket.io-client` v4.8.1.
* **Connection Logic**: `websocket-client.ts` connects via Socket.IO WebSocket protocol.
* **Token Authentication**: Handled via connection `auth: { token }` payload.
* **Contract Protection**: Zero NestJS WebSocket gateway handlers were modified.
