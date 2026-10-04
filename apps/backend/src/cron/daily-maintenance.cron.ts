/**
 * ============================================================================
 * BENEFITOS PRODUCTION-GRADE SCHEDULED CRON JOB: DAILY MAINTENANCE & SYNC
 * ============================================================================
 * 
 * Target: Render Cron Job (type: cron)
 * Default Schedule: 0 2 * * * (02:00 UTC daily)
 * Command: npm run cron:daily-maintenance
 * 
 * Operations:
 * 1. Government Welfare Schemes Catalog Synchronization & Deadline Checks
 * 2. Expired & Revoked Security Session Pruning
 * 3. Processed Outbox Events Archival / Cleanup
 * 4. Stale Citizen Scheme Recommendation Refresh
 * ============================================================================
 */

import { PrismaClient, SchemeCategory, DocumentType } from '@prisma/client';
import * as dotenv from 'dotenv';

// Load environment variables if running locally or in development
dotenv.config();

export interface CronExecutionResult {
  jobName: string;
  status: 'SUCCESS' | 'FAILED';
  startedAt: string;
  completedAt: string;
  durationMs: number;
  schemesProcessed: number;
  schemesCreated: number;
  schemesUpdated: number;
  sessionsPruned: number;
  outboxEventsPurged: number;
  recommendationsRefreshed: number;
  errorMessage?: string;
}

export const CANONICAL_WELFARE_SCHEMES = [
  {
    id: 'a1111111-1111-1111-1111-111111111111',
    code: 'PM-KISAN',
    title: 'Pradhan Mantri Kisan Samman Nidhi',
    description: 'Income support of Rs 6,000 per year in three equal installments of Rs 2,000 directly into Aadhaar-seeded bank accounts to all landholding farmer families.',
    category: 'AGRICULTURE' as SchemeCategory,
    department: 'Department of Agriculture and Farmers Welfare',
    isCentralScheme: true,
    financialBenefit: 6000.0,
    isActive: true,
    sourceUrl: 'https://pmkisan.gov.in',
    sourceName: 'PM-KISAN Official Portal (Department of Agriculture and Farmers Welfare)',
    sourceType: 'OFFICIAL_PORTAL',
    lastVerifiedAt: '2026-10-01T00:00:00.000Z',
    verificationStatus: 'VERIFIED',
    benefitType: 'DIRECT_BENEFIT_TRANSFER',
    applicationUrl: 'https://pmkisan.gov.in/RegistrationFormNew.aspx',
    applicationMode: 'ONLINE',
    applicationProcedure: '1. Visit PM-KISAN official portal. 2. Navigate to Farmers Corner -> New Farmer Registration. 3. Enter Aadhaar number and mobile number for e-KYC. 4. Enter land record / Khasra-Khatauni details and bank account. 5. State nodal officer verifies landholding records.',
    rules: [
      { attributeKey: 'employmentStatus', operator: 'EQUALS', targetValue: 'FARMER', isRequired: true, description: 'Must be an engaged landholding farmer' },
      { attributeKey: 'hasLand', operator: 'EQUALS', targetValue: 'true', isRequired: true, description: 'Must possess cultivable landholding registered in official land records' },
      { attributeKey: 'isAadhaarLinked', operator: 'EQUALS', targetValue: 'true', isRequired: true, description: 'Mandatory Aadhaar e-KYC and NPCI bank account linkage' },
    ],
    documents: [
      { documentType: 'AADHAAR' as DocumentType, isMandatory: true, description: 'Aadhaar Card for mandatory biometric/OTP e-KYC' },
      { documentType: 'LAND_RECORD' as DocumentType, isMandatory: true, description: 'Land Record / Khasra-Khatauni ownership certificate' },
      { documentType: 'BANK_PASSBOOK' as DocumentType, isMandatory: true, description: 'Bank Account Passbook for Direct Benefit Transfer' },
    ],
  },
  {
    id: 'b2222222-2222-2222-2222-222222222222',
    code: 'PMAY-GRAMIN',
    title: 'Pradhan Mantri Awas Yojana (PMAY-G)',
    description: 'Housing assistance grant of Rs 1,20,000 (Rs 1,30,000 in hilly/IAP areas) for rural homeless and kutcha-house households identified via SECC/Awaas+.',
    category: 'HOUSING' as SchemeCategory,
    department: 'Ministry of Rural Development',
    isCentralScheme: true,
    financialBenefit: 120000.0,
    isActive: true,
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
      { documentType: 'AADHAAR' as DocumentType, isMandatory: true, description: 'Aadhaar Card of head of family' },
      { documentType: 'RATION_CARD' as DocumentType, isMandatory: true, description: 'Ration Card / SECC priority household proof' },
      { documentType: 'BANK_PASSBOOK' as DocumentType, isMandatory: true, description: 'Bank Account Passbook for staged DBT disbursements' },
      { documentType: 'VOTER_ID' as DocumentType, isMandatory: false, description: 'Voter ID for residency proof' },
    ],
  },
  {
    id: 'c3333333-3333-3333-3333-333333333333',
    code: 'PM-VIDYA-SCHOLARSHIP',
    title: 'National Means-cum-Merit Scholarship Scheme (NMMSS)',
    description: 'Scholarship of Rs 12,00,0 per year (Rs 48,000 total across Classes IX to XII) for meritorious students from economically weaker sections studying in Government/Local Body schools.',
    category: 'EDUCATION' as SchemeCategory,
    department: 'Department of School Education and Literacy, Ministry of Education',
    isCentralScheme: true,
    financialBenefit: 48000.0,
    isActive: true,
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
      { documentType: 'EDUCATIONAL_CERTIFICATE' as DocumentType, isMandatory: true, description: 'Class VII/VIII qualifying marksheet (min 55% marks, 50% for SC/ST)' },
      { documentType: 'INCOME_CERTIFICATE' as DocumentType, isMandatory: true, description: 'Income Certificate issued by competent revenue authority' },
      { documentType: 'AADHAAR' as DocumentType, isMandatory: true, description: 'Student Aadhaar Card' },
    ],
  },
  {
    id: 'c4444444-4444-4444-4444-444444444444',
    code: 'UP-POST-MATRIC-SCHOLARSHIP',
    title: 'Uttar Pradesh Post-Matric Scholarship & Fee Reimbursement',
    description: 'State government scholarship and complete tuition reimbursement for students residing in Uttar Pradesh pursuing post-matric studies in recognized institutions.',
    category: 'EDUCATION' as SchemeCategory,
    department: 'Social Welfare Department, Government of Uttar Pradesh',
    state: 'Uttar Pradesh',
    isCentralScheme: false,
    financialBenefit: 50000.0,
    isActive: true,
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
      { documentType: 'EDUCATIONAL_CERTIFICATE' as DocumentType, isMandatory: true, description: 'Post-Matric Marksheet or Admission Letter' },
      { documentType: 'INCOME_CERTIFICATE' as DocumentType, isMandatory: true, description: 'Income Certificate issued by Tehsildar' },
      { documentType: 'CASTE_CERTIFICATE' as DocumentType, isMandatory: false, description: 'Caste Certificate for SC/ST/OBC category applicants' },
      { documentType: 'AADHAAR' as DocumentType, isMandatory: true, description: 'Aadhaar Card for identity verification' },
    ],
  },
  {
    id: 'd4444444-4444-4444-4444-444444444444',
    code: 'AYUSHMAN-BHARAT-PMJAY',
    title: 'Ayushman Bharat PM-JAY Health Protection',
    description: 'Cashless health insurance coverage of up to Rs 5,00,000 per family per year for secondary and tertiary hospitalizations across empanelled hospitals nationwide.',
    category: 'HEALTHCARE' as SchemeCategory,
    department: 'National Health Authority',
    isCentralScheme: true,
    financialBenefit: 500000.0,
    isActive: true,
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
      { documentType: 'AADHAAR' as DocumentType, isMandatory: true, description: 'Aadhaar Card for biometric/OTP e-KYC' },
      { documentType: 'RATION_CARD' as DocumentType, isMandatory: true, description: 'Ration Card / NFSA Card for family entitlement lookup' },
    ],
  },
  {
    id: 'e5555555-5555-5555-5555-555555555555',
    code: 'PM-MUDRA-YOJANA',
    title: 'Pradhan Mantri MUDRA Yojana (PMMY - Shishu Micro-Loan)',
    description: 'Collateral-free institutional micro-credit of up to Rs 50,000 (Shishu tier, with Kishore up to Rs 5 Lakh, Tarun up to Rs 10 Lakh, and Tarun Plus up to Rs 20 Lakh) for non-farm income-generating micro-enterprises.',
    category: 'FINANCIAL_INCLUSION' as SchemeCategory,
    department: 'Department of Financial Services',
    isCentralScheme: true,
    financialBenefit: 50000.0,
    isActive: true,
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
      { documentType: 'AADHAAR' as DocumentType, isMandatory: true, description: 'Aadhaar Card of enterprise owner' },
      { documentType: 'PAN_CARD' as DocumentType, isMandatory: true, description: 'PAN Card for commercial banking credit assessment' },
      { documentType: 'BANK_PASSBOOK' as DocumentType, isMandatory: true, description: 'Bank Account Statement/Passbook for business transaction history' },
    ],
  },
  {
    id: 'f6666666-6666-6666-6666-666666666666',
    code: 'NSAP-NATIONAL-PENSION',
    title: 'Indira Gandhi National Old Age Pension Scheme (IGNOAPS - NSAP)',
    description: 'Central social assistance pension of Rs 200 per month (Rs 2,400/year for age 60-79, Rs 6,000/year for age 80+) for BPL senior citizens, supplemented by state government top-ups.',
    category: 'SOCIAL_SECURITY' as SchemeCategory,
    department: 'Ministry of Rural Development',
    isCentralScheme: true,
    financialBenefit: 2400.0,
    isActive: true,
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
      { documentType: 'BIRTH_CERTIFICATE' as DocumentType, isMandatory: true, description: 'Birth Certificate or official age proof document' },
      { documentType: 'AADHAAR' as DocumentType, isMandatory: true, description: 'Aadhaar Card for identity' },
      { documentType: 'RATION_CARD' as DocumentType, isMandatory: true, description: 'BPL Ration Card / SECC deprivation record' },
      { documentType: 'BANK_PASSBOOK' as DocumentType, isMandatory: true, description: 'Bank Account Passbook for monthly DBT pension credit' },
    ],
  },
];

export async function runDailyMaintenance(
  prismaOverride?: PrismaClient,
  options?: { maxProfiles?: number },
): Promise<CronExecutionResult> {
  const prisma = prismaOverride || new PrismaClient();
  const startTime = Date.now();
  const startedAt = new Date().toISOString();

  console.log('============================================================');
  console.log('[CRON] BENEFITOS SCHEDULED MAINTENANCE JOB');
  console.log('[CRON] Job Name   : daily-maintenance');
  console.log(`[CRON] Started At : ${startedAt}`);
  console.log('============================================================');

  let schemesProcessed = 0;
  let schemesCreated = 0;
  let schemesUpdated = 0;
  let sessionsPruned = 0;
  let outboxEventsPurged = 0;
  let recommendationsRefreshed = 0;

  try {
    // ------------------------------------------------------------------------
    // TASK 1: Government Welfare Schemes Catalog Synchronization & Verification
    // ------------------------------------------------------------------------
    console.log('[CRON] 1. Synchronizing Government Welfare Scheme Catalog...');
    await Promise.all(
      CANONICAL_WELFARE_SCHEMES.map(async (schemeDef) => {
        schemesProcessed++;
        const existing = await prisma.welfareScheme.findUnique({
          where: { code: schemeDef.code },
          include: { eligibilityRules: true, requiredDocuments: true },
        });

        if (!existing) {
          await prisma.welfareScheme.create({
            data: {
              id: schemeDef.id,
              code: schemeDef.code,
              title: schemeDef.title,
              description: schemeDef.description,
              category: schemeDef.category,
              department: schemeDef.department,
              state: schemeDef.state || null,
              isCentralScheme: schemeDef.isCentralScheme,
              financialBenefit: schemeDef.financialBenefit,
              isActive: schemeDef.isActive,
              eligibilityRules: {
                create: schemeDef.rules.map((r) => ({
                  attributeKey: r.attributeKey,
                  operator: r.operator,
                  targetValue: r.targetValue,
                  isRequired: r.isRequired,
                  description: r.description,
                })),
              },
              requiredDocuments: {
                create: schemeDef.documents.map((d) => ({
                  documentType: d.documentType,
                  isMandatory: d.isMandatory,
                  description: d.description,
                })),
              },
            },
          });
          schemesCreated++;
        } else {
          // Idempotent update: update scheme metadata and refresh rules in a transaction
          await prisma.$transaction([
            prisma.welfareScheme.update({
              where: { id: existing.id },
              data: {
                title: schemeDef.title,
                description: schemeDef.description,
                category: schemeDef.category,
                department: schemeDef.department,
                state: schemeDef.state || null,
                isCentralScheme: schemeDef.isCentralScheme,
                financialBenefit: schemeDef.financialBenefit,
                isActive: schemeDef.isActive,
              },
            }),
            prisma.eligibilityCriteria.deleteMany({ where: { schemeId: existing.id } }),
            prisma.requiredDocument.deleteMany({ where: { schemeId: existing.id } }),
            prisma.eligibilityCriteria.createMany({
              data: schemeDef.rules.map((r) => ({
                schemeId: existing.id,
                attributeKey: r.attributeKey,
                operator: r.operator,
                targetValue: r.targetValue,
                isRequired: r.isRequired,
                description: r.description,
              })),
            }),
            prisma.requiredDocument.createMany({
              data: schemeDef.documents.map((d) => ({
                schemeId: existing.id,
                documentType: d.documentType,
                isMandatory: d.isMandatory,
                description: d.description,
              })),
            }),
          ]);
          schemesUpdated++;
        }
      })
    );

    // Check deadlines: de-activate any scheme with past applicationDeadline
    const now = new Date();
    await prisma.welfareScheme.updateMany({
      where: {
        applicationDeadline: { lt: now },
        isActive: true,
      },
      data: { isActive: false },
    });

    console.log(`[CRON]    -> Processed: ${schemesProcessed} | Created: ${schemesCreated} | Updated: ${schemesUpdated}`);

    // ------------------------------------------------------------------------
    // TASK 2: Prune Expired & Revoked Sessions
    // ------------------------------------------------------------------------
    console.log('[CRON] 2. Pruning Expired / Revoked Security Sessions...');
    const pruned = await prisma.session.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: now } },
          { isRevoked: true, updatedAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
        ],
      },
    });
    sessionsPruned = pruned.count;
    console.log(`[CRON]    -> Pruned: ${sessionsPruned} expired/revoked sessions`);

    // ------------------------------------------------------------------------
    // TASK 3: Clean Processed Outbox Events (> 7 Days Old)
    // ------------------------------------------------------------------------
    console.log('[CRON] 3. Archiving Processed Outbox Events...');
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const purged = await prisma.outboxEvent.deleteMany({
      where: {
        status: 'PUBLISHED',
        processedAt: { lt: sevenDaysAgo },
      },
    });
    outboxEventsPurged = purged.count;
    console.log(`[CRON]    -> Purged: ${outboxEventsPurged} processed outbox events`);

    // ------------------------------------------------------------------------
    // TASK 4: Refresh Citizen Scheme Recommendations
    // ------------------------------------------------------------------------
    console.log('[CRON] 4. Synchronizing Citizen Scheme Recommendations...');
    const profiles = await prisma.citizenProfile.findMany({
      include: {
        address: true,
      },
      take: options?.maxProfiles !== undefined ? options.maxProfiles : 100, // Batch process active profiles
    });

    const activeSchemes = await prisma.welfareScheme.findMany({
      where: { isActive: true },
      include: { eligibilityRules: true, requiredDocuments: true },
    });

    // Process profiles concurrently in batches of 10 for maximum performance
    const BATCH_SIZE = 10;
    for (let i = 0; i < profiles.length; i += BATCH_SIZE) {
      const batch = profiles.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map(async (profile) => {
          const birthYear = profile.dateOfBirth ? profile.dateOfBirth.getFullYear() : 2000;
          const calculatedAge = new Date().getFullYear() - birthYear;

          const upsertPromises = activeSchemes.map((scheme) => {
            const criteriaMet: string[] = [];
            const missingCriteria: string[] = [];

            // State validation
            if (!scheme.isCentralScheme && scheme.state) {
              const profileState = (profile.address?.state || '').trim().toUpperCase();
              const schemeState = scheme.state.trim().toUpperCase();
              if (profileState === schemeState) {
                criteriaMet.push(`Resident of ${scheme.state}`);
              } else {
                missingCriteria.push(`Scheme is restricted to residents of ${scheme.state}`);
              }
            }

            // Rule validation
            for (const rule of scheme.eligibilityRules) {
              let val: any = null;
              if (rule.attributeKey === 'age') val = calculatedAge;
              else if (rule.attributeKey === 'annualIncomeINR') val = profile.annualIncomeINR;
              else if (rule.attributeKey === 'employmentStatus') val = profile.employmentStatus;
              else if (rule.attributeKey === 'socialCategory') val = profile.socialCategory;
              else if (rule.attributeKey === 'gender') val = profile.gender;

              if (val === null || val === undefined) {
                missingCriteria.push(`Missing profile data: ${rule.description || rule.attributeKey}`);
                continue;
              }

              let isMet = false;
              if (rule.operator === 'EQUALS') isMet = String(val).toUpperCase() === String(rule.targetValue).toUpperCase();
              else if (rule.operator === 'LESS_EQUAL') isMet = Number(val) <= Number(rule.targetValue);
              else if (rule.operator === 'GREATER_EQUAL') isMet = Number(val) >= Number(rule.targetValue);
              else if (rule.operator === 'GREATER_THAN') isMet = Number(val) > Number(rule.targetValue);
              else if (rule.operator === 'LESS_THAN') isMet = Number(val) < Number(rule.targetValue);

              if (isMet) criteriaMet.push(rule.description || rule.attributeKey);
              else missingCriteria.push(rule.description || `Fails requirement: ${rule.attributeKey}`);
            }

            const totalRules = scheme.eligibilityRules.length + (!scheme.isCentralScheme && scheme.state ? 1 : 0);
            const matchPercentage = totalRules > 0 ? Math.round((criteriaMet.length / totalRules) * 100) : 100;
            const isEligible = missingCriteria.length === 0;

            return prisma.schemeRecommendation.upsert({
              where: {
                citizenProfileId_schemeId: {
                  citizenProfileId: profile.id,
                  schemeId: scheme.id,
                },
              },
              create: {
                citizenProfileId: profile.id,
                schemeId: scheme.id,
                matchPercentage,
                estimatedBenefit: isEligible ? scheme.financialBenefit : 0,
                isEligible,
                criteriaMet,
                missingCriteria,
                missingDocuments: scheme.requiredDocuments.map((d) => d.documentType),
                calculatedAt: new Date(),
              },
              update: {
                matchPercentage,
                estimatedBenefit: isEligible ? scheme.financialBenefit : 0,
                isEligible,
                criteriaMet,
                missingCriteria,
                missingDocuments: scheme.requiredDocuments.map((d) => d.documentType),
                calculatedAt: new Date(),
              },
            });
          });

          await Promise.all(upsertPromises);
          recommendationsRefreshed++;

          // 5. Proactive Age Threshold Evaluation
          for (const scheme of activeSchemes) {
            const ageRule = scheme.eligibilityRules.find(
              (r) => r.attributeKey === 'age' && (r.operator === 'GREATER_EQUAL' || r.operator === 'GREATER_THAN'),
            );
            if (!ageRule) continue;

            const minAge = parseInt(ageRule.targetValue, 10);
            if (isNaN(minAge) || calculatedAge < minAge) continue;

            // Citizen has reached age requirement. Check if ALL other criteria passed
            let allPassed = true;
            for (const rule of scheme.eligibilityRules) {
              const val = (profile as any)[rule.attributeKey] ?? (profile.address as any)?.[rule.attributeKey];
              if (val === undefined || val === null) {
                if (rule.isRequired) { allPassed = false; break; }
                continue;
              }
              let isMet = false;
              if (rule.operator === 'EQUALS') isMet = String(val).toUpperCase() === String(rule.targetValue).toUpperCase();
              else if (rule.operator === 'LESS_EQUAL') isMet = Number(val) <= Number(rule.targetValue);
              else if (rule.operator === 'GREATER_EQUAL') isMet = Number(val) >= Number(rule.targetValue);
              else if (rule.operator === 'GREATER_THAN') isMet = Number(val) > Number(rule.targetValue);
              else if (rule.operator === 'LESS_THAN') isMet = Number(val) < Number(rule.targetValue);
              if (!isMet && rule.isRequired) { allPassed = false; break; }
            }

            if (allPassed) {
              const dedupKey = `${profile.userId}:${scheme.id}:AGE_ELIGIBILITY_REACHED:v1`;
              const existingNotif = await prisma.notification.findFirst({
                where: { userId: profile.userId, dedupKey },
              });

              if (!existingNotif) {
                await prisma.notification.create({
                  data: {
                    userId: profile.userId,
                    type: 'AGE_ELIGIBILITY_REACHED' as any,
                    title: `You're now eligible for ${scheme.title}`,
                    body: `You're now old enough to qualify for ${scheme.title}. Check your eligibility and required documents.`,
                    severity: 'SUCCESS',
                    channel: 'IN_APP',
                    isRead: false,
                    metadata: {
                      schemeId: scheme.id,
                      schemeCode: scheme.code,
                      destination: `/schemes/${scheme.id}`,
                    },
                    dedupKey,
                  },
                });
              }
            }
          }
        })
      );
    }
    console.log(`[CRON]    -> Synced recommendations for ${recommendationsRefreshed} citizen profiles`);

    const durationMs = Date.now() - startTime;
    const completedAt = new Date().toISOString();

    console.log('============================================================');
    console.log('[CRON] STATUS     : SUCCESS');
    console.log(`[CRON] Completed  : ${completedAt}`);
    console.log(`[CRON] Duration   : ${durationMs}ms`);
    console.log(`[CRON] Summary    : Processed: ${schemesProcessed} | Created: ${schemesCreated} | Updated: ${schemesUpdated} | Cleaned: ${sessionsPruned + outboxEventsPurged}`);
    console.log('============================================================');

    return {
      jobName: 'daily-maintenance',
      status: 'SUCCESS',
      startedAt,
      completedAt,
      durationMs,
      schemesProcessed,
      schemesCreated,
      schemesUpdated,
      sessionsPruned,
      outboxEventsPurged,
      recommendationsRefreshed,
    };
  } catch (error: any) {
    const durationMs = Date.now() - startTime;
    const completedAt = new Date().toISOString();

    // Sanitize any potential secret leaks from error message
    const sanitizedError = (error?.message || 'Unknown database error')
      .replace(/postgres:\/\/[^@]+@/g, 'postgres://***:***@')
      .replace(/mongodb:\/\/[^@]+@/g, 'mongodb://***:***@');

    console.error('============================================================');
    console.error('[CRON] STATUS     : FAILED');
    console.error(`[CRON] Error      : ${sanitizedError}`);
    console.error(`[CRON] Completed  : ${completedAt}`);
    console.error(`[CRON] Duration   : ${durationMs}ms`);
    console.error('============================================================');

    return {
      jobName: 'daily-maintenance',
      status: 'FAILED',
      startedAt,
      completedAt,
      durationMs,
      schemesProcessed,
      schemesCreated,
      schemesUpdated,
      sessionsPruned,
      outboxEventsPurged,
      recommendationsRefreshed,
      errorMessage: sanitizedError,
    };
  } finally {
    if (!prismaOverride) {
      await prisma.$disconnect();
    }
  }
}

// Standalone CLI Entrypoint
if (require.main === module) {
  runDailyMaintenance()
    .then((result) => {
      if (result.status === 'SUCCESS') {
        process.exit(0);
      } else {
        process.exit(1);
      }
    })
    .catch((err) => {
      console.error('[CRON] Unhandled fatal exception:', err?.message || err);
      process.exit(1);
    });
}
