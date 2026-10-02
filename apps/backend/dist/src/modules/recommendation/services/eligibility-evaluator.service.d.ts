import { CitizenEntity } from '../../../domain/citizen/citizen.entity';
import { WelfareSchemeEntity } from '../../../domain/welfare/scheme.entity';
import { SchemeRecommendationEntity } from '../../../domain/welfare/recommendation.entity';
export type EligibilityTiming = 'NOW' | 'IN_1_YEAR' | 'IN_2_YEARS' | 'IN_3_YEARS' | 'NOT_APPLICABLE';
export type EligibilityStatus = 'ELIGIBLE' | 'FUTURE_ELIGIBLE' | 'NOT_ELIGIBLE' | 'NEEDS_VERIFICATION' | 'INCOMPLETE_PROFILE';
export interface DetailedEvaluationResult {
    recommendation: SchemeRecommendationEntity;
    eligibilityStatus: EligibilityStatus;
    eligibilityTiming: EligibilityTiming;
    yearsUntilEligible: number | null;
    statusReason: string;
    missingProfileFields: string[];
    failedRules: string[];
    passedRules: string[];
    pendingVerificationRules?: string[];
}
export declare class EligibilityEvaluatorService {
    evaluateEligibility(citizen: CitizenEntity, scheme: WelfareSchemeEntity): SchemeRecommendationEntity;
    evaluateDetailedEligibility(citizen: CitizenEntity, scheme: WelfareSchemeEntity): DetailedEvaluationResult;
    private evaluateSingleRule;
    private getCitizenAttributeValue;
}
