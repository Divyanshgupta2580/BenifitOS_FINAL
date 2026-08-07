-- BenefitOS Supabase Production Schema Script
-- Single Source of Truth derived directly from Backend Domain Entities & Prisma Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'OFFICER', 'AUDITOR', 'CITIZEN');
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'TRANSGENDER', 'OTHER');
CREATE TYPE "SocialCategory" AS ENUM ('GENERAL', 'OBC', 'SC', 'ST', 'EWS');
CREATE TYPE "MaritalStatus" AS ENUM ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'SEPARATED');
CREATE TYPE "EmploymentStatus" AS ENUM ('EMPLOYED', 'UNEMPLOYED', 'SELF_EMPLOYED', 'STUDENT', 'RETIRED', 'FARMER', 'DAILY_WAGE');
CREATE TYPE "DisabilityType" AS ENUM ('NONE', 'VISUAL', 'HEARING', 'LOCOMOTOR', 'INTELLECTUAL', 'MULTIPLE', 'OTHER');
CREATE TYPE "SchemeCategory" AS ENUM ('AGRICULTURE', 'EDUCATION', 'HEALTHCARE', 'HOUSING', 'FINANCIAL_INCLUSION', 'WOMEN_CHILD_DEVELOPMENT', 'SOCIAL_SECURITY', 'SKILL_DEVELOPMENT', 'EMPLOYMENT', 'PENSION');
CREATE TYPE "DocumentType" AS ENUM ('AADHAAR', 'INCOME_CERTIFICATE', 'RATION_CARD', 'CASTE_CERTIFICATE', 'DISABILITY_CERTIFICATE', 'LAND_RECORD', 'BANK_PASSBOOK', 'VOTER_ID', 'PAN_CARD', 'OTHER');
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'PROCESSING', 'VERIFIED', 'REJECTED', 'MANUAL_REVIEW');
CREATE TYPE "ApplicationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'ACTION_REQUIRED', 'APPROVED', 'REJECTED', 'WITHDRAWN');
CREATE TYPE "ChannelType" AS ENUM ('EMAIL', 'SMS', 'WHATSAPP', 'IN_APP', 'WEBSOCKET');
CREATE TYPE "OutboxStatus" AS ENUM ('PENDING', 'PROCESSING', 'PUBLISHED', 'FAILED');

-- Tables
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    phone TEXT UNIQUE,
    "passwordHash" TEXT NOT NULL,
    role "Role" NOT NULL DEFAULT 'CITIZEN',
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "mfaSecret" TEXT,
    "googleId" TEXT UNIQUE,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "deletedAt" TIMESTAMPTZ
);

CREATE TABLE public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    "refreshToken" TEXT UNIQUE NOT NULL,
    "deviceInfo" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMPTZ NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.citizen_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" DATE NOT NULL,
    gender "Gender" NOT NULL,
    "maritalStatus" "MaritalStatus" NOT NULL,
    "socialCategory" "SocialCategory" NOT NULL DEFAULT 'GENERAL',
    "employmentStatus" "EmploymentStatus" NOT NULL DEFAULT 'UNEMPLOYED',
    "annualIncomeINR" NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    "disabilityType" "DisabilityType" NOT NULL DEFAULT 'NONE',
    "disabilityPercent" NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    "isBplCardHolder" BOOLEAN NOT NULL DEFAULT false,
    "bplCardNumber" TEXT,
    "aadhaarHash" TEXT UNIQUE,
    "panHash" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "citizenProfileId" UUID UNIQUE NOT NULL REFERENCES public.citizen_profiles(id) ON DELETE CASCADE,
    "streetAddress" TEXT NOT NULL,
    city TEXT NOT NULL,
    district TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    "isRural" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.household_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "citizenProfileId" UUID NOT NULL REFERENCES public.citizen_profiles(id) ON DELETE CASCADE,
    "fullName" TEXT NOT NULL,
    relation TEXT NOT NULL,
    age INT NOT NULL,
    gender "Gender" NOT NULL,
    "isDependent" BOOLEAN NOT NULL DEFAULT true,
    "annualIncomeINR" NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.land_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "citizenProfileId" UUID NOT NULL REFERENCES public.citizen_profiles(id) ON DELETE CASCADE,
    "landSizeAcres" NUMERIC(8,2) NOT NULL,
    "landType" TEXT NOT NULL,
    "surveyNumber" TEXT,
    district TEXT NOT NULL,
    state TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.welfare_schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category "SchemeCategory" NOT NULL,
    department TEXT NOT NULL,
    state TEXT,
    "isCentralScheme" BOOLEAN NOT NULL DEFAULT true,
    "financialBenefit" NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "applicationDeadline" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.eligibility_criteria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "schemeId" UUID NOT NULL REFERENCES public.welfare_schemes(id) ON DELETE CASCADE,
    "attributeKey" TEXT NOT NULL,
    operator TEXT NOT NULL,
    "targetValue" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    description TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.required_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "schemeId" UUID NOT NULL REFERENCES public.welfare_schemes(id) ON DELETE CASCADE,
    "documentType" "DocumentType" NOT NULL,
    "isMandatory" BOOLEAN NOT NULL DEFAULT true,
    description TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.scheme_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "citizenProfileId" UUID NOT NULL REFERENCES public.citizen_profiles(id) ON DELETE CASCADE,
    "schemeId" UUID NOT NULL REFERENCES public.welfare_schemes(id) ON DELETE CASCADE,
    "matchPercentage" NUMERIC(5,2) NOT NULL,
    "estimatedBenefit" NUMERIC(12,2) NOT NULL,
    "isEligible" BOOLEAN NOT NULL,
    "criteriaMet" TEXT[] NOT NULL DEFAULT '{}',
    "missingCriteria" TEXT[] NOT NULL DEFAULT '{}',
    "missingDocuments" "DocumentType"[] NOT NULL DEFAULT '{}',
    "calculatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unq_citizen_scheme UNIQUE ("citizenProfileId", "schemeId")
);

CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    "documentType" "DocumentType" NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "encryptionKeyRef" TEXT,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "uploadedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.ocr_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "documentId" UUID UNIQUE NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    "rawText" TEXT NOT NULL,
    "confidenceScore" NUMERIC(5,4) NOT NULL,
    "extractedData" JSONB NOT NULL,
    "processedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "applicationNo" TEXT UNIQUE NOT NULL,
    "userId" UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    "schemeId" UUID NOT NULL REFERENCES public.welfare_schemes(id) ON DELETE CASCADE,
    status "ApplicationStatus" NOT NULL DEFAULT 'DRAFT',
    "formData" JSONB NOT NULL,
    remarks TEXT,
    "submittedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.outbox_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "aggregateType" TEXT NOT NULL,
    "aggregateId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    payload JSONB NOT NULL,
    status "OutboxStatus" NOT NULL DEFAULT 'PENDING',
    "retryCount" INT NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "processedAt" TIMESTAMPTZ
);

-- Performance Indexes
CREATE INDEX idx_citizens_annual_income ON public.citizen_profiles("annualIncomeINR");
CREATE INDEX idx_citizens_social_category ON public.citizen_profiles("socialCategory");
CREATE INDEX idx_schemes_category_active ON public.welfare_schemes(category, "isActive");
CREATE INDEX idx_recommendations_match ON public.scheme_recommendations("citizenProfileId", "matchPercentage" DESC);
CREATE INDEX idx_applications_user_status ON public.applications("userId", status);
CREATE INDEX idx_documents_user_type ON public.documents("userId", "documentType");
CREATE INDEX idx_outbox_status_created ON public.outbox_events(status, "createdAt");
