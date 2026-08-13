import { EligibilityEvaluatorService } from './services/eligibility-evaluator.service';
import { CitizenEntity, Gender, MaritalStatus, SocialCategory, EmploymentStatus, DisabilityType } from '../../domain/citizen/citizen.entity';
import { WelfareSchemeEntity, SchemeCategory } from '../../domain/welfare/scheme.entity';

describe('EligibilityEvaluatorService - 5 Citizen Personas UAT', () => {
  let evaluator: EligibilityEvaluatorService;

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

  beforeEach(() => {
    evaluator = new EligibilityEvaluatorService();
  });

  // PERSONA A: Student (Age 20, OBC, STUDENT, ₹150k, UP)
  it('Persona A (UP Student) should qualify for UP Scholarship', () => {
    const student = new CitizenEntity({
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

    const rec = evaluator.evaluateEligibility(student, upScholarship);
    expect(rec.isEligible).toBe(true);
    expect(rec.matchPercentage).toBe(100);
    expect(rec.estimatedBenefit).toBe(50000);
  });

  // PERSONA B: Senior Citizen (Age 65, GENERAL, RETIRED, ₹100k, UP)
  it('Persona B (Senior Citizen) should qualify for NSAP Pension and fail Student Scholarship', () => {
    const senior = new CitizenEntity({
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

    const pensionRec = evaluator.evaluateEligibility(senior, nsapPension);
    expect(pensionRec.isEligible).toBe(true);
    expect(pensionRec.matchPercentage).toBe(100);

    const scholarshipRec = evaluator.evaluateEligibility(senior, upScholarship);
    expect(scholarshipRec.isEligible).toBe(false);
    expect(scholarshipRec.matchPercentage).toBeLessThan(100);
  });

  // PERSONA C: Farmer (Age 45, GENERAL, FARMER, ₹180k, UP)
  it('Persona C (Farmer) should qualify for PM-KISAN and fail Senior Pension', () => {
    const farmer = new CitizenEntity({
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

    const kisanRec = evaluator.evaluateEligibility(farmer, pmKisan);
    expect(kisanRec.isEligible).toBe(true);
    expect(kisanRec.matchPercentage).toBe(100);

    const pensionRec = evaluator.evaluateEligibility(farmer, nsapPension);
    expect(pensionRec.isEligible).toBe(false); // Age < 60
  });

  // PERSONA D: Higher-Income Employed Citizen (Age 30, GENERAL, EMPLOYED, ₹15,00,000, UP)
  it('Persona D (High Income) should fail income ceilings on welfare schemes', () => {
    const highIncome = new CitizenEntity({
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

    const kisanRec = evaluator.evaluateEligibility(highIncome, pmKisan);
    expect(kisanRec.isEligible).toBe(false);

    const scholarshipRec = evaluator.evaluateEligibility(highIncome, upScholarship);
    expect(scholarshipRec.isEligible).toBe(false);
  });

  // PERSONA E: Student from Maharashtra (Age 20, OBC, STUDENT, ₹150k, Maharashtra)
  it('Persona E (Maharashtra Student) should be rejected from UP State Scholarship on domicile', () => {
    const mhStudent = new CitizenEntity({
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

    const rec = evaluator.evaluateEligibility(mhStudent, upScholarship);
    expect(rec.isEligible).toBe(false);
    expect(rec.missingCriteria.some(c => c.includes('restricted to residents of Uttar Pradesh'))).toBe(true);
  });
});
