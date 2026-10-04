-- CreateEnum
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'NotificationType') THEN
        CREATE TYPE "NotificationType" AS ENUM ('SCHEME_ELIGIBILITY', 'DOCUMENT_REQUIRED', 'DOCUMENT_VERIFIED', 'DOCUMENT_REJECTED', 'APPLICATION_SUBMITTED', 'APPLICATION_STATUS_CHANGED', 'PROFILE_INCOMPLETE', 'AI_GUIDANCE', 'SYSTEM');
    END IF;
END $$;

-- CreateEnum
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'NotificationSeverity') THEN
        CREATE TYPE "NotificationSeverity" AS ENUM ('INFO', 'SUCCESS', 'WARNING', 'ERROR');
    END IF;
END $$;

-- CreateEnum
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'EligibilityStatus') THEN
        CREATE TYPE "EligibilityStatus" AS ENUM ('NOT_ELIGIBLE', 'PARTIALLY_ELIGIBLE', 'INSUFFICIENT_DATA', 'CLAIM_READY', 'DOCUMENTS_PENDING', 'APPLICATION_READY', 'REVIEW_REQUIRED', 'FUTURE_ELIGIBLE');
    END IF;
END $$;

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "type" "NotificationType" NOT NULL DEFAULT 'SYSTEM';
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "severity" "NotificationSeverity" NOT NULL DEFAULT 'INFO';
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "metadata" JSONB;
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "notifications_userId_createdAt_idx" ON "notifications"("userId", "createdAt");

-- AlterTable
ALTER TABLE "scheme_recommendations" ADD COLUMN IF NOT EXISTS "status" "EligibilityStatus" NOT NULL DEFAULT 'NOT_ELIGIBLE';
ALTER TABLE "scheme_recommendations" ADD COLUMN IF NOT EXISTS "aiValidation" JSONB;
