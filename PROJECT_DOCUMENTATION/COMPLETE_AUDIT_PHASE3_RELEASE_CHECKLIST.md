# BenefitOS — Complete Codebase Audit Phase 3 Release Checklist
**Master Production Release Certification Checklist**

---

## 1. Master Production Release Checklist

| Area | Item | Status | Action Required | Priority | Blocking? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Security** | HttpOnly Cookies | 🟢 VERIFIED | Deploy on HTTPS with `NODE_ENV=production` | P1 | YES |
| **Security** | CORS Policy | 🟢 VERIFIED | Set `CORS_ORIGIN` to production Web URL | P1 | YES |
| **Auth** | Storage Isolation | 🟢 VERIFIED | Block `refresh_token` in `localStorage` | P1 | YES |
| **AI** | Gemini Provider Key | 🟡 UNVERIFIED | Configure `GEMINI_API_KEY` in prod env | P0 | YES |
| **Govt** | Aadhaar e-KYC Gateway | 🟡 SANDBOX | Configure UIDAI prod certs on staging server | P0 | YES |
| **Govt** | DigiLocker Gateway | 🟡 SANDBOX | Register production OAuth redirect URI | P0 | YES |
| **Database** | Prisma Migrations | 🟢 VERIFIED | Execute `npx prisma migrate deploy` in CD | P1 | YES |
| **Build** | Frontend TypeScript | 🟢 VERIFIED | `npx tsc --noEmit` passed (`EXIT CODE 0`) | P1 | YES |
| **Build** | Backend TypeScript | 🟢 VERIFIED | `npx tsc --noEmit` passed (`EXIT CODE 0`) | P1 | YES |
