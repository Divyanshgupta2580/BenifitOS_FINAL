/**
 * BenefitOS — Final Eligibility Status Strictness Regression Test Suite
 *
 * Verifies that:
 * 1. ONLY (isEligible === true && eligibilityStatus === 'ELIGIBLE') is included in "Eligible Now".
 * 2. Cases 1-10 fail-closed behavior.
 * 3. Future eligibility (1, 2, 3 years) remains completely isolated from Eligible Now.
 * 4. Backend recommendation enrichment guarantees deterministic eligibilityStatus.
 */

import { EligibilityEvaluatorService } from './modules/recommendation/services/eligibility-evaluator.service';
import { CitizenEntity, Gender, SocialCategory, EmploymentStatus, MaritalStatus, DisabilityType } from './domain/citizen/citizen.entity';
import { WelfareSchemeEntity, SchemeCategory, DocumentType } from './domain/welfare/scheme.entity';

console.log('===============================================================');
console.log(' BenefitOS — Final Eligibility Status Strictness Verification  ');
console.log('===============================================================\n');

let passCount = 0;
let totalCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalCount++;
  if (condition) {
    console.log(`  [PASS] Test ${totalCount}: ${testName}`);
    passCount++;
  } else {
    console.error(`  [FAIL] Test ${totalCount}: ${testName} - ${detail || ''}`);
    throw new Error(`Test assertion failed: ${testName} - ${detail || ''}`);
  }
}

// Canonical filter function replicating RecommendationDashboardScreen and EligibleSchemesSection
function filterEligibleNow(recommendations: any[]): any[] {
  return recommendations.filter(
    (r) => r.isEligible === true && r.eligibilityStatus === 'ELIGIBLE'
  );
}

function filterFutureEligible(recommendations: any[], years: number): any[] {
  return recommendations.filter(
    (r) => !r.isEligible && r.eligibilityStatus === 'FUTURE_ELIGIBLE' && (r.yearsUntilEligible === years || r.eligibilityTiming === `IN_${years}_YEAR` || r.eligibilityTiming === `IN_${years}_YEARS`)
  );
}

function filterNeedsVerification(recommendations: any[]): any[] {
  return recommendations.filter(
    (r) => !r.isEligible && r.eligibilityStatus === 'NEEDS_VERIFICATION'
  );
}

function filterIncompleteProfile(recommendations: any[]): any[] {
  return recommendations.filter(
    (r) => !r.isEligible && r.eligibilityStatus === 'INCOMPLETE_PROFILE'
  );
}

function filterNotEligible(recommendations: any[]): any[] {
  return recommendations.filter(
    (r) =>
      !r.isEligible &&
      r.eligibilityStatus !== 'FUTURE_ELIGIBLE' &&
      r.eligibilityStatus !== 'INCOMPLETE_PROFILE' &&
      r.eligibilityStatus !== 'NEEDS_VERIFICATION'
  );
}

// =========================================================================
// SECTION 1: MANDATORY CASES 1 - 10 INVARIANT VERIFICATION
// =========================================================================
console.log('--- SECTION 1: Mandatory Cases 1-10 Invariant Verification ---');

// CASE 1
const c1 = filterEligibleNow([{ id: 'c1', isEligible: true, eligibilityStatus: 'ELIGIBLE' }]);
assert(c1.length === 1 && c1[0].id === 'c1', 'CASE 1: isEligible: true, eligibilityStatus: "ELIGIBLE" -> Eligible Now');

// CASE 2
const c2 = filterEligibleNow([{ id: 'c2', isEligible: false, eligibilityStatus: 'ELIGIBLE' }]);
assert(c2.length === 0, 'CASE 2: isEligible: false, eligibilityStatus: "ELIGIBLE" -> NOT Eligible Now');

// CASE 3
const c3 = filterEligibleNow([{ id: 'c3', isEligible: true, eligibilityStatus: null }]);
assert(c3.length === 0, 'CASE 3: isEligible: true, eligibilityStatus: null -> NOT Eligible Now');

// CASE 4
const c4 = filterEligibleNow([{ id: 'c4', isEligible: true, eligibilityStatus: undefined }]);
assert(c4.length === 0, 'CASE 4: isEligible: true, eligibilityStatus: undefined -> NOT Eligible Now');

// CASE 5
const c5 = filterEligibleNow([{ id: 'c5', isEligible: true, eligibilityStatus: '' }]);
assert(c5.length === 0, 'CASE 5: isEligible: true, eligibilityStatus: "" -> NOT Eligible Now');

// CASE 6
const c6 = filterEligibleNow([{ id: 'c6', isEligible: true, eligibilityStatus: 'UNKNOWN' }]);
assert(c6.length === 0, 'CASE 6: isEligible: true, eligibilityStatus: "UNKNOWN" -> NOT Eligible Now');

// CASE 7
const c7 = filterEligibleNow([{ id: 'c7', isEligible: true, eligibilityStatus: 'FUTURE_ELIGIBLE', yearsUntilEligible: 1 }]);
assert(c7.length === 0, 'CASE 7: isEligible: true, eligibilityStatus: "FUTURE_ELIGIBLE" -> NOT Eligible Now');

// CASE 8
const c8Item = [{ id: 'c8', isEligible: false, eligibilityStatus: 'NOT_ELIGIBLE' }];
assert(filterEligibleNow(c8Item).length === 0, 'CASE 8: isEligible: false, eligibilityStatus: "NOT_ELIGIBLE" -> NOT Eligible Now');
assert(filterNotEligible(c8Item).length === 1, 'CASE 8: Routed to Not Eligible');

// CASE 9
const c9Item = [{ id: 'c9', isEligible: false, eligibilityStatus: 'INCOMPLETE_PROFILE' }];
assert(filterEligibleNow(c9Item).length === 0, 'CASE 9: isEligible: false, eligibilityStatus: "INCOMPLETE_PROFILE" -> NOT Eligible Now');
assert(filterIncompleteProfile(c9Item).length === 1, 'CASE 9: Routed to Complete Profile / Action Required');

// CASE 10
const c10Item = [{ id: 'c10', isEligible: false, eligibilityStatus: 'NEEDS_VERIFICATION' }];
assert(filterEligibleNow(c10Item).length === 0, 'CASE 10: isEligible: false, eligibilityStatus: "NEEDS_VERIFICATION" -> NOT Eligible Now');
assert(filterNeedsVerification(c10Item).length === 1, 'CASE 10: Routed to Verification Required');


// =========================================================================
// SECTION 2: FUTURE ELIGIBILITY ISOLATION
// =========================================================================
console.log('\n--- SECTION 2: Future Eligibility Isolation (1, 2, 3 Years) ---');

const f1Item = [{ id: 'f1', isEligible: false, eligibilityStatus: 'FUTURE_ELIGIBLE', yearsUntilEligible: 1, eligibilityTiming: 'IN_1_YEAR' }];
assert(filterEligibleNow(f1Item).length === 0, 'Future 1 Year: Excluded from Eligible Now');
assert(filterFutureEligible(f1Item, 1).length === 1, 'Future 1 Year: Included in In 1 Year bucket');
assert(filterFutureEligible(f1Item, 2).length === 0, 'Future 1 Year: Excluded from In 2 Years bucket');
assert(filterFutureEligible(f1Item, 3).length === 0, 'Future 1 Year: Excluded from In 3 Years bucket');

const f2Item = [{ id: 'f2', isEligible: false, eligibilityStatus: 'FUTURE_ELIGIBLE', yearsUntilEligible: 2, eligibilityTiming: 'IN_2_YEARS' }];
assert(filterEligibleNow(f2Item).length === 0, 'Future 2 Years: Excluded from Eligible Now');
assert(filterFutureEligible(f2Item, 1).length === 0, 'Future 2 Years: Excluded from In 1 Year bucket');
assert(filterFutureEligible(f2Item, 2).length === 1, 'Future 2 Years: Included in In 2 Years bucket');
assert(filterFutureEligible(f2Item, 3).length === 0, 'Future 2 Years: Excluded from In 3 Years bucket');

const f3Item = [{ id: 'f3', isEligible: false, eligibilityStatus: 'FUTURE_ELIGIBLE', yearsUntilEligible: 3, eligibilityTiming: 'IN_3_YEARS' }];
assert(filterEligibleNow(f3Item).length === 0, 'Future 3 Years: Excluded from Eligible Now');
assert(filterFutureEligible(f3Item, 1).length === 0, 'Future 3 Years: Excluded from In 1 Year bucket');
assert(filterFutureEligible(f3Item, 2).length === 0, 'Future 3 Years: Excluded from In 2 Years bucket');
assert(filterFutureEligible(f3Item, 3).length === 1, 'Future 3 Years: Included in In 3 Years bucket');


// =========================================================================
// SECTION 3: MIXED PAYLOAD INTEGRATION TEST
// =========================================================================
console.log('\n--- SECTION 3: Mixed Batch Payload Partitioning ---');

const mixedItems = [
  { id: '1', isEligible: true, eligibilityStatus: 'ELIGIBLE' },
  { id: '2', isEligible: false, eligibilityStatus: 'ELIGIBLE' },
  { id: '3', isEligible: true, eligibilityStatus: null },
  { id: '4', isEligible: true, eligibilityStatus: undefined },
  { id: '5', isEligible: true, eligibilityStatus: '' },
  { id: '6', isEligible: true, eligibilityStatus: 'UNKNOWN' },
  { id: '7', isEligible: false, eligibilityStatus: 'FUTURE_ELIGIBLE', yearsUntilEligible: 1 },
  { id: '8', isEligible: false, eligibilityStatus: 'FUTURE_ELIGIBLE', yearsUntilEligible: 2 },
  { id: '9', isEligible: false, eligibilityStatus: 'INCOMPLETE_PROFILE' },
  { id: '10', isEligible: false, eligibilityStatus: 'NOT_ELIGIBLE' },
];

const eligibleNow = filterEligibleNow(mixedItems);
assert(eligibleNow.length === 1 && eligibleNow[0].id === '1', 'Batch Partitioning: Exactly 1 item admitted into Eligible Now');

const future1 = filterFutureEligible(mixedItems, 1);
assert(future1.length === 1 && future1[0].id === '7', 'Batch Partitioning: Exactly 1 item in In 1 Year');

const future2 = filterFutureEligible(mixedItems, 2);
assert(future2.length === 1 && future2[0].id === '8', 'Batch Partitioning: Exactly 1 item in In 2 Years');

const incomplete = filterIncompleteProfile(mixedItems);
assert(incomplete.length === 1 && incomplete[0].id === '9', 'Batch Partitioning: Exactly 1 item in Incomplete Profile');


// =========================================================================
// SECTION 4: BACKEND EVALUATOR GUARANTEE
// =========================================================================
console.log('\n--- SECTION 4: Backend Evaluator Invariant Guarantee ---');

const evaluator = new EligibilityEvaluatorService();

const scheme = new WelfareSchemeEntity({
  id: 'sch-pension',
  code: 'PENSION-60',
  title: 'Senior Citizen Pension Scheme',
  description: 'Pension for senior citizens',
  category: SchemeCategory.PENSION,
  department: 'Department of Social Justice',
  financialBenefit: 24000,
  isCentralScheme: true,
  isActive: true,
  eligibilityRules: [
    { id: 'r-pen-1', attributeKey: 'age', operator: 'GREATER_EQUAL', targetValue: '60', isRequired: true, description: 'Must be at least 60 years old' },
    { id: 'r-pen-2', attributeKey: 'annualIncomeINR', operator: 'LESS_EQUAL', targetValue: '200000', isRequired: true, description: 'Annual income must not exceed 2L' },
  ],
  requiredDocuments: [DocumentType.AADHAAR],
});

const currentYear = new Date().getFullYear();

const matchingCitizen = new CitizenEntity({
  id: 'cit-match',
  userId: 'u-match',
  firstName: 'Priya',
  lastName: 'Sharma',
  dateOfBirth: new Date(currentYear - 65, 0, 1),
  gender: Gender.FEMALE,
  annualIncomeINR: 80000,
  socialCategory: SocialCategory.OBC,
  disabilityType: DisabilityType.NONE,
  disabilityPercent: 0,
  employmentStatus: EmploymentStatus.UNEMPLOYED,
  maritalStatus: MaritalStatus.WIDOWED,
  isBplCardHolder: true,
});

const resMatch = evaluator.evaluateDetailedEligibility(matchingCitizen, scheme);
assert(resMatch.eligibilityStatus === 'ELIGIBLE' && resMatch.recommendation.isEligible === true, 'Backend Evaluator: Matching citizen evaluates to ELIGIBLE and isEligible=true');
assert(resMatch.eligibilityTiming === 'NOW' && resMatch.yearsUntilEligible === 0, 'Backend Evaluator: Matching citizen timing is NOW, years=0');

const futureCitizen = new CitizenEntity({
  id: 'cit-future',
  userId: 'u-future',
  firstName: 'Priya',
  lastName: 'Sharma',
  dateOfBirth: new Date(currentYear - 58, 0, 1),
  gender: Gender.FEMALE,
  annualIncomeINR: 80000,
  socialCategory: SocialCategory.OBC,
  disabilityType: DisabilityType.NONE,
  disabilityPercent: 0,
  employmentStatus: EmploymentStatus.UNEMPLOYED,
  maritalStatus: MaritalStatus.WIDOWED,
  isBplCardHolder: true,
});
const resFuture = evaluator.evaluateDetailedEligibility(futureCitizen, scheme);
assert(resFuture.eligibilityStatus === 'FUTURE_ELIGIBLE' && resFuture.recommendation.isEligible === false, 'Backend Evaluator: Citizen age 58 evaluates to FUTURE_ELIGIBLE and isEligible=false');
assert(resFuture.yearsUntilEligible === 2 && resFuture.eligibilityTiming === 'IN_2_YEARS', 'Backend Evaluator: Citizen age 58 timing is IN_2_YEARS, years=2');

const richCitizen = new CitizenEntity({
  id: 'cit-rich',
  userId: 'u-rich',
  firstName: 'Priya',
  lastName: 'Sharma',
  dateOfBirth: new Date(currentYear - 65, 0, 1),
  gender: Gender.FEMALE,
  annualIncomeINR: 500000,
  socialCategory: SocialCategory.OBC,
  disabilityType: DisabilityType.NONE,
  disabilityPercent: 0,
  employmentStatus: EmploymentStatus.UNEMPLOYED,
  maritalStatus: MaritalStatus.WIDOWED,
  isBplCardHolder: true,
});
const resIneligible = evaluator.evaluateDetailedEligibility(richCitizen, scheme);
assert(resIneligible.eligibilityStatus === 'NOT_ELIGIBLE' && resIneligible.recommendation.isEligible === false, 'Backend Evaluator: Citizen income 5L evaluates to NOT_ELIGIBLE and isEligible=false');

const incompleteCitizen = new CitizenEntity({
  id: 'cit-inc',
  userId: 'u-inc',
  firstName: 'Priya',
  lastName: 'Sharma',
  dateOfBirth: new Date(currentYear - 65, 0, 1),
  gender: Gender.FEMALE,
  annualIncomeINR: undefined as any,
  socialCategory: SocialCategory.OBC,
  disabilityType: DisabilityType.NONE,
  disabilityPercent: 0,
  employmentStatus: EmploymentStatus.UNEMPLOYED,
  maritalStatus: MaritalStatus.WIDOWED,
  isBplCardHolder: true,
});
const resIncomplete = evaluator.evaluateDetailedEligibility(incompleteCitizen, scheme);
assert(resIncomplete.eligibilityStatus === 'INCOMPLETE_PROFILE' && resIncomplete.recommendation.isEligible === false, 'Backend Evaluator: Incomplete profile evaluates to INCOMPLETE_PROFILE and isEligible=false');


// =========================================================================
// SECTION 5: RECOMMENDATION ENGINE ENRICHMENT FALLBACK MICRO-AUDIT
// =========================================================================
async function runSection5() {
  console.log('\n--- SECTION 5: Recommendation Engine Enrichment Fallback Micro-Audit ---');

  const { RecommendationEngineService } = await import('./modules/recommendation/recommendation.service');
  const { SchemeRecommendationEntity } = await import('./domain/welfare/recommendation.entity');

  const mockCitizen = new CitizenEntity({
    id: 'cit-audit-1',
    userId: 'usr-audit-1',
    firstName: 'Priya',
    lastName: 'Sharma',
    dateOfBirth: new Date(currentYear - 65, 0, 1),
    gender: Gender.FEMALE,
    annualIncomeINR: 80000,
    socialCategory: SocialCategory.OBC,
    disabilityType: DisabilityType.NONE,
    disabilityPercent: 0,
    employmentStatus: EmploymentStatus.UNEMPLOYED,
    maritalStatus: MaritalStatus.WIDOWED,
    isBplCardHolder: true,
  });

  const mockScheme = new WelfareSchemeEntity({
    id: 'sch-audit-1',
    code: 'PENSION-60',
    title: 'Senior Citizen Pension Scheme',
    description: 'Pension for senior citizens',
    category: SchemeCategory.PENSION,
    department: 'Department of Social Justice',
    financialBenefit: 24000,
    isCentralScheme: true,
    isActive: true,
    eligibilityRules: [
      { id: 'r-pen-1', attributeKey: 'age', operator: 'GREATER_EQUAL', targetValue: '60', isRequired: true, description: 'Must be at least 60 years old' },
      { id: 'r-pen-2', attributeKey: 'annualIncomeINR', operator: 'LESS_EQUAL', targetValue: '200000', isRequired: true, description: 'Annual income must not exceed 2L' },
    ],
    requiredDocuments: [DocumentType.AADHAAR],
  });

  const mockCitizenRepo: any = {
    findByUserId: async (uid: string) => (uid === 'usr-audit-1' ? mockCitizen : null),
  };

  const mockSchemeRepo: any = {
    findById: async (sid: string) => (sid === 'sch-audit-1' ? mockScheme : null),
    findAllActive: async () => [mockScheme],
  };

  const mockRecRepo: any = {
    findByCitizenId: async () => [],
    deleteForCitizen: async () => {},
    saveMany: async () => {},
  };

  const mockAiValidator: any = {
    validateEligibility: async (_citizen: any, scheme: any, detailed: any) => ({
      decision: detailed.eligibilityStatus === 'ELIGIBLE' ? 'CLAIM_READY' : 'NOT_ELIGIBLE',
      confidence: 0.95,
      reason: detailed.statusReason,
      allNonDocumentCriteriaSatisfied: detailed.eligibilityStatus === 'ELIGIBLE',
      onlyDocumentsRemaining: detailed.eligibilityStatus === 'ELIGIBLE',
      requiredDocuments: scheme.requiredDocuments || [],
    }),
  };

  const recService = new RecommendationEngineService(
    evaluator,
    mockAiValidator,
    mockCitizenRepo,
    mockSchemeRepo,
    mockRecRepo,
  );

  // 1. Normal recommendation test: verify detailed evaluator status is returned directly
  const enriched = await recService.getEnrichedRecommendations('usr-audit-1');
  assert(enriched.length === 1, 'Enrichment Audit: Returns 1 recommendation');
  assert(enriched[0].eligibilityStatus === 'CLAIM_READY' || enriched[0].eligibilityStatus === 'ELIGIBLE', 'Enrichment Audit: Normal recommendation receives ELIGIBLE/CLAIM_READY');
  assert(enriched[0].isEligible === true, 'Enrichment Audit: Normal recommendation isEligible is true');

  // 2. Orphaned scheme test (where schemeRepo.findById returns null)
  const orphanRec = new SchemeRecommendationEntity({
    id: 'rec-orphan-1',
    citizenProfileId: 'cit-audit-1',
    schemeId: 'sch-deleted',
    matchPercentage: 0,
    estimatedBenefit: 0,
    isEligible: false,
    criteriaMet: [],
    missingCriteria: ['Scheme removed'],
    missingDocuments: [],
  });

  const mockRecRepoWithOrphan: any = {
    findByCitizenId: async () => [orphanRec],
  };

  const recServiceOrphan = new RecommendationEngineService(
    evaluator,
    mockAiValidator,
    mockCitizenRepo,
    mockSchemeRepo,
    mockRecRepoWithOrphan,
  );

  const enrichedOrphan = await recServiceOrphan.getEnrichedRecommendations('usr-audit-1');
  assert(enrichedOrphan.length === 1, 'Enrichment Audit (Orphan): Returns 1 recommendation');
  assert(enrichedOrphan[0].eligibilityStatus === 'NOT_ELIGIBLE', 'Enrichment Audit (Orphan): Ineligible orphan fails closed to NOT_ELIGIBLE');
  assert(enrichedOrphan[0].isEligible === false, 'Enrichment Audit (Orphan): Orphan isEligible remains false');

  console.log(`\n===============================================================`);
  console.log(` RESULT: ${passCount}/${totalCount} TESTS PASSED`);
  console.log(` STATUS: STRICT ELIGIBILITY INVARIANT HARDENING VERIFIED!      `);
  console.log(`===============================================================\n`);
}

runSection5().catch((err) => {
  console.error('Section 5 failed:', err);
  process.exit(1);
});
