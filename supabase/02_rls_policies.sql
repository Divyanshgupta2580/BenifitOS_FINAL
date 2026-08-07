-- BenefitOS Supabase Row Level Security (RLS) Policies
-- Strict Zero-Trust Data Isolation Policies

-- Enable RLS on all public tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citizen_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.land_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.welfare_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eligibility_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.required_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheme_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ocr_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- 1. Users RLS Policies
CREATE POLICY "Users can view own account" ON public.users
    FOR SELECT USING (auth.uid() = id OR current_setting('request.jwt.claims', true)::json->>'role' IN ('ADMIN', 'SUPER_ADMIN'));

CREATE POLICY "Users can update own account" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- 2. Citizen Profile RLS Policies
CREATE POLICY "Citizens can view own profile" ON public.citizen_profiles
    FOR SELECT USING (auth.uid() = "userId" OR current_setting('request.jwt.claims', true)::json->>'role' IN ('OFFICER', 'ADMIN', 'AUDITOR'));

CREATE POLICY "Citizens can insert/update own profile" ON public.citizen_profiles
    FOR ALL USING (auth.uid() = "userId");

-- 3. Address RLS Policies
CREATE POLICY "Citizens can access own address" ON public.addresses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.citizen_profiles 
            WHERE citizen_profiles.id = addresses."citizenProfileId" 
            AND citizen_profiles."userId" = auth.uid()
        )
    );

-- 4. Household Members RLS Policies
CREATE POLICY "Citizens can access own household" ON public.household_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.citizen_profiles 
            WHERE citizen_profiles.id = household_members."citizenProfileId" 
            AND citizen_profiles."userId" = auth.uid()
        )
    );

-- 5. Welfare Schemes RLS Policies (Public Read for Active Schemes)
CREATE POLICY "Public can view active schemes" ON public.welfare_schemes
    FOR SELECT USING ("isActive" = true OR current_setting('request.jwt.claims', true)::json->>'role' IN ('ADMIN', 'OFFICER'));

CREATE POLICY "Admins can manage schemes" ON public.welfare_schemes
    FOR ALL USING (current_setting('request.jwt.claims', true)::json->>'role' IN ('ADMIN', 'SUPER_ADMIN'));

-- 6. Scheme Recommendations RLS Policies
CREATE POLICY "Citizens can view own recommendations" ON public.scheme_recommendations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.citizen_profiles 
            WHERE citizen_profiles.id = scheme_recommendations."citizenProfileId" 
            AND citizen_profiles."userId" = auth.uid()
        )
    );

-- 7. Documents RLS Policies
CREATE POLICY "Citizens can access own documents" ON public.documents
    FOR ALL USING (auth.uid() = "userId" OR current_setting('request.jwt.claims', true)::json->>'role' IN ('OFFICER', 'ADMIN'));

-- 8. Applications RLS Policies
CREATE POLICY "Citizens can access own applications" ON public.applications
    FOR ALL USING (auth.uid() = "userId" OR current_setting('request.jwt.claims', true)::json->>'role' IN ('OFFICER', 'ADMIN'));
