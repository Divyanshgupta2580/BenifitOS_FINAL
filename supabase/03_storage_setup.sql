-- BenefitOS Storage Buckets Configuration Script

-- 1. Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'benefitos-documents',
    'benefitos-documents',
    false,
    10485760, -- 10MB limit
    ARRAY['application/pdf', 'image/jpeg', 'image/png']
) ON CONFLICT (id) DO NOTHING;

-- 2. Bucket RLS Policies
CREATE POLICY "Users can upload own documents" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'benefitos-documents' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can read own documents" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'benefitos-documents' 
        AND (auth.uid()::text = (storage.foldername(name))[1] OR current_setting('request.jwt.claims', true)::json->>'role' IN ('OFFICER', 'ADMIN'))
    );

CREATE POLICY "Users can delete own documents" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'benefitos-documents' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );
