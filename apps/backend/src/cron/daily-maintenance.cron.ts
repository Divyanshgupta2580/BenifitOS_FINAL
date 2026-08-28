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
    description: 'Income support of Rs 6,000 per year in three equal installments to all landholding farmer families.',
    category: 'AGRICULTURE' as SchemeCategory,
    department: 'Ministry of Agriculture and Farmers Welfare',
    isCentralScheme: true,
    financialBenefit: 6000.0,
    isActive: true,
    rules: [
      { attributeKey: 'employmentStatus', operator: 'EQUALS', targetValue: 'FARMER', isRequired: true, description: 'Must be engaged in farming / agriculture' },
      { attributeKey: 'annualIncomeINR', operator: 'LESS_EQUAL', targetValue: '400000', isRequired: true, description: 'Annual family income must not exceed Rs 4,00,000' },
    ],
    documents: [
      { documentType: 'AADHAAR' as DocumentType, isMandatory: true, description: 'Aadhaar Card for identity verification' },
      { documentType: 'VOTER_ID' as DocumentType, isMandatory: true, description: 'Voter ID for electoral residency verification' },
    ],
  },
  {
    id: 'b2222222-2222-2222-2222-222222222222',
    code: 'PMAY-GRAMIN',
    title: 'Pradhan Mantri Awas Yojana (PMAY-G)',
    description: 'Housing assistance grant of up to Rs 1,20,000 to construct pucca houses with basic amenities for eligible households.',
    category: 'HOUSING' as SchemeCategory,
    department: 'Ministry of Rural Development',
    isCentralScheme: true,
    financialBenefit: 120000.0,
    isActive: true,
    rules: [
      { attributeKey: 'annualIncomeINR', operator: 'LESS_EQUAL', targetValue: '600000', isRequired: true, description: 'Annual family income must be under Rs 6,00,000' },
      { attributeKey: 'age', operator: 'GREATER_EQUAL', targetValue: '18', isRequired: true, description: 'Applicant must be at least 18 years old' },
    ],
    documents: [
      { documentType: 'AADHAAR' as DocumentType, isMandatory: true, description: 'Aadhaar Card of head of family' },
      { documentType: 'VOTER_ID' as DocumentType, isMandatory: true, description: 'Voter ID proof of residence' },
    ],
  },
  {
    id: 'c3333333-3333-3333-3333-333333333333',
    code: 'PM-VIDYA-SCHOLARSHIP',
    title: 'National Merit-cum-Means Higher Education Scheme',
    description: 'Financial assistance of Rs 48,000 per year for students from economically weaker sections to arrest dropouts.',
    category: 'EDUCATION' as SchemeCategory,
    department: 'Department of Higher Education',
    isCentralScheme: true,
    financialBenefit: 48000.0,
    isActive: true,
    rules: [
      { attributeKey: 'employmentStatus', operator: 'EQUALS', targetValue: 'STUDENT', isRequired: true, description: 'Must be an enrolled student' },
      { attributeKey: 'annualIncomeINR', operator: 'LESS_EQUAL', targetValue: '500000', isRequired: true, description: 'Annual parental income must be under Rs 5,00,000' },
    ],
    documents: [
      { documentType: 'EDUCATIONAL_CERTIFICATE' as DocumentType, isMandatory: true, description: 'Previous academic marksheet/certificate' },
      { documentType: 'AADHAAR' as DocumentType, isMandatory: true, description: 'Student Aadhaar Card' },
    ],
  },
  {
    id: 'c4444444-4444-4444-4444-444444444444',
    code: 'UP-POST-MATRIC-SCHOLARSHIP',
    title: 'Uttar Pradesh Post-Matric Scholarship & Fee Reimbursement',
    description: 'State government scholarship and complete tuition reimbursement for students residing in Uttar Pradesh pursuing post-matric studies.',
    category: 'EDUCATION' as SchemeCategory,
    department: 'Social Welfare Department, Government of Uttar Pradesh',
    state: 'Uttar Pradesh',
    isCentralScheme: false,
    financialBenefit: 50000.0,
    isActive: true,
    rules: [
      { attributeKey: 'employmentStatus', operator: 'EQUALS', targetValue: 'STUDENT', isRequired: true, description: 'Must be a student enrolled in a recognized institution' },
      { attributeKey: 'annualIncomeINR', operator: 'LESS_EQUAL', targetValue: '250000', isRequired: true, description: 'Annual family income must not exceed Rs 2,50,000' },
    ],
    documents: [
      { documentType: 'EDUCATIONAL_CERTIFICATE' as DocumentType, isMandatory: true, description: 'Post-Matric Marksheet or Admission Letter' },
      { documentType: 'AADHAAR' as DocumentType, isMandatory: true, description: 'Aadhaar Card for identity verification' },
    ],
  },
  {
    id: 'd4444444-4444-4444-4444-444444444444',
    code: 'AYUSHMAN-BHARAT-PMJAY',
    title: 'Ayushman Bharat PM-JAY Health Protection',
    description: 'Health insurance coverage of up to Rs 5,00,000 per family per year for secondary and tertiary healthcare hospitalizations.',
    category: 'HEALTHCARE' as SchemeCategory,
    department: 'National Health Authority',
    isCentralScheme: true,
    financialBenefit: 500000.0,
    isActive: true,
    rules: [
      { attributeKey: 'annualIncomeINR', operator: 'LESS_EQUAL', targetValue: '800000', isRequired: true, description: 'Annual income must be under Rs 8,00,000' },
      { attributeKey: 'age', operator: 'GREATER_EQUAL', targetValue: '18', isRequired: true, description: 'Applicant must be an adult citizen' },
    ],
    documents: [
      { documentType: 'AADHAAR' as DocumentType, isMandatory: true, description: 'Aadhaar Card for e-KYC' },
      { documentType: 'CASTE_CERTIFICATE' as DocumentType, isMandatory: false, description: 'Caste Certificate if claiming reservation category' },
    ],
  },
  {
    id: 'e5555555-5555-5555-5555-555555555555',
    code: 'PM-MUDRA-YOJANA',
    title: 'Pradhan Mantri MUDRA Micro-Enterprise Loan Subsidy',
    description: 'Credit linkage and capital interest subsidy of up to Rs 50,000 for self-employed micro-enterprises and daily-wage entrepreneurs.',
    category: 'FINANCIAL_INCLUSION' as SchemeCategory,
    department: 'Department of Financial Services',
    isCentralScheme: true,
    financialBenefit: 50000.0,
    isActive: true,
    rules: [
      { attributeKey: 'age', operator: 'GREATER_EQUAL', targetValue: '18', isRequired: true, description: 'Applicant must be at least 18 years old' },
    ],
    documents: [
      { documentType: 'AADHAAR' as DocumentType, isMandatory: true, description: 'Aadhaar Card of enterprise owner' },
      { documentType: 'DRIVING_LICENSE' as DocumentType, isMandatory: false, description: 'Driving Licence for commercial transport ventures' },
    ],
  },
  {
    id: 'f6666666-6666-6666-6666-666666666666',
    code: 'NSAP-NATIONAL-PENSION',
    title: 'National Social Assistance Old Age Pension',
    description: 'Monthly social security financial support of Rs 1,000 per month (Rs 12,000/yr) for senior citizens.',
    category: 'SOCIAL_SECURITY' as SchemeCategory,
    department: 'Ministry of Rural Development',
    isCentralScheme: true,
    financialBenefit: 12000.0,
    isActive: true,
    rules: [
      { attributeKey: 'age', operator: 'GREATER_EQUAL', targetValue: '60', isRequired: true, description: 'Senior citizen age must be 60 years or above' },
      { attributeKey: 'annualIncomeINR', operator: 'LESS_EQUAL', targetValue: '250000', isRequired: true, description: 'Annual income must not exceed Rs 2,50,000' },
    ],
    documents: [
      { documentType: 'BIRTH_CERTIFICATE' as DocumentType, isMandatory: true, description: 'Birth Certificate or Age Proof document' },
      { documentType: 'AADHAAR' as DocumentType, isMandatory: true, description: 'Aadhaar Card for identity' },
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
