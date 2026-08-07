-- BenefitOS Rollback Script for Initial Schema

DROP TABLE IF EXISTS public.outbox_events CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.notification_preferences CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.ai_messages CASCADE;
DROP TABLE IF EXISTS public.ai_conversations CASCADE;
DROP TABLE IF EXISTS public.application_status_histories CASCADE;
DROP TABLE IF EXISTS public.application_documents CASCADE;
DROP TABLE IF EXISTS public.applications CASCADE;
DROP TABLE IF EXISTS public.document_verifications CASCADE;
DROP TABLE IF EXISTS public.ocr_results CASCADE;
DROP TABLE IF EXISTS public.documents CASCADE;
DROP TABLE IF EXISTS public.scheme_recommendations CASCADE;
DROP TABLE IF EXISTS public.required_documents CASCADE;
DROP TABLE IF EXISTS public.eligibility_criteria CASCADE;
DROP TABLE IF EXISTS public.welfare_schemes CASCADE;
DROP TABLE IF EXISTS public.land_details CASCADE;
DROP TABLE IF EXISTS public.household_members CASCADE;
DROP TABLE IF EXISTS public.addresses CASCADE;
DROP TABLE IF EXISTS public.citizen_profiles CASCADE;
DROP TABLE IF EXISTS public.sessions CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

DROP TYPE IF EXISTS "OutboxStatus";
DROP TYPE IF EXISTS "ChannelType";
DROP TYPE IF EXISTS "ApplicationStatus";
DROP TYPE IF EXISTS "VerificationStatus";
DROP TYPE IF EXISTS "DocumentType";
DROP TYPE IF EXISTS "SchemeCategory";
DROP TYPE IF EXISTS "DisabilityType";
DROP TYPE IF EXISTS "EmploymentStatus";
DROP TYPE IF EXISTS "MaritalStatus";
DROP TYPE IF EXISTS "SocialCategory";
DROP TYPE IF EXISTS "Gender";
DROP TYPE IF EXISTS "Role";
