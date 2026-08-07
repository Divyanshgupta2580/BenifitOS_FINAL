-- BenefitOS Seed Data Script

-- 1. Insert Initial Welfare Schemes
INSERT INTO public.welfare_schemes (id, code, title, description, category, department, state, "isCentralScheme", "financialBenefit", "isActive")
VALUES 
(
    'a1111111-1111-1111-1111-111111111111',
    'PM-KISAN',
    'Pradhan Mantri Kisan Samman Nidhi',
    'Financial assistance of Rs 6,000 per year to small and marginal farmers.',
    'AGRICULTURE',
    'Ministry of Agriculture and Farmers Welfare',
    NULL,
    true,
    6000.00,
    true
),
(
    'b2222222-2222-2222-2222-222222222222',
    'PMAY-U',
    'Pradhan Mantri Awas Yojana - Urban',
    'Housing subsidy for Economically Weaker Sections (EWS) and Low Income Groups (LIG).',
    'HOUSING',
    'Ministry of Housing and Urban Affairs',
    NULL,
    true,
    250000.00,
    true
),
(
    'c3333333-3333-3333-3333-333333333333',
    'PM-AYUSHMAN',
    'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana',
    'Health coverage of up to Rs 5 Lakh per family per year for secondary and tertiary care.',
    'HEALTHCARE',
    'Ministry of Health and Family Welfare',
    NULL,
    true,
    500000.00,
    true
)
ON CONFLICT (code) DO NOTHING;

-- 2. Insert Eligibility Criteria for PM-KISAN
INSERT INTO public.eligibility_criteria (id, "schemeId", "attributeKey", operator, "targetValue", "isRequired", description)
VALUES
(
    'e1111111-1111-1111-1111-111111111111',
    'a1111111-1111-1111-1111-111111111111',
    'employmentStatus',
    'EQUALS',
    'FARMER',
    true,
    'Must be an active farmer'
),
(
    'e2222222-2222-2222-2222-222222222222',
    'a1111111-1111-1111-1111-111111111111',
    'annualIncomeINR',
    'LESS_THAN',
    '300000',
    true,
    'Annual income must be less than Rs 3,00,000'
)
ON CONFLICT (id) DO NOTHING;
