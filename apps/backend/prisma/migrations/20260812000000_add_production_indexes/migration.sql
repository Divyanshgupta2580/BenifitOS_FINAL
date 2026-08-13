-- CreateIndex
CREATE INDEX IF NOT EXISTS "documents_userId_idx" ON "documents"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "documents_userId_documentType_idx" ON "documents"("userId", "documentType");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "applications_userId_idx" ON "applications"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "applications_userId_status_idx" ON "applications"("userId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "outbox_events_status_idx" ON "outbox_events"("status");
