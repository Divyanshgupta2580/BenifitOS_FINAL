"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding database with official welfare schemes...');
    const schemes = [
        {
            id: 'a1111111-1111-1111-1111-111111111111',
            code: 'PM-KISAN',
            title: 'Pradhan Mantri Kisan Samman Nidhi',
            description: 'Income support of Rs 6,000 per year in three equal installments of Rs 2,000 directly into Aadhaar-seeded bank accounts to all landholding farmer families.',
            category: 'AGRICULTURE',
            department: 'Department of Agriculture and Farmers Welfare',
            isCentralScheme: true,
            financialBenefit: 6000.0,
            isActive: true,
            rules: [
                {
                    attributeKey: 'employmentStatus',
                    operator: 'EQUALS',
                    targetValue: 'FARMER',
                    isRequired: true,
                    description: 'Must be an engaged landholding farmer',
                },
                {
                    attributeKey: 'hasLand',
                    operator: 'EQUALS',
                    targetValue: 'true',
                    isRequired: true,
                    description: 'Must possess cultivable landholding registered in official land records',
                },
                {
                    attributeKey: 'isAadhaarLinked',
                    operator: 'EQUALS',
                    targetValue: 'true',
                    isRequired: true,
                    description: 'Mandatory Aadhaar e-KYC and NPCI bank account linkage',
                },
            ],
            documents: [
                { documentType: 'AADHAAR', isMandatory: true, description: 'Aadhaar Card for mandatory biometric/OTP e-KYC' },
                { documentType: 'LAND_RECORD', isMandatory: true, description: 'Land Record / Khasra-Khatauni ownership certificate' },
                { documentType: 'BANK_PASSBOOK', isMandatory: true, description: 'Bank Account Passbook for Direct Benefit Transfer' },
            ],
        },
        {
            id: 'b2222222-2222-2222-2222-222222222222',
            code: 'PMAY-GRAMIN',
            title: 'Pradhan Mantri Awas Yojana (PMAY-G)',
            description: 'Housing assistance grant of Rs 1,20,000 (Rs 1,30,000 in hilly/IAP areas) for rural homeless and kutcha-house households identified via SECC/Awaas+.',
            category: 'HOUSING',
            department: 'Ministry of Rural Development',
            isCentralScheme: true,
            financialBenefit: 120000.0,
            isActive: true,
            rules: [
                {
                    attributeKey: 'isRural',
                    operator: 'EQUALS',
                    targetValue: 'true',
                    isRequired: true,
                    description: 'Must reside in a designated rural area',
                },
                {
                    attributeKey: 'age',
                    operator: 'GREATER_EQUAL',
                    targetValue: '18',
                    isRequired: true,
                    description: 'Applicant must be an adult head of household',
                },
                {
                    attributeKey: 'isBplCardHolder',
                    operator: 'EQUALS',
                    targetValue: 'true',
                    isRequired: true,
                    description: 'Must belong to verified SECC/Awaas+ housing deprivation list',
                },
            ],
            documents: [
                { documentType: 'AADHAAR', isMandatory: true, description: 'Aadhaar Card of head of family' },
                { documentType: 'RATION_CARD', isMandatory: true, description: 'Ration Card / SECC priority household proof' },
                { documentType: 'BANK_PASSBOOK', isMandatory: true, description: 'Bank Account Passbook for staged DBT disbursements' },
                { documentType: 'VOTER_ID', isMandatory: false, description: 'Voter ID for residency proof' },
            ],
        },
        {
            id: 'c3333333-3333-3333-3333-333333333333',
            code: 'PM-VIDYA-SCHOLARSHIP',
            title: 'National Means-cum-Merit Scholarship Scheme (NMMSS)',
            description: 'Scholarship of Rs 12,000 per year (Rs 48,000 total across Classes IX to XII) for meritorious students from economically weaker sections studying in Government/Local Body schools.',
            category: 'EDUCATION',
            department: 'Department of School Education and Literacy, Ministry of Education',
            isCentralScheme: true,
            financialBenefit: 48000.0,
            isActive: true,
            rules: [
                {
                    attributeKey: 'employmentStatus',
                    operator: 'EQUALS',
                    targetValue: 'STUDENT',
                    isRequired: true,
                    description: 'Must be an enrolled student in Class IX to XII',
                },
                {
                    attributeKey: 'annualIncomeINR',
                    operator: 'LESS_EQUAL',
                    targetValue: '350000',
                    isRequired: true,
                    description: 'Annual parental income from all sources must not exceed Rs 3,50,000',
                },
            ],
            documents: [
                { documentType: 'EDUCATIONAL_CERTIFICATE', isMandatory: true, description: 'Class VII/VIII qualifying marksheet (min 55% marks, 50% for SC/ST)' },
                { documentType: 'INCOME_CERTIFICATE', isMandatory: true, description: 'Income Certificate issued by competent revenue authority' },
                { documentType: 'AADHAAR', isMandatory: true, description: 'Student Aadhaar Card' },
            ],
        },
        {
            id: 'c4444444-4444-4444-4444-444444444444',
            code: 'UP-POST-MATRIC-SCHOLARSHIP',
            title: 'Uttar Pradesh Post-Matric Scholarship & Fee Reimbursement',
            description: 'State government scholarship and complete tuition reimbursement for students residing in Uttar Pradesh pursuing post-matric studies in recognized institutions.',
            category: 'EDUCATION',
            department: 'Social Welfare Department, Government of Uttar Pradesh',
            state: 'Uttar Pradesh',
            isCentralScheme: false,
            financialBenefit: 50000.0,
            isActive: true,
            rules: [
                {
                    attributeKey: 'employmentStatus',
                    operator: 'EQUALS',
                    targetValue: 'STUDENT',
                    isRequired: true,
                    description: 'Must be a student enrolled in a recognized post-matric course',
                },
                {
                    attributeKey: 'annualIncomeINR',
                    operator: 'LESS_EQUAL',
                    targetValue: '250000',
                    isRequired: true,
                    description: 'Annual family income must not exceed Rs 2,50,000',
                },
            ],
            documents: [
                { documentType: 'EDUCATIONAL_CERTIFICATE', isMandatory: true, description: 'Post-Matric Marksheet or Admission Letter' },
                { documentType: 'INCOME_CERTIFICATE', isMandatory: true, description: 'Income Certificate issued by Tehsildar' },
                { documentType: 'CASTE_CERTIFICATE', isMandatory: false, description: 'Caste Certificate for SC/ST/OBC category applicants' },
                { documentType: 'AADHAAR', isMandatory: true, description: 'Aadhaar Card for identity verification' },
            ],
        },
        {
            id: 'd4444444-4444-4444-4444-444444444444',
            code: 'AYUSHMAN-BHARAT-PMJAY',
            title: 'Ayushman Bharat PM-JAY Health Protection',
            description: 'Cashless health insurance coverage of up to Rs 5,00,000 per family per year for secondary and tertiary hospitalizations across empanelled hospitals nationwide.',
            category: 'HEALTHCARE',
            department: 'National Health Authority',
            isCentralScheme: true,
            financialBenefit: 500000.0,
            isActive: true,
            rules: [
                {
                    attributeKey: 'isSenior70PlusOrBpl',
                    operator: 'EQUALS',
                    targetValue: 'true',
                    isRequired: true,
                    description: 'Must be a senior citizen aged 70+ (universal Ayushman Vay Vandana pathway) or verified BPL/SECC beneficiary',
                },
            ],
            documents: [
                { documentType: 'AADHAAR', isMandatory: true, description: 'Aadhaar Card for biometric/OTP e-KYC' },
                { documentType: 'RATION_CARD', isMandatory: true, description: 'Ration Card / NFSA Card for family entitlement lookup' },
            ],
        },
        {
            id: 'e5555555-5555-5555-5555-555555555555',
            code: 'PM-MUDRA-YOJANA',
            title: 'Pradhan Mantri MUDRA Yojana (PMMY - Shishu Micro-Loan)',
            description: 'Collateral-free institutional micro-credit of up to Rs 50,000 (Shishu tier, with Kishore up to Rs 5 Lakh, Tarun up to Rs 10 Lakh, and Tarun Plus up to Rs 20 Lakh) for non-farm income-generating micro-enterprises.',
            category: 'FINANCIAL_INCLUSION',
            department: 'Department of Financial Services',
            isCentralScheme: true,
            financialBenefit: 50000.0,
            isActive: true,
            rules: [
                {
                    attributeKey: 'age',
                    operator: 'GREATER_EQUAL',
                    targetValue: '18',
                    isRequired: true,
                    description: 'Applicant must be an adult citizen (age >= 18)',
                },
            ],
            documents: [
                { documentType: 'AADHAAR', isMandatory: true, description: 'Aadhaar Card of enterprise owner' },
                { documentType: 'PAN_CARD', isMandatory: true, description: 'PAN Card for commercial banking credit assessment' },
                { documentType: 'BANK_PASSBOOK', isMandatory: true, description: 'Bank Account Statement/Passbook for business transaction history' },
            ],
        },
        {
            id: 'f6666666-6666-6666-6666-666666666666',
            code: 'NSAP-NATIONAL-PENSION',
            title: 'Indira Gandhi National Old Age Pension Scheme (IGNOAPS - NSAP)',
            description: 'Central social assistance pension of Rs 200 per month (Rs 2,400/year for age 60-79, Rs 6,000/year for age 80+) for BPL senior citizens, supplemented by state government top-ups.',
            category: 'SOCIAL_SECURITY',
            department: 'Ministry of Rural Development',
            isCentralScheme: true,
            financialBenefit: 2400.0,
            isActive: true,
            rules: [
                {
                    attributeKey: 'age',
                    operator: 'GREATER_EQUAL',
                    targetValue: '60',
                    isRequired: true,
                    description: 'Senior citizen age must be 60 years or above',
                },
                {
                    attributeKey: 'isBplCardHolder',
                    operator: 'EQUALS',
                    targetValue: 'true',
                    isRequired: true,
                    description: 'Must belong to a household living Below Poverty Line (BPL)',
                },
            ],
            documents: [
                { documentType: 'BIRTH_CERTIFICATE', isMandatory: true, description: 'Birth Certificate or official age proof document' },
                { documentType: 'AADHAAR', isMandatory: true, description: 'Aadhaar Card for identity' },
                { documentType: 'RATION_CARD', isMandatory: true, description: 'BPL Ration Card / SECC deprivation record' },
                { documentType: 'BANK_PASSBOOK', isMandatory: true, description: 'Bank Account Passbook for monthly DBT pension credit' },
            ],
        },
    ];
    for (const s of schemes) {
        const existing = await prisma.welfareScheme.findUnique({ where: { code: s.code } });
        if (existing) {
            await prisma.eligibilityCriteria.deleteMany({ where: { schemeId: existing.id } });
            await prisma.requiredDocument.deleteMany({ where: { schemeId: existing.id } });
            await prisma.welfareScheme.update({
                where: { id: existing.id },
                data: {
                    title: s.title,
                    description: s.description,
                    category: s.category,
                    department: s.department,
                    financialBenefit: s.financialBenefit,
                    isActive: true,
                    isCentralScheme: true,
                    eligibilityRules: {
                        create: s.rules.map((r) => ({
                            attributeKey: r.attributeKey,
                            operator: r.operator,
                            targetValue: r.targetValue,
                            isRequired: r.isRequired,
                            description: r.description,
                        })),
                    },
                    requiredDocuments: {
                        create: s.documents.map((d) => ({
                            documentType: d.documentType,
                            isMandatory: d.isMandatory,
                            description: d.description,
                        })),
                    },
                },
            });
            console.log(`Updated scheme: ${s.code} (${s.title})`);
        }
        else {
            await prisma.welfareScheme.create({
                data: {
                    id: s.id,
                    code: s.code,
                    title: s.title,
                    description: s.description,
                    category: s.category,
                    department: s.department,
                    isCentralScheme: true,
                    financialBenefit: s.financialBenefit,
                    isActive: true,
                    eligibilityRules: {
                        create: s.rules.map((r) => ({
                            attributeKey: r.attributeKey,
                            operator: r.operator,
                            targetValue: r.targetValue,
                            isRequired: r.isRequired,
                            description: r.description,
                        })),
                    },
                    requiredDocuments: {
                        create: s.documents.map((d) => ({
                            documentType: d.documentType,
                            isMandatory: d.isMandatory,
                            description: d.description,
                        })),
                    },
                },
            });
            console.log(`Created scheme: ${s.code} (${s.title})`);
        }
    }
    console.log('✅ Welfare schemes seeded successfully.');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map