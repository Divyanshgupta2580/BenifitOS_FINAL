-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "CacheStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'INVALIDATED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "ai_response_cache" (
    "id" TEXT NOT NULL,
    "cacheKey" TEXT NOT NULL,
    "userId" TEXT,
    "schemeId" TEXT,
    "useCase" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "metadata" JSONB,
    "language" TEXT NOT NULL DEFAULT 'en',
    "promptVersion" TEXT NOT NULL DEFAULT 'v1.0',
    "status" "CacheStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "invalidatedAt" TIMESTAMP(3),

    CONSTRAINT "ai_response_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ai_response_cache_cacheKey_key" ON "ai_response_cache"("cacheKey");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ai_response_cache_cacheKey_status_idx" ON "ai_response_cache"("cacheKey", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ai_response_cache_userId_status_idx" ON "ai_response_cache"("userId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ai_response_cache_schemeId_status_idx" ON "ai_response_cache"("schemeId", "status");
