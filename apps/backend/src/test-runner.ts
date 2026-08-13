import { EligibilityEvaluatorService } from './modules/recommendation/services/eligibility-evaluator.service';
import { CitizenEntity, Gender, MaritalStatus, SocialCategory, EmploymentStatus, DisabilityType } from './domain/citizen/citizen.entity';
import { WelfareSchemeEntity, SchemeCategory } from './domain/welfare/scheme.entity';

console.log('====================================================');
console.log('   BENEFITOS — 5 CITIZEN PERSONAS ELIGIBILITY UAT   ');
console.log('====================================================\n');

const evaluator = new EligibilityEvaluatorService();

const upScholarship = new WelfareSchemeEntity({
  id: 'sch-up-scholarship',
  code: 'UP-POST-MATRIC-SCHOLARSHIP',
  title: 'UP Post Matric Scholarship for OBC Students',
  description: 'Financial assistance for post-matric OBC students.',
  category: SchemeCategory.EDUCATION,
  department: 'Backward Classes Welfare Dept, UP',
  financialBenefit: 50000,
  isCentralScheme: false,
  isActive: true,
  state: 'Uttar Pradesh',
  eligibilityRules: [
    { id: 'r-1', attributeKey: 'socialCategory', operator: 'EQUALS', targetValue: 'OBC', isRequired: true, description: 'Must belong to OBC category' },
    { id: 'r-2', attributeKey: 'employmentStatus', operator: 'EQUALS', targetValue: 'STUDENT', isRequired: true, description: 'Must be actively enrolled as a student' },
    { id: 'r-3', attributeKey: 'annualIncomeINR', operator: 'LESS_EQUAL', targetValue: '250000', isRequired: true, description: 'Family income must not exceed 2.5 LPA' },
  ],
});

const pmKisan = new WelfareSchemeEntity({
  id: 'sch-pm-kisan',
  code: 'PM-KISAN',
  title: 'PM Kisan Samman Nidhi',
  description: 'Direct income support of 6000 per year for farmer families.',
  category: SchemeCategory.AGRICULTURE,
  department: 'Ministry of Agriculture',
  financialBenefit: 6000,
  isCentralScheme: true,
  isActive: true,
  eligibilityRules: [
    { id: 'r-4', attributeKey: 'employmentStatus', operator: 'EQUALS', targetValue: 'FARMER', isRequired: true, description: 'Must be a small/marginal farmer' },
    { id: 'r-5', attributeKey: 'annualIncomeINR', operator: 'LESS_EQUAL', targetValue: '400000', isRequired: true, description: 'Annual income must be within agricultural bounds' },
  ],
});

const nsapPension = new WelfareSchemeEntity({
  id: 'sch-nsap-pension',
  code: 'NSAP-NATIONAL-PENSION',
  title: 'National Social Assistance Old Age Pension',
  description: 'Old age pension assistance for senior citizens.',
  category: SchemeCategory.SOCIAL_SECURITY,
  department: 'Ministry of Rural Development',
  financialBenefit: 12000,
  isCentralScheme: true,
  isActive: true,
  eligibilityRules: [
    { id: 'r-6', attributeKey: 'age', operator: 'GREATER_EQUAL', targetValue: '60', isRequired: true, description: 'Age must be 60 years or above' },
    { id: 'r-7', attributeKey: 'annualIncomeINR', operator: 'LESS_EQUAL', targetValue: '200000', isRequired: true, description: 'Must fall below prescribed income limits' },
  ],
});

// PERSONA A: Student (Age 20, OBC, STUDENT, ₹150k, UP)
const personaA = new CitizenEntity({
  id: 'cit-student-up',
  userId: 'usr-student-up',
  firstName: 'Aarav',
  lastName: 'Verma',
  dateOfBirth: new Date(new Date().getFullYear() - 20, 0, 1),
  gender: Gender.MALE,
  maritalStatus: MaritalStatus.SINGLE,
  socialCategory: SocialCategory.OBC,
  employmentStatus: EmploymentStatus.STUDENT,
  annualIncomeINR: 150000,
  disabilityType: DisabilityType.NONE,
  disabilityPercent: 0,
  isBplCardHolder: false,
  address: { id: 'addr-1', streetAddress: 'Sector 5', city: 'Lucknow', district: 'Lucknow', state: 'Uttar Pradesh', pincode: '226001', isRural: false },
});

const resA = evaluator.evaluateEligibility(personaA, upScholarship);
console.log('PERSONA A (UP Student):');
console.log(`- Evaluated Scheme: ${upScholarship.title}`);
console.log(`- Match: ${resA.matchPercentage}% | Eligible: ${resA.isEligible} | Estimated Benefit: ₹${resA.estimatedBenefit}`);
console.log(`- Criteria Met: ${resA.criteriaMet.join('; ')}`);
if (!resA.isEligible) throw new Error('Persona A failed UP Scholarship eligibility');

// PERSONA B: Senior Citizen (Age 65, GENERAL, RETIRED, ₹100k, UP)
const personaB = new CitizenEntity({
  id: 'cit-senior',
  userId: 'usr-senior',
  firstName: 'Ramesh',
  lastName: 'Shukla',
  dateOfBirth: new Date(new Date().getFullYear() - 65, 0, 1),
  gender: Gender.MALE,
  maritalStatus: MaritalStatus.MARRIED,
  socialCategory: SocialCategory.GENERAL,
  employmentStatus: EmploymentStatus.RETIRED,
  annualIncomeINR: 100000,
  disabilityType: DisabilityType.NONE,
  disabilityPercent: 0,
  isBplCardHolder: false,
  address: { id: 'addr-2', streetAddress: 'Civil Lines', city: 'Kanpur', district: 'Kanpur', state: 'Uttar Pradesh', pincode: '208001', isRural: false },
});

const resB_Pension = evaluator.evaluateEligibility(personaB, nsapPension);
const resB_Scholarship = evaluator.evaluateEligibility(personaB, upScholarship);
console.log('\nPERSONA B (Senior Citizen):');
console.log(`- Evaluated Scheme (Pension): ${nsapPension.title} -> Match: ${resB_Pension.matchPercentage}%, Eligible: ${resB_Pension.isEligible}`);
console.log(`- Evaluated Scheme (Scholarship): ${upScholarship.title} -> Match: ${resB_Scholarship.matchPercentage}%, Eligible: ${resB_Scholarship.isEligible}`);
if (!resB_Pension.isEligible) throw new Error('Persona B failed Pension eligibility');
if (resB_Scholarship.isEligible) throw new Error('Persona B should not qualify for Student Scholarship');

// PERSONA C: Farmer (Age 45, GENERAL, FARMER, ₹180k, UP)
const personaC = new CitizenEntity({
  id: 'cit-farmer',
  userId: 'usr-farmer',
  firstName: 'Suresh',
  lastName: 'Yadav',
  dateOfBirth: new Date(new Date().getFullYear() - 45, 0, 1),
  gender: Gender.MALE,
  maritalStatus: MaritalStatus.MARRIED,
  socialCategory: SocialCategory.GENERAL,
  employmentStatus: EmploymentStatus.FARMER,
  annualIncomeINR: 180000,
  disabilityType: DisabilityType.NONE,
  disabilityPercent: 0,
  isBplCardHolder: false,
  address: { id: 'addr-3', streetAddress: 'Village Barabanki', city: 'Barabanki', district: 'Barabanki', state: 'Uttar Pradesh', pincode: '225001', isRural: true },
});

const resC_Kisan = evaluator.evaluateEligibility(personaC, pmKisan);
const resC_Pension = evaluator.evaluateEligibility(personaC, nsapPension);
console.log('\nPERSONA C (Farmer):');
console.log(`- Evaluated Scheme (PM-KISAN): ${pmKisan.title} -> Match: ${resC_Kisan.matchPercentage}%, Eligible: ${resC_Kisan.isEligible}`);
console.log(`- Evaluated Scheme (Senior Pension): ${nsapPension.title} -> Match: ${resC_Pension.matchPercentage}%, Eligible: ${resC_Pension.isEligible}`);
if (!resC_Kisan.isEligible) throw new Error('Persona C failed PM-KISAN eligibility');
if (resC_Pension.isEligible) throw new Error('Persona C should not qualify for Senior Pension (age 45 < 60)');

// PERSONA D: Higher-Income Employed (Age 30, GENERAL, EMPLOYED, ₹15,00,000, UP)
const personaD = new CitizenEntity({
  id: 'cit-high-income',
  userId: 'usr-high-income',
  firstName: 'Vikram',
  lastName: 'Mehta',
  dateOfBirth: new Date(new Date().getFullYear() - 30, 0, 1),
  gender: Gender.MALE,
  maritalStatus: MaritalStatus.SINGLE,
  socialCategory: SocialCategory.GENERAL,
  employmentStatus: EmploymentStatus.EMPLOYED,
  annualIncomeINR: 1500000,
  disabilityType: DisabilityType.NONE,
  disabilityPercent: 0,
  isBplCardHolder: false,
  address: { id: 'addr-4', streetAddress: 'Gomti Nagar', city: 'Lucknow', district: 'Lucknow', state: 'Uttar Pradesh', pincode: '226010', isRural: false },
});

const resD_Kisan = evaluator.evaluateEligibility(personaD, pmKisan);
const resD_Scholarship = evaluator.evaluateEligibility(personaD, upScholarship);
console.log('\nPERSONA D (High Income ₹15 LPA):');
console.log(`- Evaluated Scheme (PM-KISAN): Match: ${resD_Kisan.matchPercentage}%, Eligible: ${resD_Kisan.isEligible}`);
console.log(`- Evaluated Scheme (UP Scholarship): Match: ${resD_Scholarship.matchPercentage}%, Eligible: ${resD_Scholarship.isEligible}`);
if (resD_Kisan.isEligible || resD_Scholarship.isEligible) throw new Error('Persona D should fail income ceilings');

// PERSONA E: Student from Maharashtra (Age 20, OBC, STUDENT, ₹150k, Maharashtra)
const personaE = new CitizenEntity({
  id: 'cit-student-mh',
  userId: 'usr-student-mh',
  firstName: 'Pranav',
  lastName: 'Patil',
  dateOfBirth: new Date(new Date().getFullYear() - 20, 0, 1),
  gender: Gender.MALE,
  maritalStatus: MaritalStatus.SINGLE,
  socialCategory: SocialCategory.OBC,
  employmentStatus: EmploymentStatus.STUDENT,
  annualIncomeINR: 150000,
  disabilityType: DisabilityType.NONE,
  disabilityPercent: 0,
  isBplCardHolder: false,
  address: { id: 'addr-5', streetAddress: 'Shivaji Nagar', city: 'Pune', district: 'Pune', state: 'Maharashtra', pincode: '411005', isRural: false },
});

const resE_UP = evaluator.evaluateEligibility(personaE, upScholarship);
console.log('\nPERSONA E (Maharashtra Student):');
console.log(`- Evaluated Scheme (UP State Scholarship): Match: ${resE_UP.matchPercentage}%, Eligible: ${resE_UP.isEligible}`);
console.log(`- Missing Criteria: ${resE_UP.missingCriteria.join('; ')}`);
if (resE_UP.isEligible) throw new Error('Persona E should be excluded from UP State Scholarship based on domicile');

console.log('\n====================================================');
console.log('   ALL 5 CITIZEN PERSONAS VERIFIED SUCCESSFULLY!   ');
console.log('====================================================');
