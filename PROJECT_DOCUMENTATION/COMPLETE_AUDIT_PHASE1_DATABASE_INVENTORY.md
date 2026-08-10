# BenefitOS — Complete Codebase Audit Phase 1 Database Inventory
**PostgreSQL & Prisma ORM Schema Inventory**

---

## 1. Relational Database Schema (`apps/backend/prisma/schema.prisma`)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  CITIZEN
  ADMIN
  OFFICER
}

enum DocumentType {
  AADHAAR
  PAN
  INCOME_CERTIFICATE
  CASTE_CERTIFICATE
  DOMICILE_CERTIFICATE
  RATION_CARD
  OTHER
}

enum ApplicationStatus {
  DRAFT
  SUBMITTED
  UNDER_REVIEW
  APPROVED
  REJECTED
  DISBURSED
}

model User {
  id              String         @id @default(uuid())
  email           String         @unique
  phone           String?
  passwordHash    String
  role            Role           @default(CITIZEN)
  isEmailVerified Boolean        @default(false)
  isPhoneVerified Boolean        @default(false)
  mfaEnabled      Boolean        @default(false)
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  profile         CitizenProfile?
}

model CitizenProfile {
  id               String            @id @default(uuid())
  userId           String            @unique
  user             User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  firstName        String
  lastName         String
  gender           String
  dateOfBirth      DateTime
  annualIncomeINR  Float
  occupation       String
  category         String
  isDifferentlyAbled Boolean         @default(false)
  address          Address?
  householdMembers HouseholdMember[]
  landRecords      LandRecord[]
  documents        Document[]
  applications     Application[]
  recommendations  Recommendation[]
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt
}

model Address {
  id         String         @id @default(uuid())
  profileId  String         @unique
  profile    CitizenProfile @relation(fields: [profileId], references: [id], onDelete: Cascade)
  street     String
  city       String
  state      String
  pincode    String
  district   String
}

model HouseholdMember {
  id         String         @id @default(uuid())
  profileId  String
  profile    CitizenProfile @relation(fields: [profileId], references: [id], onDelete: Cascade)
  name       String
  relation   String
  age        Int
  incomeINR  Float?
}

model LandRecord {
  id         String         @id @default(uuid())
  profileId  String
  profile    CitizenProfile @relation(fields: [profileId], references: [id], onDelete: Cascade)
  areaAcres  Float
  surveyNo   String
  state      String
  district   String
}

model Scheme {
  id              String           @id @default(uuid())
  code            String           @unique
  name            String
  ministry        String
  category        String
  description     String
  maxBenefitINR   Float
  eligibilityRules Json
  applications    Application[]
  recommendations Recommendation[]
}

model Document {
  id             String         @id @default(uuid())
  profileId      String
  profile        CitizenProfile @relation(fields: [profileId], references: [id], onDelete: Cascade)
  type           DocumentType
  fileUrl        String
  fileName       String
  mimeType       String
  extractedData  Json?
  ocrConfidence  Float?
  createdAt      DateTime       @default(now())
}

model Application {
  id          String            @id @default(uuid())
  profileId   String
  profile     CitizenProfile    @relation(fields: [profileId], references: [id], onDelete: Cascade)
  schemeId    String
  scheme      Scheme            @relation(fields: [schemeId], references: [id])
  status      ApplicationStatus @default(DRAFT)
  timeline    Json              // Array of timeline events
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
}

model Recommendation {
  id            String         @id @default(uuid())
  profileId     String
  profile       CitizenProfile @relation(fields: [profileId], references: [id], onDelete: Cascade)
  schemeId      String
  scheme        Scheme         @relation(fields: [schemeId], references: [id])
  matchScore    Float
  reasoning     String
  missingDocs   String[]
  createdAt     DateTime       @default(now())
}
```

---

## 2. Database Mapping Audit
- **Cascade Behavior**: Properly configured (`onDelete: Cascade`) for profile entities (`Address`, `HouseholdMember`, `LandRecord`, `Document`, `Application`, `Recommendation`).
- **Indices & Foreign Keys**: Primary UUID keys and unique constraint indexes (`User.email`, `CitizenProfile.userId`, `Address.profileId`, `Scheme.code`).
