# BenefitOS — Complete Codebase Audit Phase 2 AI Audit
**Google Gemini AI Provider & Multimodal Vision OCR Deep Audit**

---

## 1. AI Execution Path Trace

```
[ Frontend: AiCopilotScreen.tsx ]
         │
         ├────── POST /api/v1/ai/copilot ────────────────────► [ NestJS: AiController ]
         │       (Payload: query, citizenId)                         │
         │                                                           ▼
         │                                                    [ AiService ]
         │                                                           │ (Sanitizes prompt & PII)
         │                                                           ▼
         │                                                    [ GeminiAiAdapter ]
         │                                                           │ (Calls @google/genai)
         │◄───── 200 OK ─────────────────────────────────────────────┤
         │       (JSON: content, provider, sources)
```

---

## 2. Gemini Vision OCR Processing Pipeline

1. `DocumentUploadScreen.tsx` submits multipart image/PDF file to `POST /api/v1/documents/upload`.
2. `OcrService` calls `GeminiAiAdapter.extractDocumentData(fileBuffer, mimeType, docType)`.
3. `GeminiAiAdapter` constructs `inlineData` base64 payload and sends to Gemini 1.5 Flash multimodal endpoint.
4. Extracted fields (`documentNumber`, `fullName`, `dateOfBirth`, `address`) are parsed as JSON objects and saved in `Document.extractedData`.
5. User reviews and edits attributes on `OcrReviewScreen.tsx`.

---

## 3. Provider Classification & Verification
- **SDK**: `@google/genai` (Google Gen AI SDK v1).
- **Backend Ownership**: 100% owned by NestJS `AiModule` & `OcrModule`.
- **Classification**: **REAL IMPLEMENTATION WITH DEMO/FALLBACK HARDENING**.
- **Staging Requirement**: Live Gemini API key requires production environment deployment.
