import { EligibilityEvaluatorService } from './modules/recommendation/services/eligibility-evaluator.service';
import { CitizenEntity, Gender, MaritalStatus, SocialCategory, EmploymentStatus, DisabilityType } from './domain/citizen/citizen.entity';
import { WelfareSchemeEntity, SchemeCategory } from './domain/welfare/scheme.entity';

console.log('====================================================');
console.log('   BENEFITOS — STRICT ELIGIBILITY BOUNDARY TESTS   ');
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

// 1. AGE BOUNDARY TESTS (Scheme requires age >= 60)
const seniorPensionScheme = new WelfareSchemeEntity({
  id: 'scheme-senior-pension',
  code: 'NSAP-OLD-AGE',
  title: 'NSAP Old Age Pension',
  description: 'Pension for senior citizens aged 60 and above.',
  category: SchemeCategory.SOCIAL_SECURITY,
  department: 'Ministry of Rural Development',
  financialBenefit: 12000,
  isCentralScheme: true,
  isActive: true,
  eligibilityRules: [
    { id: 'r-age', attributeKey: 'age', operator: 'GREATER_EQUAL', targetValue: '60', isRequired: true, description: 'Age >= 60' },
  ],
});

// Citizen exactly 60
const citizenAge60 = createTestCitizen({
  id: 'cit-60',
  dateOfBirth: new Date(new Date().getFullYear() - 60, 0, 1),
  annualIncomeINR: 100000,
});
const resAge60 = evaluator.evaluateDetailedEligibility(citizenAge60, seniorPensionScheme);
assert(resAge60.recommendation.isEligible === true, 'Boundary Age: Exactly 60 is ELIGIBLE');
assert(resAge60.eligibilityStatus === 'ELIGIBLE', 'Boundary Age: Exactly 60 has status ELIGIBLE');

// Citizen 59 (1 year below)
const citizenAge59 = createTestCitizen({
  id: 'cit-59',
  dateOfBirth: new Date(new Date().getFullYear() - 59, 0, 1),
  annualIncomeINR: 100000,
});
const resAge59 = evaluator.evaluateDetailedEligibility(citizenAge59, seniorPensionScheme);
assert(resAge59.recommendation.isEligible === false, 'Boundary Age: Age 59 is NOT ELIGIBLE');
assert(resAge59.eligibilityStatus === 'NOT_ELIGIBLE', 'Boundary Age: Age 59 has status NOT_ELIGIBLE');

// 2. INCOME BOUNDARY TESTS (Scheme requires income <= 2,50,000)
const incomeCapScheme = new WelfareSchemeEntity({
  id: 'scheme-income-cap',
  code: 'BPL-SUBSIDY',
  title: 'Income Capped Subsidy',
  description: 'Subsidy for low income families.',
  category: SchemeCategory.FINANCIAL_INCLUSION,
  department: 'Department of Social Welfare',
  financialBenefit: 25000,
  isCentralScheme: true,
  isActive: true,
  eligibilityRules: [
    { id: 'r-inc', attributeKey: 'annualIncomeINR', operator: 'LESS_EQUAL', targetValue: '250000', isRequired: true, description: 'Income <= 250000' },
  ],
});

// Citizen with income exactly 250,000
const citizenIncome250k = createTestCitizen({
  id: 'cit-250k',
  dateOfBirth: new Date(new Date().getFullYear() - 30, 0, 1),
  annualIncomeINR: 250000,
});
const resInc250k = evaluator.evaluateDetailedEligibility(citizenIncome250k, incomeCapScheme);
assert(resInc250k.recommendation.isEligible === true, 'Boundary Income: Exactly 250,000 is ELIGIBLE');

// Citizen with income 250,001 (exceeds by 1 rupee)
const citizenIncome250001 = createTestCitizen({
  id: 'cit-250001',
  dateOfBirth: new Date(new Date().getFullYear() - 30, 0, 1),
  annualIncomeINR: 250001,
});
const resInc250001 = evaluator.evaluateDetailedEligibility(citizenIncome250001, incomeCapScheme);
assert(resInc250001.recommendation.isEligible === false, 'Boundary Income: 250,001 is NOT ELIGIBLE');
assert(resInc250001.eligibilityStatus === 'NOT_ELIGIBLE', 'Boundary Income: 250,001 has status NOT_ELIGIBLE');

// 3. STATE AND DOMICILE RESTRICTIONS
const stateScheme = new WelfareSchemeEntity({
  id: 'scheme-bihar',
  code: 'BIHAR-STUDENT-CREDIT',
  title: 'Bihar Student Credit Card Scheme',
  description: 'Education loan scheme for Bihar residents.',
  category: SchemeCategory.EDUCATION,
  department: 'Education Dept, Bihar',
  financialBenefit: 400000,
  isCentralScheme: false,
  state: 'Bihar',
  isActive: true,
  eligibilityRules: [
    { id: 'r-stud', attributeKey: 'employmentStatus', operator: 'EQUALS', targetValue: 'STUDENT', isRequired: true, description: 'Must be a student' },
  ],
});

const citizenBihar = createTestCitizen({
  id: 'cit-bihar',
  employmentStatus: EmploymentStatus.STUDENT,
  address: { id: 'a1', streetAddress: 'Bailey Rd', city: 'Patna', district: 'Patna', state: 'Bihar', pincode: '800001', isRural: false },
});
const resBihar = evaluator.evaluateDetailedEligibility(citizenBihar, stateScheme);
assert(resBihar.recommendation.isEligible === true, 'State Domicile: Resident of Bihar is ELIGIBLE for Bihar scheme');

const citizenDelhi = createTestCitizen({
  id: 'cit-delhi',
  employmentStatus: EmploymentStatus.STUDENT,
  address: { id: 'a2', streetAddress: 'Connaught Place', city: 'New Delhi', district: 'New Delhi', state: 'Delhi', pincode: '110001', isRural: false },
});
const resDelhi = evaluator.evaluateDetailedEligibility(citizenDelhi, stateScheme);
assert(resDelhi.recommendation.isEligible === false, 'State Domicile: Resident of Delhi is NOT ELIGIBLE for Bihar scheme');
assert(resDelhi.failedRules.some(r => r.includes('State mismatch')), 'State Domicile: State mismatch is explicitly noted in failedRules');

// 4. OCCUPATION RESTRICTIONS (Must be FARMER)
const farmerScheme = new WelfareSchemeEntity({
  id: 'scheme-farmer-equip',
  code: 'AGRI-EQUIP-SUBSIDY',
  title: 'Agricultural Equipment Subsidy',
  description: 'Subsidy for farming equipment.',
  category: SchemeCategory.AGRICULTURE,
  department: 'Dept of Agriculture',
  financialBenefit: 50000,
  isCentralScheme: true,
  isActive: true,
  eligibilityRules: [
    { id: 'r-occ', attributeKey: 'employmentStatus', operator: 'EQUALS', targetValue: 'FARMER', isRequired: true, description: 'Must be a farmer' },
  ],
});

const farmerCitizen = createTestCitizen({
  id: 'cit-farmer',
  employmentStatus: EmploymentStatus.FARMER,
});
assert(evaluator.evaluateEligibility(farmerCitizen, farmerScheme).isEligible === true, 'Occupation: FARMER is ELIGIBLE');

const employedCitizen = createTestCitizen({
  id: 'cit-employed',
  employmentStatus: EmploymentStatus.EMPLOYED,
});
assert(evaluator.evaluateEligibility(employedCitizen, farmerScheme).isEligible === false, 'Occupation: EMPLOYED is NOT ELIGIBLE for farmer scheme');

// 5. SOCIAL CATEGORY RESTRICTIONS (IN: SC, ST)
const scStScheme = new WelfareSchemeEntity({
  id: 'scheme-sc-st',
  code: 'SC-ST-COACHING',
  title: 'Free Coaching for SC and ST Students',
  description: 'Coaching support.',
  category: SchemeCategory.EDUCATION,
  department: 'Ministry of Social Justice',
  financialBenefit: 30000,
  isCentralScheme: true,
  isActive: true,
  eligibilityRules: [
    { id: 'r-cat', attributeKey: 'socialCategory', operator: 'IN', targetValue: 'SC, ST', isRequired: true, description: 'Must belong to SC or ST' },
  ],
});

const scCitizen = createTestCitizen({
  id: 'cit-sc',
  socialCategory: SocialCategory.SC,
});
assert(evaluator.evaluateEligibility(scCitizen, scStScheme).isEligible === true, 'Social Category: SC is ELIGIBLE for SC/ST scheme');

const generalCitizen = createTestCitizen({
  id: 'cit-gen',
  socialCategory: SocialCategory.GENERAL,
});
assert(evaluator.evaluateEligibility(generalCitizen, scStScheme).isEligible === false, 'Social Category: GENERAL is NOT ELIGIBLE for SC/ST scheme');

// 6. DISABILITY RESTRICTIONS (Percent >= 40)
const disabilityPension = new WelfareSchemeEntity({
  id: 'scheme-divyang',
  code: 'DIVYANG-PENSION',
  title: 'Divyangjan Monthly Pension',
  description: 'Pension for persons with disability >= 40%.',
  category: SchemeCategory.SOCIAL_SECURITY,
  department: 'Department of Empowerment of Persons with Disabilities',
  financialBenefit: 18000,
  isCentralScheme: true,
  isActive: true,
  eligibilityRules: [
    { id: 'r-dis', attributeKey: 'disabilityPercent', operator: 'GREATER_EQUAL', targetValue: '40', isRequired: true, description: 'Disability percent >= 40%' },
  ],
});

const citizenDivyang40 = createTestCitizen({
  id: 'cit-div-40',
  disabilityType: DisabilityType.LOCOMOTOR,
  disabilityPercent: 40,
});
assert(evaluator.evaluateEligibility(citizenDivyang40, disabilityPension).isEligible === true, 'Disability: 40% disability is ELIGIBLE');

const citizenDivyang35 = createTestCitizen({
  id: 'cit-div-35',
  disabilityType: DisabilityType.LOCOMOTOR,
  disabilityPercent: 35,
});
assert(evaluator.evaluateEligibility(citizenDivyang35, disabilityPension).isEligible === false, 'Disability: 35% disability is NOT ELIGIBLE (< 40%)');

// 7. MISSING MANDATORY ATTRIBUTES MUST NEVER BE MARKED ELIGIBLE
const complexScheme = new WelfareSchemeEntity({
  id: 'scheme-complex',
  code: 'PM-MATRU-VANDANA',
  title: 'Pradhan Mantri Matru Vandana Yojana',
  description: 'Maternity benefit scheme.',
  category: SchemeCategory.WOMEN_CHILD_DEVELOPMENT,
  department: 'Ministry of Women and Child Development',
  financialBenefit: 5000,
  isCentralScheme: true,
  isActive: true,
  eligibilityRules: [
    { id: 'r-c1', attributeKey: 'gender', operator: 'EQUALS', targetValue: 'FEMALE', isRequired: true, description: 'Female gender required' },
    { id: 'r-c2', attributeKey: 'annualIncomeINR', operator: 'LESS_EQUAL', targetValue: '800000', isRequired: true, description: 'Income <= 8 LPA' },
  ],
});

// Citizen missing income and gender
const incompleteCitizen = new CitizenEntity({
  id: 'cit-inc',
  userId: 'usr-inc',
  firstName: 'Test',
  lastName: 'User',
  dateOfBirth: new Date(),
  gender: null as any,
  maritalStatus: MaritalStatus.SINGLE,
  socialCategory: SocialCategory.GENERAL,
  employmentStatus: EmploymentStatus.UNEMPLOYED,
  annualIncomeINR: null as any,
  disabilityType: DisabilityType.NONE,
  disabilityPercent: 0,
  isBplCardHolder: false,
});
const resIncomplete = evaluator.evaluateDetailedEligibility(incompleteCitizen, complexScheme);
assert(resIncomplete.recommendation.isEligible === false, 'Missing Data: Incomplete citizen is NOT ELIGIBLE');
assert(resIncomplete.eligibilityStatus === 'INCOMPLETE_PROFILE', 'Missing Data: Status is strictly INCOMPLETE_PROFILE');
assert(resIncomplete.missingProfileFields.length >= 2, 'Missing Data: Identifies all missing profile fields');

console.log(`\n====================================================`);
console.log(`   ALL ${passedTests}/${totalTests} BOUNDARY TESTS PASSED SUCCESSFULLY!   `);
console.log(`====================================================\n`);
