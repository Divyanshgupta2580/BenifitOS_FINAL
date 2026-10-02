"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var WelfareSchemeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WelfareSchemeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infrastructure/database/prisma.service");
let WelfareSchemeService = WelfareSchemeService_1 = class WelfareSchemeService {
    schemeRepo;
    prisma;
    logger = new common_1.Logger(WelfareSchemeService_1.name);
    constructor(schemeRepo, prisma) {
        this.schemeRepo = schemeRepo;
        this.prisma = prisma;
    }
    async onModuleInit() {
        try {
            const count = await this.prisma.client.welfareScheme.count();
            if (count < 6) {
                this.logger.log('Synchronizing official welfare schemes catalog into database...');
                const defaultSchemes = [
                    {
                        id: 'a1111111-1111-1111-1111-111111111111',
                        code: 'PM-KISAN',
                        title: 'Pradhan Mantri Kisan Samman Nidhi',
                        description: 'Income support of Rs 6,000 per year in three equal installments to all landholding farmer families.',
                        category: 'AGRICULTURE',
                        department: 'Ministry of Agriculture and Farmers Welfare',
                        isCentralScheme: true,
                        financialBenefit: 6000.0,
                        sourceUrl: 'https://pmkisan.gov.in',
                        sourceName: 'PM-KISAN Official Portal (Ministry of Agriculture and Farmers Welfare)',
                        sourceType: 'OFFICIAL_PORTAL',
                        lastVerifiedAt: '2026-10-01T00:00:00.000Z',
                        verificationStatus: 'VERIFIED',
                        benefitType: 'DIRECT_BENEFIT_TRANSFER',
                        applicationUrl: 'https://pmkisan.gov.in/RegistrationFormNew.aspx',
                        applicationMode: 'ONLINE',
                        applicationProcedure: '1. Visit PM-KISAN official portal. 2. Navigate to Farmers Corner -> New Farmer Registration. 3. Enter Aadhaar number and mobile number. 4. Enter land record / Khasra details and bank account. 5. Submit for district verification.',
                        rules: [
                            { attributeKey: 'employmentStatus', operator: 'EQUALS', targetValue: 'FARMER', isRequired: true, description: 'Must be an engaged landholding farmer' },
                            { attributeKey: 'hasLand', operator: 'EQUALS', targetValue: 'true', isRequired: true, description: 'Must possess cultivable landholding registered in official land records' },
                            { attributeKey: 'isAadhaarLinked', operator: 'EQUALS', targetValue: 'true', isRequired: true, description: 'Mandatory Aadhaar e-KYC and NPCI bank account linkage' },
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
                        sourceUrl: 'https://pmayg.nic.in',
                        sourceName: 'Pradhan Mantri Awaas Yojana - Gramin Portal (Ministry of Rural Development)',
                        sourceType: 'OFFICIAL_PORTAL',
                        lastVerifiedAt: '2026-10-01T00:00:00.000Z',
                        verificationStatus: 'VERIFIED',
                        benefitType: 'HOUSING_GRANT',
                        applicationUrl: 'https://pmayg.nic.in/netiay/AwaasPlus.aspx',
                        applicationMode: 'HYBRID',
                        applicationProcedure: '1. Identification through Gram Sabha prioritized SECC/Awaas+ list. 2. Geo-tagging of existing non-pucca house by field inspector. 3. Verification of Aadhaar and bank account. 4. Construction grant released in staged DBT installments linked to geo-tagged progress.',
                        rules: [
                            { attributeKey: 'isRural', operator: 'EQUALS', targetValue: 'true', isRequired: true, description: 'Must reside in a designated rural area' },
                            { attributeKey: 'age', operator: 'GREATER_EQUAL', targetValue: '18', isRequired: true, description: 'Applicant must be an adult head of household' },
                            { attributeKey: 'isBplCardHolder', operator: 'EQUALS', targetValue: 'true', isRequired: true, description: 'Must belong to verified SECC/Awaas+ housing deprivation list' },
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
                        sourceUrl: 'https://scholarships.gov.in',
                        sourceName: 'National Scholarship Portal (Department of School Education & Literacy, MoE)',
                        sourceType: 'NATIONAL_PORTAL',
                        lastVerifiedAt: '2026-10-01T00:00:00.000Z',
                        verificationStatus: 'VERIFIED',
                        benefitType: 'SCHOLARSHIP',
                        applicationUrl: 'https://scholarships.gov.in/fresh/newstdRegfrmInstruction',
                        applicationMode: 'ONLINE',
                        applicationProcedure: '1. Register on National Scholarship Portal (NSP). 2. Submit student Aadhaar and school U-DISE verification code. 3. Provide Class VII qualifying marksheet (min 55%, 50% for SC/ST) and parental income certificate. 4. School and district nodal officer verify online application.',
                        rules: [
                            { attributeKey: 'employmentStatus', operator: 'EQUALS', targetValue: 'STUDENT', isRequired: true, description: 'Must be an enrolled student in Class IX to XII' },
                            { attributeKey: 'annualIncomeINR', operator: 'LESS_EQUAL', targetValue: '350000', isRequired: true, description: 'Annual parental income from all sources must not exceed Rs 3,50,000' },
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
                        sourceUrl: 'https://scholarship.up.gov.in',
                        sourceName: 'UP Scholarship & Fee Reimbursement Online System (Social Welfare Department, UP)',
                        sourceType: 'STATE_PORTAL',
                        lastVerifiedAt: '2026-10-01T00:00:00.000Z',
                        verificationStatus: 'VERIFIED',
                        benefitType: 'SCHOLARSHIP',
                        applicationUrl: 'https://scholarship.up.gov.in/index.aspx',
                        applicationMode: 'ONLINE',
                        applicationProcedure: '1. Register on UP Scholarship portal with High School roll number and Aadhaar. 2. Fill post-matric institution and course fee details. 3. Upload income certificate and caste certificate. 4. Submit hard copy to institution for forward verification.',
                        rules: [
                            { attributeKey: 'employmentStatus', operator: 'EQUALS', targetValue: 'STUDENT', isRequired: true, description: 'Must be a student enrolled in a recognized post-matric course' },
                            { attributeKey: 'annualIncomeINR', operator: 'LESS_EQUAL', targetValue: '250000', isRequired: true, description: 'Annual family income must not exceed Rs 2,50,000' },
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
                        sourceUrl: 'https://nha.gov.in',
                        sourceName: 'National Health Authority (Ministry of Health and Family Welfare)',
                        sourceType: 'CENTRAL_PORTAL',
                        lastVerifiedAt: '2026-10-01T00:00:00.000Z',
                        verificationStatus: 'VERIFIED',
                        benefitType: 'HEALTH_COVER',
                        applicationUrl: 'https://beneficiary.nha.gov.in',
                        applicationMode: 'ONLINE',
                        applicationProcedure: '1. Access the NHA Beneficiary Portal or visit nearest empaneled hospital / CSC. 2. Authenticate using Aadhaar e-KYC. 3. Check family inclusion in SECC beneficiary database or 70+ Senior Citizen enrollment. 4. Generate and download Ayushman Card.',
                        rules: [
                            { attributeKey: 'isSenior70PlusOrBpl', operator: 'EQUALS', targetValue: 'true', isRequired: true, description: 'Must be a senior citizen aged 70+ (universal Ayushman Vay Vandana pathway) or verified BPL/SECC beneficiary' },
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
                        sourceUrl: 'https://www.mudra.org.in',
                        sourceName: 'Micro Units Development & Refinance Agency Portal (Department of Financial Services, MoF)',
                        sourceType: 'MINISTRY_PORTAL',
                        lastVerifiedAt: '2026-10-01T00:00:00.000Z',
                        verificationStatus: 'VERIFIED',
                        benefitType: 'COLLATERAL_FREE_LOAN',
                        applicationUrl: 'https://udyamimitra.in',
                        applicationMode: 'ONLINE',
                        applicationProcedure: '1. Prepare business proposal and enterprise identification details. 2. Apply online via Udyami Mitra portal or visit nearest commercial/RRB bank branch. 3. Submit Shishu/Kishore loan application with Aadhaar, PAN, and address proof. 4. Sanction and disbursement directly to business account.',
                        rules: [
                            { attributeKey: 'age', operator: 'GREATER_EQUAL', targetValue: '18', isRequired: true, description: 'Applicant must be an adult citizen (age >= 18)' },
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
                        description: 'Central social assistance pension of Rs 200 per month (Rs 2,400/year for age 60-79, Rs 6,00,0/year for age 80+) for BPL senior citizens, supplemented by state government top-ups.',
                        category: 'SOCIAL_SECURITY',
                        department: 'Ministry of Rural Development',
                        isCentralScheme: true,
                        financialBenefit: 2400.0,
                        sourceUrl: 'https://nsap.nic.in',
                        sourceName: 'National Social Assistance Programme Portal (Ministry of Rural Development)',
                        sourceType: 'OFFICIAL_PORTAL',
                        lastVerifiedAt: '2026-10-01T00:00:00.000Z',
                        verificationStatus: 'VERIFIED',
                        benefitType: 'MONTHLY_PENSION',
                        applicationUrl: 'https://nsap.nic.in/citizenRegistration.do',
                        applicationMode: 'HYBRID',
                        applicationProcedure: '1. Submit application online via NSAP portal or submit form at Block/Tehsil Social Welfare office. 2. Provide age proof (Birth certificate/Aadhaar) and BPL income verification. 3. Verification by Gram Panchayat / Urban local body. 4. Monthly pension sanctioned via DBT.',
                        rules: [
                            { attributeKey: 'age', operator: 'GREATER_EQUAL', targetValue: '60', isRequired: true, description: 'Senior citizen age must be 60 years or above' },
                            { attributeKey: 'isBplCardHolder', operator: 'EQUALS', targetValue: 'true', isRequired: true, description: 'Must belong to a household living Below Poverty Line (BPL)' },
                        ],
                        documents: [
                            { documentType: 'BIRTH_CERTIFICATE', isMandatory: true, description: 'Birth Certificate or official age proof document' },
                            { documentType: 'AADHAAR', isMandatory: true, description: 'Aadhaar Card for identity' },
                            { documentType: 'RATION_CARD', isMandatory: true, description: 'BPL Ration Card / SECC deprivation record' },
                            { documentType: 'BANK_PASSBOOK', isMandatory: true, description: 'Bank Account Passbook for monthly DBT pension credit' },
                        ],
                    },
                ];
                for (const s of defaultSchemes) {
                    const exists = await this.prisma.client.welfareScheme.findUnique({ where: { code: s.code } });
                    if (!exists) {
                        await this.prisma.client.welfareScheme.create({
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
                    }
                }
                this.logger.log('✅ Welfare schemes catalog initialized successfully.');
            }
        }
        catch (err) {
            this.logger.warn(`Welfare scheme catalog sync notice: ${err?.message}`);
        }
    }
    async getAllSchemes(category, state) {
        return await this.schemeRepo.findAllActive(category, state);
    }
    async getSchemeById(id) {
        const scheme = await this.schemeRepo.findById(id);
        if (!scheme) {
            throw new common_1.NotFoundException(`Welfare scheme with ID '${id}' not found.`);
        }
        return scheme;
    }
};
exports.WelfareSchemeService = WelfareSchemeService;
exports.WelfareSchemeService = WelfareSchemeService = WelfareSchemeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('IWelfareSchemeRepository')),
    __metadata("design:paramtypes", [Object, prisma_service_1.PrismaService])
], WelfareSchemeService);
//# sourceMappingURL=welfare.service.js.map