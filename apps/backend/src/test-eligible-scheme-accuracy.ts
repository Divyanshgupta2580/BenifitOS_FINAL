import { EligibilityEvaluatorService, EligibilityStatus } from './modules/recommendation/services/eligibility-evaluator.service';
import { CitizenEntity, Gender, MaritalStatus, SocialCategory, EmploymentStatus, DisabilityType } from './domain/citizen/citizen.entity';
import { WelfareSchemeEntity, SchemeCategory, DocumentType } from './domain/welfare/scheme.entity';
import { RecommendationEngineService } from './modules/recommendation/recommendation.service';
import { AiDataMinimizerService } from './infrastructure/ai/ai-data-minimizer.service';
import { randomUUID } from 'crypto';

console.log('================================================================');
console.log(' BENEFITOS — DETERMINISTIC ELIGIBLE-SCHEME ACCURACY AUDIT SUITE ');
console.log('================================================================\n');

const evaluator = new EligibilityEvaluatorService();
let passedAssertions = 0;
let totalAssertions = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalAssertions++;
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passedAssertions++;
  } else {
    console.error(`  [FAIL] ${testName} - ${detail || ''}`);
    throw new Error(`Test assertion failed: ${testName} - ${detail || ''}`);
  }
}

function createCitizen(overrides: Partial<any> = {}): CitizenEntity {
  const birthYear = overrides.age !== undefined ? new Date().getFullYear() - overrides.age : 1996;
  return new CitizenEntity({
    id: overrides.id || `cit-${randomUUID().substring(0, 8)}`,
    userId: overrides.userId || `usr-${randomUUID().substring(0, 8)}`,
    firstName: overrides.firstName !== undefined ? overrides.firstName : 'Aarav',
    lastName: overrides.lastName !== undefined ? overrides.lastName : 'Sharma',
    dateOfBirth: overrides.dateOfBirth !== undefined ? overrides.dateOfBirth : new Date(birthYear, 0, 1),
    gender: overrides.gender !== undefined ? overrides.gender : Gender.MALE,
    maritalStatus: overrides.maritalStatus !== undefined ? overrides.maritalStatus : MaritalStatus.MARRIED,
    socialCategory: overrides.socialCategory !== undefined ? overrides.socialCategory : SocialCategory.OBC,
    employmentStatus: overrides.employmentStatus !== undefined ? overrides.employmentStatus : EmploymentStatus.FARMER,
    annualIncomeINR: overrides.annualIncomeINR !== undefined ? overrides.annualIncomeINR : 180000,
    disabilityType: overrides.disabilityType !== undefined ? overrides.disabilityType : DisabilityType.NONE,
    disabilityPercent: overrides.disabilityPercent !== undefined ? overrides.disabilityPercent : 0,
    isBplCardHolder: overrides.isBplCardHolder !== undefined ? overrides.isBplCardHolder : false,
    bplCardNumber: overrides.bplCardNumber || null,
    aadhaarHash: overrides.aadhaarHash !== undefined ? overrides.aadhaarHash : 'hash_aadhaar_verified_123',
    panHash: overrides.panHash !== undefined ? overrides.panHash : 'hash_pan_verified_456',
    address: overrides.address !== undefined ? overrides.address : {
      id: 'addr-1',
      streetAddress: 'Village Shivpur',
      city: 'Varanasi',
      district: 'Varanasi',
      state: 'Uttar Pradesh',
      pincode: '221001',
      isRural: true,
    },
    landDetails: overrides.landDetails !== undefined ? overrides.landDetails : [
      {
        id: 'land-1',
        landSizeAcres: 2.5,
        landType: 'AGRICULTURAL',
        district: 'Varanasi',
        state: 'Uttar Pradesh',
      },
    ],
  });
}

// -------------------------------------------------------------
// CANONICAL REAL SCHEMES (From Database / Seed Catalog)
// -------------------------------------------------------------
const schemePMKisan = new WelfareSchemeEntity({
  id: 'sch-pm-kisan-001',
  code: 'PM-KISAN',
  title: 'Pradhan Mantri Kisan Samman Nidhi',
  description: 'Income support of Rs 6,000 per year for farmer families.',
  category: SchemeCategory.AGRICULTURE,
  department: 'Ministry of Agriculture and Farmers Welfare',
  financialBenefit: 6000,
  isCentralScheme: true,
  isActive: true,
  eligibilityRules: [
    { id: 'r1', attributeKey: 'employmentStatus', operator: 'EQUALS', targetValue: 'FARMER', isRequired: true, description: 'Must be engaged in farming / agriculture' },
    { id: 'r2', attributeKey: 'annualIncomeINR', operator: 'LESS_EQUAL', targetValue: '400000', isRequired: true, description: 'Annual family income must not exceed Rs 4,00,000' },
    { id: 'r3', attributeKey: 'isRural', operator: 'EQUALS', targetValue: 'true', isRequired: true, description: 'Must reside in rural farming area' },
  ],
  requiredDocuments: [DocumentType.AADHAAR, DocumentType.VOTER_ID],
});

const schemePMAY = new WelfareSchemeEntity({
  id: 'sch-pmay-001',
  code: 'PMAY-GRAMIN',
  title: 'Pradhan Mantri Awas Yojana (PMAY-G)',
  description: 'Housing assistance grant of up to Rs 1,20,000 for rural households.',
  category: SchemeCategory.HOUSING,
  department: 'Ministry of Rural Development',
  financialBenefit: 120000,
  isCentralScheme: true,
  isActive: true,
  eligibilityRules: [
    { id: 'r-pmay-1', attributeKey: 'annualIncomeINR', operator: 'LESS_EQUAL', targetValue: '600000', isRequired: true, description: 'Annual income must be under Rs 6,00,000' },
    { id: 'r-pmay-2', attributeKey: 'age', operator: 'GREATER_EQUAL', targetValue: '18', isRequired: true, description: 'Applicant must be at least 18 years old' },
    { id: 'r-pmay-3', attributeKey: 'isRural', operator: 'EQUALS', targetValue: 'true', isRequired: true, description: 'Must reside in rural area' },
  ],
  requiredDocuments: [DocumentType.AADHAAR, DocumentType.VOTER_ID],
});

const schemeUPPostMatric = new WelfareSchemeEntity({
  id: 'sch-up-post-matric-001',
  code: 'UP-POST-MATRIC-SCHOLARSHIP',
  title: 'Uttar Pradesh Post-Matric Scholarship',
  description: 'State scholarship for students residing in UP pursuing higher education.',
  category: SchemeCategory.EDUCATION,
  department: 'Social Welfare Department, Government of Uttar Pradesh',
  state: 'Uttar Pradesh',
  isCentralScheme: false,
  financialBenefit: 50000,
  isActive: true,
  eligibilityRules: [
    { id: 'r-up-1', attributeKey: 'employmentStatus', operator: 'EQUALS', targetValue: 'STUDENT', isRequired: true, description: 'Must be enrolled student' },
    { id: 'r-up-2', attributeKey: 'annualIncomeINR', operator: 'LESS_EQUAL', targetValue: '250000', isRequired: true, description: 'Annual family income must not exceed Rs 2,50,000' },
  ],
  requiredDocuments: [DocumentType.EDUCATIONAL_CERTIFICATE, DocumentType.AADHAAR],
});

const schemeAyushman = new WelfareSchemeEntity({
  id: 'sch-pmjay-001',
  code: 'AYUSHMAN-BHARAT-PMJAY',
  title: 'Ayushman Bharat PM-JAY Health Protection',
  description: 'Health insurance coverage up to Rs 5,00,000 per family per year.',
  category: SchemeCategory.HEALTHCARE,
  department: 'National Health Authority',
  financialBenefit: 500000,
  isCentralScheme: true,
  isActive: true,
  eligibilityRules: [
    { id: 'r-ayush-1', attributeKey: 'annualIncomeINR', operator: 'LESS_EQUAL', targetValue: '800000', isRequired: true, description: 'Annual income under Rs 8,00,000' },
    { id: 'r-ayush-2', attributeKey: 'age', operator: 'GREATER_EQUAL', targetValue: '18', isRequired: true, description: 'Must be at least 18 years old' },
  ],
  requiredDocuments: [DocumentType.AADHAAR],
});

const schemeVerifRequired = new WelfareSchemeEntity({
  id: 'sch-verif-001',
  code: 'DIRECT-BENEFIT-VERIFIED',
  title: 'Direct Benefit Transfer Verified Scheme',
  description: 'Special welfare grant requiring linked and verified Aadhaar KYC.',
  category: SchemeCategory.SOCIAL_SECURITY,
  department: 'Ministry of Social Justice',
  financialBenefit: 15000,
  isCentralScheme: true,
  isActive: true,
  eligibilityRules: [
    { id: 'r-v-1', attributeKey: 'isAadhaarVerified', operator: 'EQUALS', targetValue: 'true', isRequired: true, description: 'Aadhaar e-KYC verification must be completed' },
    { id: 'r-v-2', attributeKey: 'annualIncomeINR', operator: 'LESS_EQUAL', targetValue: '300000', isRequired: true, description: 'Annual income <= 300,000' },
  ],
  requiredDocuments: [DocumentType.AADHAAR],
});

const schemeYouthAgeRange = new WelfareSchemeEntity({
  id: 'sch-youth-range-001',
  code: 'YOUTH-SKILL-GRANT',
  title: 'Youth Skill Development Grant',
  description: 'Skill stipend for youth aged 18 to 25.',
  category: SchemeCategory.SKILL_DEVELOPMENT,
  department: 'Ministry of Skill Development',
  financialBenefit: 20000,
  isCentralScheme: true,
  isActive: true,
  eligibilityRules: [
    { id: 'r-yr-1', attributeKey: 'age', operator: 'GREATER_EQUAL', targetValue: '18', isRequired: true, description: 'Age >= 18' },
    { id: 'r-yr-2', attributeKey: 'age', operator: 'LESS_EQUAL', targetValue: '25', isRequired: true, description: 'Age <= 25' },
    { id: 'r-yr-3', attributeKey: 'employmentStatus', operator: 'IN', targetValue: 'UNEMPLOYED,STUDENT', isRequired: true, description: 'Must be unemployed or student' },
  ],
  requiredDocuments: [DocumentType.AADHAAR],
});

async function runTestSuite() {
  console.log('----------------------------------------------------------------');
  console.log('1. CONTROLLED TEST PROFILES EVALUATION (PROFILE-01 TO PROFILE-14)');
  console.log('----------------------------------------------------------------');

  // PROFILE-01: Meets every mandatory condition
  console.log('\n[PROFILE-01] Meets every mandatory condition (Farmer, Rural UP, Income 180k)');
  const p01 = createCitizen({ employmentStatus: EmploymentStatus.FARMER, annualIncomeINR: 180000 });
  const resP01 = evaluator.evaluateDetailedEligibility(p01, schemePMKisan);
  assert(resP01.eligibilityStatus === 'ELIGIBLE', 'P01: Status is ELIGIBLE');
  assert(resP01.recommendation.isEligible === true, 'P01: isEligible is true');
  assert(resP01.recommendation.matchPercentage === 100, 'P01: matchPercentage is 100%');
  assert(resP01.recommendation.estimatedBenefit === 6000, 'P01: estimatedBenefit is 6000');

  // PROFILE-02: Income above allowed limit
  console.log('\n[PROFILE-02] Income above allowed limit (Income 850,000 for PM-KISAN ceiling 400,000)');
  const p02 = createCitizen({ employmentStatus: EmploymentStatus.FARMER, annualIncomeINR: 850000 });
  const resP02 = evaluator.evaluateDetailedEligibility(p02, schemePMKisan);
  assert(resP02.eligibilityStatus === 'NOT_ELIGIBLE', 'P02: Status is NOT_ELIGIBLE');
  assert(resP02.recommendation.isEligible === false, 'P02: isEligible is false');
  assert(resP02.failedRules.length > 0, 'P02: failedRules contains income failure reason');

  // PROFILE-03: Age below minimum
  console.log('\n[PROFILE-03] Age below minimum (Age 16 for PMAY-G min age 18 -> FUTURE_ELIGIBLE in 2 Yrs; Age 13 -> NOT_ELIGIBLE)');
  const p03 = createCitizen({ age: 16, annualIncomeINR: 200000 });
  const resP03 = evaluator.evaluateDetailedEligibility(p03, schemePMAY);
  assert(resP03.eligibilityStatus === 'FUTURE_ELIGIBLE', 'P03: Status is FUTURE_ELIGIBLE for age 16 (2 years away)');
  assert(resP03.recommendation.isEligible === false, 'P03: isEligible is strictly false');
  assert(resP03.yearsUntilEligible === 2, 'P03: yearsUntilEligible is 2');

  const p03_underage = createCitizen({ age: 13, annualIncomeINR: 200000 });
  const resP03_underage = evaluator.evaluateDetailedEligibility(p03_underage, schemePMAY);
  assert(resP03_underage.eligibilityStatus === 'NOT_ELIGIBLE', 'P03b: Status is NOT_ELIGIBLE for age 13 (4+ years away)');
  assert(resP03_underage.recommendation.isEligible === false, 'P03b: isEligible is false');

  // PROFILE-04: Age above maximum
  console.log('\n[PROFILE-04] Age above maximum (Age 27 for Youth Skill Grant max age 25)');
  const p04 = createCitizen({ age: 27, employmentStatus: EmploymentStatus.UNEMPLOYED });
  const resP04 = evaluator.evaluateDetailedEligibility(p04, schemeYouthAgeRange);
  assert(resP04.eligibilityStatus === 'NOT_ELIGIBLE', 'P04: Status is NOT_ELIGIBLE');
  assert(resP04.recommendation.isEligible === false, 'P04: isEligible is false');

  // PROFILE-05: Wrong state/residence
  console.log('\n[PROFILE-05] Wrong state/residence (Madhya Pradesh resident for UP scheme)');
  const p05 = createCitizen({
    employmentStatus: EmploymentStatus.STUDENT,
    annualIncomeINR: 150000,
    address: { id: 'addr-mp', streetAddress: 'MG Road', city: 'Bhopal', district: 'Bhopal', state: 'Madhya Pradesh', pincode: '462001', isRural: false },
  });
  const resP05 = evaluator.evaluateDetailedEligibility(p05, schemeUPPostMatric);
  assert(resP05.eligibilityStatus === 'NOT_ELIGIBLE', 'P05: Status is NOT_ELIGIBLE');
  assert(resP05.recommendation.isEligible === false, 'P05: isEligible is false');
  assert(resP05.failedRules.some(r => r.includes('State mismatch')), 'P05: State mismatch recorded');

  // PROFILE-06: One required eligibility field missing
  console.log('\n[PROFILE-06] One required field missing (employmentStatus is null)');
  const p06 = createCitizen({ employmentStatus: null, annualIncomeINR: 200000 });
  const resP06 = evaluator.evaluateDetailedEligibility(p06, schemePMKisan);
  assert(resP06.eligibilityStatus === 'INCOMPLETE_PROFILE', 'P06: Status is INCOMPLETE_PROFILE');
  assert(resP06.recommendation.isEligible === false, 'P06: isEligible is strictly false');
  assert(resP06.missingProfileFields.length === 1, 'P06: Exactly 1 missing field reported');

  // PROFILE-07: Multiple required eligibility fields missing
  console.log('\n[PROFILE-07] Multiple required fields missing (employmentStatus is null, annualIncomeINR is null, address is null)');
  const p07 = new CitizenEntity({
    id: 'cit-p07',
    userId: 'usr-p07',
    firstName: 'Pooja',
    lastName: 'Verma',
    dateOfBirth: new Date('1998-05-15'),
    gender: Gender.FEMALE,
    maritalStatus: MaritalStatus.SINGLE,
    socialCategory: SocialCategory.GENERAL,
    employmentStatus: null as any,
    annualIncomeINR: null as any,
    disabilityType: DisabilityType.NONE,
    disabilityPercent: 0,
    isBplCardHolder: false,
    address: null as any,
  });
  const resP07 = evaluator.evaluateDetailedEligibility(p07, schemePMKisan);
  assert(resP07.eligibilityStatus === 'INCOMPLETE_PROFILE', 'P07: Status is INCOMPLETE_PROFILE');
  assert(resP07.recommendation.isEligible === false, 'P07: isEligible is false');
  assert(resP07.missingProfileFields.length >= 2, 'P07: Multiple missing fields reported');

  // PROFILE-08: Eligibility info exists but required verification is incomplete
  console.log('\n[PROFILE-08] Required verification incomplete (aadhaarHash is null for Aadhaar verified scheme)');
  const p08 = createCitizen({ aadhaarHash: null, annualIncomeINR: 200000 });
  const resP08 = evaluator.evaluateDetailedEligibility(p08, schemeVerifRequired);
  assert(resP08.eligibilityStatus === 'NEEDS_VERIFICATION', 'P08: Status is NEEDS_VERIFICATION');
  assert(resP08.recommendation.isEligible === false, 'P08: isEligible is strictly false');
  assert(Boolean(resP08.pendingVerificationRules && resP08.pendingVerificationRules.length > 0), 'P08: Reports pending verification rules');

  // PROFILE-09: Exact minimum age boundary
  console.log('\n[PROFILE-09] Exact minimum age boundary (Age = 18 for Age >= 18)');
  const p09 = createCitizen({ age: 18, employmentStatus: EmploymentStatus.STUDENT });
  const resP09 = evaluator.evaluateDetailedEligibility(p09, schemeYouthAgeRange);
  assert(resP09.eligibilityStatus === 'ELIGIBLE', 'P09: Age exactly 18 is ELIGIBLE');
  assert(resP09.recommendation.isEligible === true, 'P09: isEligible is true');

  // PROFILE-10: Exact maximum age boundary
  console.log('\n[PROFILE-10] Exact maximum age boundary (Age = 25 for Age <= 25)');
  const p10 = createCitizen({ age: 25, employmentStatus: EmploymentStatus.STUDENT });
  const resP10 = evaluator.evaluateDetailedEligibility(p10, schemeYouthAgeRange);
  assert(resP10.eligibilityStatus === 'ELIGIBLE', 'P10: Age exactly 25 is ELIGIBLE');
  assert(resP10.recommendation.isEligible === true, 'P10: isEligible is true');

  // PROFILE-11: Exact income boundary
  console.log('\n[PROFILE-11] Exact income boundary (Income = 400,000 for ceiling 400,000)');
  const p11 = createCitizen({ employmentStatus: EmploymentStatus.FARMER, annualIncomeINR: 400000 });
  const resP11 = evaluator.evaluateDetailedEligibility(p11, schemePMKisan);
  assert(resP11.eligibilityStatus === 'ELIGIBLE', 'P11: Income exactly 400,000 is ELIGIBLE');
  assert(resP11.recommendation.isEligible === true, 'P11: isEligible is true');

  // PROFILE-12: Just above income boundary
  console.log('\n[PROFILE-12] Just above income boundary (Income = 400,001 for ceiling 400,000)');
  const p12 = createCitizen({ employmentStatus: EmploymentStatus.FARMER, annualIncomeINR: 400001 });
  const resP12 = evaluator.evaluateDetailedEligibility(p12, schemePMKisan);
  assert(resP12.eligibilityStatus === 'NOT_ELIGIBLE', 'P12: Income 400,001 is NOT_ELIGIBLE');
  assert(resP12.recommendation.isEligible === false, 'P12: isEligible is false');

  // PROFILE-13: Just below income boundary
  console.log('\n[PROFILE-13] Just below income boundary (Income = 399,999 for ceiling 400,000)');
  const p13 = createCitizen({ employmentStatus: EmploymentStatus.FARMER, annualIncomeINR: 399999 });
  const resP13 = evaluator.evaluateDetailedEligibility(p13, schemePMKisan);
  assert(resP13.eligibilityStatus === 'ELIGIBLE', 'P13: Income 399,999 is ELIGIBLE');
  assert(resP13.recommendation.isEligible === true, 'P13: isEligible is true');

  // PROFILE-14: Conflicting/invalid profile input
  console.log('\n[PROFILE-14] Conflicting input (Meets age/employment but income 1.5 Crore)');
  const p14 = createCitizen({ age: 20, employmentStatus: EmploymentStatus.STUDENT, annualIncomeINR: 15000000 });
  const resP14 = evaluator.evaluateDetailedEligibility(p14, schemeUPPostMatric);
  assert(resP14.eligibilityStatus === 'NOT_ELIGIBLE', 'P14: Partial match with 1 failure is NOT_ELIGIBLE');
  assert(resP14.recommendation.isEligible === false, 'P14: isEligible is strictly false');

  console.log('\n----------------------------------------------------------------');
  console.log('2. MULTIPLE REAL SCHEME RULES TESTING');
  console.log('----------------------------------------------------------------');

  const farmerCitizen = createCitizen({
    employmentStatus: EmploymentStatus.FARMER,
    annualIncomeINR: 180000,
    age: 35,
    address: { id: 'a1', streetAddress: 'Main', city: 'Varanasi', district: 'Varanasi', state: 'Uttar Pradesh', pincode: '221001', isRural: true },
  });

  const studentCitizen = createCitizen({
    employmentStatus: EmploymentStatus.STUDENT,
    annualIncomeINR: 120000,
    age: 21,
    address: { id: 'a2', streetAddress: 'Civil Lines', city: 'Lucknow', district: 'Lucknow', state: 'Uttar Pradesh', pincode: '226001', isRural: false },
  });

  const affluentCitizen = createCitizen({
    employmentStatus: EmploymentStatus.EMPLOYED,
    annualIncomeINR: 2500000,
    age: 40,
  });

  // PM-KISAN Evaluation
  assert(evaluator.evaluateDetailedEligibility(farmerCitizen, schemePMKisan).eligibilityStatus === 'ELIGIBLE', 'Real Scheme: PM-KISAN for Farmer is ELIGIBLE');
  assert(evaluator.evaluateDetailedEligibility(studentCitizen, schemePMKisan).eligibilityStatus === 'NOT_ELIGIBLE', 'Real Scheme: PM-KISAN for Student is NOT_ELIGIBLE');
  assert(evaluator.evaluateDetailedEligibility(affluentCitizen, schemePMKisan).eligibilityStatus === 'NOT_ELIGIBLE', 'Real Scheme: PM-KISAN for Affluent is NOT_ELIGIBLE');

  // PMAY-G Evaluation
  assert(evaluator.evaluateDetailedEligibility(farmerCitizen, schemePMAY).eligibilityStatus === 'ELIGIBLE', 'Real Scheme: PMAY-G for Rural Farmer is ELIGIBLE');
  assert(evaluator.evaluateDetailedEligibility(studentCitizen, schemePMAY).eligibilityStatus === 'NOT_ELIGIBLE', 'Real Scheme: PMAY-G for Urban Student is NOT_ELIGIBLE');

  // UP Post-Matric Evaluation
  assert(evaluator.evaluateDetailedEligibility(studentCitizen, schemeUPPostMatric).eligibilityStatus === 'ELIGIBLE', 'Real Scheme: UP Post-Matric for UP Student is ELIGIBLE');
  assert(evaluator.evaluateDetailedEligibility(farmerCitizen, schemeUPPostMatric).eligibilityStatus === 'NOT_ELIGIBLE', 'Real Scheme: UP Post-Matric for Farmer is NOT_ELIGIBLE');

  // Ayushman Bharat PMJAY Evaluation
  assert(evaluator.evaluateDetailedEligibility(farmerCitizen, schemeAyushman).eligibilityStatus === 'ELIGIBLE', 'Real Scheme: PMJAY for Farmer (Income 180k) is ELIGIBLE');
  assert(evaluator.evaluateDetailedEligibility(studentCitizen, schemeAyushman).eligibilityStatus === 'ELIGIBLE', 'Real Scheme: PMJAY for Student (Income 120k, Age 21) is ELIGIBLE');
  assert(evaluator.evaluateDetailedEligibility(affluentCitizen, schemeAyushman).eligibilityStatus === 'NOT_ELIGIBLE', 'Real Scheme: PMJAY for Affluent (Income 25L) is NOT_ELIGIBLE');

  console.log('\n----------------------------------------------------------------');
  console.log('3. FRONTEND & API ELIGIBLE SCHEMES FILTERING CONTRACT VERIFICATION');
  console.log('----------------------------------------------------------------');

  const allSchemes = [schemePMKisan, schemePMAY, schemeUPPostMatric, schemeAyushman, schemeVerifRequired];
  const farmerEvaluations = allSchemes.map(s => evaluator.evaluateDetailedEligibility(farmerCitizen, s));

  // Partitioning check
  const eligibleSchemes = farmerEvaluations.filter(e => e.eligibilityStatus === 'ELIGIBLE' && e.recommendation.isEligible === true);
  const notEligibleSchemes = farmerEvaluations.filter(e => e.eligibilityStatus === 'NOT_ELIGIBLE');
  const needsVerifSchemes = farmerEvaluations.filter(e => e.eligibilityStatus === 'NEEDS_VERIFICATION');
  const incompleteSchemes = farmerEvaluations.filter(e => e.eligibilityStatus === 'INCOMPLETE_PROFILE');

  assert(eligibleSchemes.length === 4, 'Filtering: Exactly 4 schemes are ELIGIBLE for Farmer (PM-KISAN, PMAY-G, PMJAY, Verified Grant)');
  assert(notEligibleSchemes.some(e => e.recommendation.schemeId === schemeUPPostMatric.id), 'Filtering: UP Post-Matric is in NOT_ELIGIBLE');
  assert(eligibleSchemes.every(e => e.recommendation.isEligible === true), 'Filtering: 100% of schemes in Eligible section have isEligible === true');
  assert(notEligibleSchemes.every(e => e.recommendation.isEligible === false), 'Filtering: 0% of NOT_ELIGIBLE schemes have isEligible === true');
  assert(needsVerifSchemes.every(e => e.recommendation.isEligible === false), 'Filtering: 0% of NEEDS_VERIFICATION schemes have isEligible === true');
  assert(incompleteSchemes.every(e => e.recommendation.isEligible === false), 'Filtering: 0% of INCOMPLETE schemes have isEligible === true');

  console.log('\n----------------------------------------------------------------');
  console.log('4. PROFILE MUTATION & CACHE INVALIDATION LIFECYCLE');
  console.log('----------------------------------------------------------------');

  console.log('Step 1: Citizen is Farmer with Income 180,000 -> PM-KISAN is ELIGIBLE');
  let dynamicCitizen = createCitizen({ employmentStatus: EmploymentStatus.FARMER, annualIncomeINR: 180000 });
  let eval1 = evaluator.evaluateDetailedEligibility(dynamicCitizen, schemePMKisan);
  assert(eval1.eligibilityStatus === 'ELIGIBLE', 'Mutation Step 1: Initial state is ELIGIBLE');

  console.log('Step 2: Citizen updates Income to 800,000 -> Recalculation triggers -> PM-KISAN becomes NOT_ELIGIBLE');
  dynamicCitizen.updateDemographics({ annualIncomeINR: 800000 });
  let eval2 = evaluator.evaluateDetailedEligibility(dynamicCitizen, schemePMKisan);
  assert(eval2.eligibilityStatus === 'NOT_ELIGIBLE', 'Mutation Step 2: After income increase, status immediately becomes NOT_ELIGIBLE');
  assert(eval2.recommendation.isEligible === false, 'Mutation Step 2: isEligible immediately becomes false');

  console.log('Step 3: Citizen updates Employment to STUDENT, State UP -> UP Post-Matric becomes ELIGIBLE');
  dynamicCitizen.updateDemographics({ employmentStatus: EmploymentStatus.STUDENT, annualIncomeINR: 150000 });
  let eval3 = evaluator.evaluateDetailedEligibility(dynamicCitizen, schemeUPPostMatric);
  assert(eval3.eligibilityStatus === 'ELIGIBLE', 'Mutation Step 3: UP Post-Matric becomes ELIGIBLE');
  let eval3Pmkisan = evaluator.evaluateDetailedEligibility(dynamicCitizen, schemePMKisan);
  assert(eval3Pmkisan.eligibilityStatus === 'NOT_ELIGIBLE', 'Mutation Step 3: PM-KISAN becomes NOT_ELIGIBLE');

  console.log('\n----------------------------------------------------------------');
  console.log('5. AI CONTEXT MINIMIZATION & DETERMINISTIC SOURCE OF TRUTH');
  console.log('----------------------------------------------------------------');

  const minimizer = new AiDataMinimizerService();
  const rawProfileObj = {
    employmentStatus: dynamicCitizen.employmentStatus,
    annualIncomeINR: dynamicCitizen.annualIncomeINR,
    socialCategory: dynamicCitizen.socialCategory,
    gender: dynamicCitizen.gender,
    dateOfBirth: dynamicCitizen.dateOfBirth,
    address: dynamicCitizen.address,
    passwordHash: 'secret_hash',
    aadhaarHash: 'secret_aadhaar',
  };
  const minimized = minimizer.minimizeCitizenProfile(rawProfileObj);

  assert(minimized !== null && minimized.employmentStatus === 'STUDENT', 'AI Context: employmentStatus passed truthfully');
  assert(Boolean(minimized && (minimized.annualIncomeTier.includes('1.5 Lakhs') || minimized.annualIncomeTier.includes('150,000') || minimized.annualIncomeTier.includes('2.5 Lakhs'))), 'AI Context: annualIncomeTier computed');
  assert((minimized as any)?.passwordHash === undefined, 'AI Context: passwordHash strictly excluded');
  assert((minimized as any)?.aadhaarHash === undefined, 'AI Context: aadhaarHash strictly excluded');

  console.log('\n================================================================');
  console.log(` ALL ${passedAssertions}/${totalAssertions} ACCURACY AUDIT ASSERTIONS PASSED WITH ZERO FAILURES! `);
  console.log('================================================================\n');
}

runTestSuite()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
