import { CitizenEntity } from '../../../domain/citizen/citizen.entity';
import { WelfareSchemeEntity } from '../../../domain/welfare/scheme.entity';
import { SchemeRecommendationEntity } from '../../../domain/welfare/recommendation.entity';
export type EligibilityStatus = 'ELIGIBLE' | 'NOT_ELIGIBLE' | 'NEEDS_VERIFICATION' | 'INCOMPLETE_PROFILE';
export interface DetailedEvaluationResult {
    recommendation: SchemeRecommendationEntity;
    eligibilityStatus: EligibilityStatus;
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
