import { EligibilityAiValidatorService } from './eligibility-ai-validator.service';
import { CitizenEntity, Gender, MaritalStatus, SocialCategory, EmploymentStatus, DisabilityType } from '../../../domain/citizen/citizen.entity';
import { WelfareSchemeEntity, SchemeCategory } from '../../../domain/welfare/scheme.entity';
import { DetailedEvaluationResult } from './eligibility-evaluator.service';

describe('EligibilityAiValidatorService - Second-Layer Verification Guardrails', () => {
  let validator: EligibilityAiValidatorService;
  let mockGeminiAdapter: any;
  let mockAiCache: any;

  const validCitizen = new CitizenEntity({
    id: 'cit-test-1',
    userId: 'usr-test-1',
    firstName: 'Priya',
    lastName: 'Sharma',
    dateOfBirth: new Date(new Date().getFullYear() - 22, 0, 1),
    gender: Gender.FEMALE,
    maritalStatus: MaritalStatus.SINGLE,
    socialCategory: SocialCategory.OBC,
    employmentStatus: EmploymentStatus.STUDENT,
    annualIncomeINR: 120000,
    disabilityType: DisabilityType.NONE,
    disabilityPercent: 0,
    isBplCardHolder: false,
    address: {
      id: 'addr-1',
      streetAddress: '123 MG Road',
      city: 'Lucknow',
      district: 'Lucknow',
      state: 'Uttar Pradesh',
      pincode: '226001',
      isRural: false,
    },
  });

  const studentScheme = new WelfareSchemeEntity({
    id: 'sch-student-1',
    code: 'UP-POST-MATRIC-OBC',
    title: 'Post Matric Scholarship for OBC',
    description: 'Scholarship scheme for OBC students in UP.',
    category: SchemeCategory.EDUCATION,
    department: 'Dept of Social Welfare',
    financialBenefit: 45000,
    isCentralScheme: false,
    state: 'Uttar Pradesh',
    requiredDocuments: ['INCOME_CERTIFICATE' as any, 'CASTE_CERTIFICATE' as any],
    eligibilityRules: [],
  });

  beforeEach(() => {
    mockGeminiAdapter = {
      generateJson: jest.fn(),
    };
    mockAiCache = {
      getOrExecute: jest.fn().mockImplementation(async (_options, generatorFn) => {
        const result = await generatorFn();
        return {
          content: result.content,
          provider: 'BenefitOS AI',
          isCached: false,
        };
      }),
    };
    validator = new EligibilityAiValidatorService(mockGeminiAdapter, mockAiCache);
  });

  it('Guardrail 1: Deterministic failure CANNOT be overridden by Gemini to CLAIM_READY', async () => {
    const failedEvaluation: DetailedEvaluationResult = {
      recommendation: {
        id: 'rec-1',
        citizenProfileId: 'cit-test-1',
        schemeId: 'sch-student-1',
        matchPercentage: 33,
        estimatedBenefit: 0,
        isEligible: false,
        criteriaMet: [],
        missingCriteria: ['Income exceeds maximum limit'],
        missingDocuments: [],
      },
      eligibilityStatus: 'NOT_ELIGIBLE',
      eligibilityTiming: 'NOT_APPLICABLE',
      yearsUntilEligible: null,
      passedRules: ['Student Status'],
      failedRules: ['Income exceeds limit (Max: ₹2,50,000, Actual: ₹15,00,000)'],
      missingProfileFields: [],
      statusReason: 'Annual family income (₹15,00,000) exceeds maximum limit of ₹2,50,000.',
    };

    // Even if Gemini adapter somehow returned CLAIM_READY in its output
    mockGeminiAdapter.generateJson.mockResolvedValue({
      decision: 'CLAIM_READY',
      allNonDocumentCriteriaSatisfied: true,
      onlyDocumentsRemaining: true,
      confidence: 0.99,
      failedCriteria: [],
      unverifiedCriteria: [],
      requiredDocuments: ['INCOME_CERTIFICATE'],
      reason: 'Hallucinated claim ready override',
    });

    const result = await validator.validateEligibility(validCitizen, studentScheme, failedEvaluation);

    expect(result.decision).toBe('NOT_ELIGIBLE');
    expect(result.allNonDocumentCriteriaSatisfied).toBe(false);
    expect(result.failedCriteria).toContain('Income exceeds limit (Max: ₹2,50,000, Actual: ₹15,00,000)');
    // Crucially: Gemini adapter should not even be called when deterministic rules fail
    expect(mockGeminiAdapter.generateJson).not.toHaveBeenCalled();
  });

  it('Guardrail 2: Missing profile fields must fail fast to INSUFFICIENT_DATA', async () => {
    const missingProfileEvaluation: DetailedEvaluationResult = {
      recommendation: {
        id: 'rec-2',
        citizenProfileId: 'cit-test-1',
        schemeId: 'sch-student-1',
        matchPercentage: 50,
        estimatedBenefit: 0,
        isEligible: false,
        criteriaMet: [],
        missingCriteria: ['Missing caste/social category'],
        missingDocuments: [],
      },
      eligibilityStatus: 'NOT_ELIGIBLE',
      eligibilityTiming: 'NOT_APPLICABLE',
      yearsUntilEligible: null,
      passedRules: [],
      failedRules: [],
      missingProfileFields: ['socialCategory', 'annualIncomeINR'],
      statusReason: 'Profile details incomplete.',
    };

    const result = await validator.validateEligibility(validCitizen, studentScheme, missingProfileEvaluation);

    expect(result.decision).toBe('INSUFFICIENT_DATA');
    expect(result.allNonDocumentCriteriaSatisfied).toBe(false);
    expect(result.unverifiedCriteria).toEqual(['socialCategory', 'annualIncomeINR']);
    expect(mockGeminiAdapter.generateJson).not.toHaveBeenCalled();
  });

  it('Happy Path: Deterministic pass + AI verified validation returns CLAIM_READY', async () => {
    const passedEvaluation: DetailedEvaluationResult = {
      recommendation: {
        id: 'rec-3',
        citizenProfileId: 'cit-test-1',
        schemeId: 'sch-student-1',
        matchPercentage: 100,
        estimatedBenefit: 45000,
        isEligible: true,
        criteriaMet: ['Student', 'OBC', 'Income < 2.5 LPA', 'UP Domicile'],
        missingCriteria: [],
        missingDocuments: ['INCOME_CERTIFICATE', 'CASTE_CERTIFICATE'],
      },
      eligibilityStatus: 'ELIGIBLE',
      eligibilityTiming: 'NOW',
      yearsUntilEligible: 0,
      passedRules: ['Student Status', 'OBC Category', 'Income < ₹2,50,000', 'Uttar Pradesh Domicile'],
      failedRules: [],
      missingProfileFields: [],
      statusReason: "You're eligible — upload the required documents to continue.",
    };

    mockGeminiAdapter.generateJson.mockResolvedValue({
      decision: 'CLAIM_READY',
      allNonDocumentCriteriaSatisfied: true,
      onlyDocumentsRemaining: true,
      confidence: 0.98,
      failedCriteria: [],
      unverifiedCriteria: [],
      requiredDocuments: ['Income Certificate', 'Caste Certificate (OBC)'],
      reason: 'Citizen satisfies all statutory requirements (UP Student, OBC, Income ₹1.2L). Only income and caste certificates required for submission.',
    });

    const result = await validator.validateEligibility(validCitizen, studentScheme, passedEvaluation);

    expect(result.decision).toBe('CLAIM_READY');
    expect(result.allNonDocumentCriteriaSatisfied).toBe(true);
    expect(result.onlyDocumentsRemaining).toBe(true);
    expect(result.confidence).toBeGreaterThanOrEqual(0.9);
    expect(result.requiredDocuments).toContain('Income Certificate');
    expect(mockGeminiAdapter.generateJson).toHaveBeenCalledTimes(1);
  });
});
