import { EligibilityEvaluatorService } from './modules/recommendation/services/eligibility-evaluator.service';
import { CitizenEntity, Gender, MaritalStatus, SocialCategory, EmploymentStatus, DisabilityType } from './domain/citizen/citizen.entity';
import { WelfareSchemeEntity, SchemeCategory } from './domain/welfare/scheme.entity';

console.log('====================================================');
console.log(' BENEFITOS — STRICT DETERMINISTIC ELIGIBILITY TESTS ');
console.log('====================================================\n');

const evaluator = new EligibilityEvaluatorService();

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    console.log(`PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`FAIL: ${testName} - ${detail || ''}`);
    throw new Error(`Test failed: ${testName}`);
  }
}

function createTestCitizen(overrides: Partial<any> = {}): CitizenEntity {
  return new CitizenEntity({
    id: overrides.id || 'cit-test-id',
    userId: overrides.userId || 'usr-test-id',
    firstName: overrides.firstName !== undefined ? overrides.firstName : 'TestFirstName',
    lastName: overrides.lastName !== undefined ? overrides.lastName : 'TestLastName',
    dateOfBirth: overrides.dateOfBirth !== undefined ? overrides.dateOfBirth : new Date(new Date().getFullYear() - 25, 0, 1),
    gender: overrides.gender !== undefined ? overrides.gender : Gender.MALE,
    maritalStatus: overrides.maritalStatus !== undefined ? overrides.maritalStatus : MaritalStatus.SINGLE,
    socialCategory: overrides.socialCategory !== undefined ? overrides.socialCategory : SocialCategory.GENERAL,
    employmentStatus: overrides.employmentStatus !== undefined ? overrides.employmentStatus : EmploymentStatus.EMPLOYED,
    annualIncomeINR: overrides.annualIncomeINR !== undefined ? overrides.annualIncomeINR : 300000,
    disabilityType: overrides.disabilityType !== undefined ? overrides.disabilityType : DisabilityType.NONE,
    disabilityPercent: overrides.disabilityPercent !== undefined ? overrides.disabilityPercent : 0,
    isBplCardHolder: overrides.isBplCardHolder !== undefined ? overrides.isBplCardHolder : false,
    address: overrides.address !== undefined ? overrides.address : {
      id: 'addr-test',
      streetAddress: '123 Main St',
      city: 'Lucknow',
      district: 'Lucknow',
      state: 'Uttar Pradesh',
      pincode: '226001',
      isRural: false,
    },
  });
}

// -------------------------------------------------------------
// CANONICAL SCHEME DEFINITIONS FOR BOUNDARY TESTING
// -------------------------------------------------------------
const pmKisanScheme = new WelfareSchemeEntity({
  id: 'sch-pm-kisan',
  code: 'PM-KISAN',
  title: 'Pradhan Mantri Kisan Samman Nidhi',
  description: 'Income support of Rs 6,000 per year for farmer families.',
  category: SchemeCategory.AGRICULTURE,
  department: 'Ministry of Agriculture and Farmers Welfare',
  financialBenefit: 6000,
  isCentralScheme: true,
  isActive: true,
  eligibilityRules: [
    { id: 'r1', attributeKey: 'employmentStatus', operator: 'EQUALS', targetValue: 'FARMER', isRequired: true, description: 'Must be engaged in farming' },
    { id: 'r2', attributeKey: 'annualIncomeINR', operator: 'LESS_EQUAL', targetValue: '400000', isRequired: true, description: 'Income <= 400000' },
  ],
});

const youthScholarshipScheme = new WelfareSchemeEntity({
  id: 'sch-youth-scholarship',
  code: 'YOUTH-SCHOLARSHIP',
  title: 'Youth Higher Education Scholarship',
  description: 'Scholarship for youth aged 18 to 25 with income under 2.5 Lakhs.',
  category: SchemeCategory.EDUCATION,
  department: 'Ministry of Education',
  financialBenefit: 25000,
  isCentralScheme: true,
  isActive: true,
  eligibilityRules: [
    { id: 'r-age-min', attributeKey: 'age', operator: 'GREATER_EQUAL', targetValue: '18', isRequired: true, description: 'Age >= 18' },
    { id: 'r-age-max', attributeKey: 'age', operator: 'LESS_EQUAL', targetValue: '25', isRequired: true, description: 'Age <= 25' },
    { id: 'r-emp', attributeKey: 'employmentStatus', operator: 'EQUALS', targetValue: 'STUDENT', isRequired: true, description: 'Must be a student' },
    { id: 'r-inc', attributeKey: 'annualIncomeINR', operator: 'LESS_EQUAL', targetValue: '250000', isRequired: true, description: 'Income <= 250000' },
  ],
});

const upStateScheme = new WelfareSchemeEntity({
  id: 'sch-up-scholarship',
  code: 'UP-POST-MATRIC',
  title: 'UP Post-Matric Scholarship',
  description: 'State scholarship for Uttar Pradesh residents.',
  category: SchemeCategory.EDUCATION,
  department: 'Social Welfare Department, UP',
  state: 'Uttar Pradesh',
  isCentralScheme: false,
  financialBenefit: 50000,
  isActive: true,
  eligibilityRules: [
    { id: 'r-emp', attributeKey: 'employmentStatus', operator: 'EQUALS', targetValue: 'STUDENT', isRequired: true, description: 'Must be a student' },
  ],
});

// -------------------------------------------------------------
// 11 EXPLICIT BOUNDARY TEST CASES
// -------------------------------------------------------------

// Case 1: Clearly eligible citizen
console.log('Scenario 1: Clearly eligible citizen...');
const eligibleFarmer = createTestCitizen({
  employmentStatus: EmploymentStatus.FARMER,
  annualIncomeINR: 200000,
});
const res1 = evaluator.evaluateDetailedEligibility(eligibleFarmer, pmKisanScheme);
assert(res1.eligibilityStatus === 'ELIGIBLE', 'Case 1: Clearly eligible citizen has status ELIGIBLE');
assert(res1.recommendation.isEligible === true, 'Case 1: isEligible is true');
assert(res1.recommendation.matchPercentage === 100, 'Case 1: matchPercentage is 100%');

// Case 2: Clearly ineligible citizen
console.log('\nScenario 2: Clearly ineligible citizen...');
const ineligibleCitizen = createTestCitizen({
  employmentStatus: EmploymentStatus.UNEMPLOYED,
  annualIncomeINR: 900000,
});
const res2 = evaluator.evaluateDetailedEligibility(ineligibleCitizen, pmKisanScheme);
assert(res2.eligibilityStatus === 'NOT_ELIGIBLE', 'Case 2: Clearly ineligible citizen has status NOT_ELIGIBLE');
assert(res2.recommendation.isEligible === false, 'Case 2: isEligible is false');
assert(res2.failedRules.length > 0, 'Case 2: failedRules contains specific rejection reasons');

// Case 3: Incomplete profile (missing income / employment / address)
console.log('\nScenario 3: Incomplete profile...');
const incompleteCitizen = new CitizenEntity({
  id: 'cit-incomplete',
  userId: 'usr-inc',
  firstName: 'Priya',
  lastName: 'Gupta',
  dateOfBirth: new Date('2000-01-01'),
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
const res3 = evaluator.evaluateDetailedEligibility(incompleteCitizen, pmKisanScheme);
assert(res3.eligibilityStatus === 'INCOMPLETE_PROFILE', 'Case 3: Incomplete profile categorized as INCOMPLETE_PROFILE');
assert(res3.recommendation.isEligible === false, 'Case 3: isEligible is strictly false');
assert(res3.missingProfileFields.length > 0, 'Case 3: Lists missing profile fields');

// Case 4: Age exactly at lower boundary (Age 18 for Scheme [18 - 25])
console.log('\nScenario 4: Age exactly at lower boundary (18)...');
const citizenAge18 = createTestCitizen({
  dateOfBirth: new Date(new Date().getFullYear() - 18, 0, 1),
  employmentStatus: EmploymentStatus.STUDENT,
  annualIncomeINR: 150000,
});
const res4 = evaluator.evaluateDetailedEligibility(citizenAge18, youthScholarshipScheme);
assert(res4.eligibilityStatus === 'ELIGIBLE', 'Case 4: Age exactly 18 is ELIGIBLE');
assert(res4.recommendation.isEligible === true, 'Case 4: isEligible is true');

// Case 5: Age exactly at upper boundary (Age 25 for Scheme [18 - 25])
console.log('\nScenario 5: Age exactly at upper boundary (25)...');
const citizenAge25 = createTestCitizen({
  dateOfBirth: new Date(new Date().getFullYear() - 25, 0, 1),
  employmentStatus: EmploymentStatus.STUDENT,
  annualIncomeINR: 150000,
});
const res5 = evaluator.evaluateDetailedEligibility(citizenAge25, youthScholarshipScheme);
assert(res5.eligibilityStatus === 'ELIGIBLE', 'Case 5: Age exactly 25 is ELIGIBLE');
assert(res5.recommendation.isEligible === true, 'Case 5: isEligible is true');

// Sub-case: Age 26 (1 year above upper boundary)
const citizenAge26 = createTestCitizen({
  dateOfBirth: new Date(new Date().getFullYear() - 26, 0, 1),
  employmentStatus: EmploymentStatus.STUDENT,
  annualIncomeINR: 150000,
});
const res5b = evaluator.evaluateDetailedEligibility(citizenAge26, youthScholarshipScheme);
assert(res5b.eligibilityStatus === 'NOT_ELIGIBLE', 'Case 5b: Age 26 is NOT_ELIGIBLE');

// Case 6: Income exactly at allowed limit (INR 2,50,000 for limit <= 250000)
console.log('\nScenario 6: Income exactly at allowed limit (250,000)...');
const citizenIncome250k = createTestCitizen({
  dateOfBirth: new Date(new Date().getFullYear() - 20, 0, 1),
  employmentStatus: EmploymentStatus.STUDENT,
  annualIncomeINR: 250000,
});
const res6 = evaluator.evaluateDetailedEligibility(citizenIncome250k, youthScholarshipScheme);
assert(res6.eligibilityStatus === 'ELIGIBLE', 'Case 6: Income exactly 250,000 is ELIGIBLE');

// Case 7: Income above allowed limit (INR 250,001 for limit <= 250000)
console.log('\nScenario 7: Income above allowed limit (250,001)...');
const citizenIncome250001 = createTestCitizen({
  dateOfBirth: new Date(new Date().getFullYear() - 20, 0, 1),
  employmentStatus: EmploymentStatus.STUDENT,
  annualIncomeINR: 250001,
});
const res7 = evaluator.evaluateDetailedEligibility(citizenIncome250001, youthScholarshipScheme);
assert(res7.eligibilityStatus === 'NOT_ELIGIBLE', 'Case 7: Income 250,001 is NOT_ELIGIBLE');
assert(res7.statusReason.includes('Income') || res7.statusReason.includes('annualIncomeINR'), 'Case 7: Status reason cites income limit failure');


// Case 8: Wrong residence state (State restricted scheme)
console.log('\nScenario 8: Wrong residence state (Bihar resident on UP scheme)...');
const biharStudent = createTestCitizen({
  employmentStatus: EmploymentStatus.STUDENT,
  address: {
    id: 'addr-bihar',
    streetAddress: 'Boring Road',
    city: 'Patna',
    district: 'Patna',
    state: 'Bihar',
    pincode: '800001',
    isRural: false,
  },
});
const res8 = evaluator.evaluateDetailedEligibility(biharStudent, upStateScheme);
assert(res8.eligibilityStatus === 'NOT_ELIGIBLE', 'Case 8: Wrong state resident is NOT_ELIGIBLE');
assert(res8.statusReason.includes('State mismatch'), 'Case 8: Status reason cites state mismatch');

// Case 9: Wrong occupation (Employed citizen on Student scheme)
console.log('\nScenario 9: Wrong occupation (Self-employed on Student scheme)...');
const selfEmployedCitizen = createTestCitizen({
  dateOfBirth: new Date(new Date().getFullYear() - 22, 0, 1),
  employmentStatus: EmploymentStatus.SELF_EMPLOYED,
  annualIncomeINR: 100000,
});
const res9 = evaluator.evaluateDetailedEligibility(selfEmployedCitizen, youthScholarshipScheme);
assert(res9.eligibilityStatus === 'NOT_ELIGIBLE', 'Case 9: Wrong occupation is NOT_ELIGIBLE');

// Case 10: Missing required verification (Missing state on state scheme)
console.log('\nScenario 10: Missing required verification / state residency...');
const noStateCitizen = createTestCitizen({
  employmentStatus: EmploymentStatus.STUDENT,
  address: {
    id: 'addr-default',
    streetAddress: 'Default Street',
    city: 'Default City',
    district: 'Default District',
    state: 'DEFAULT',
    pincode: '000000',
    isRural: false,
  },
});
const res10 = evaluator.evaluateDetailedEligibility(noStateCitizen, upStateScheme);
assert(res10.eligibilityStatus === 'INCOMPLETE_PROFILE', 'Case 10: Unspecified state results in INCOMPLETE_PROFILE');

// Case 11: Conflicting profile values
console.log('\nScenario 11: Conflicting profile values (Age satisfies but income fails)...');
const conflictCitizen = createTestCitizen({
  dateOfBirth: new Date(new Date().getFullYear() - 20, 0, 1),
  employmentStatus: EmploymentStatus.STUDENT,
  annualIncomeINR: 800000, // Meets age & student, but fails income
});
const res11 = evaluator.evaluateDetailedEligibility(conflictCitizen, youthScholarshipScheme);
assert(res11.eligibilityStatus === 'NOT_ELIGIBLE', 'Case 11: Partial match with 1 failure is strictly NOT_ELIGIBLE');
assert(res11.recommendation.isEligible === false, 'Case 11: isEligible is false');
assert(res11.passedRules.length > 0, 'Case 11: Records passed rules');
assert(res11.failedRules.length > 0, 'Case 11: Records failed rules');

console.log('\n====================================================');
console.log(` ALL 11/11 STRICT ELIGIBILITY SCENARIOS PASSED! (${passedTests}/${totalTests} assertions) `);
console.log('====================================================\n');
