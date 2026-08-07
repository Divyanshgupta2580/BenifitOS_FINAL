import { CitizenEntity } from '../../../domain/citizen/citizen.entity';
import { WelfareSchemeEntity } from '../../../domain/welfare/scheme.entity';
import { SchemeRecommendationEntity } from '../../../domain/welfare/recommendation.entity';
export declare class EligibilityEvaluatorService {
    evaluateEligibility(citizen: CitizenEntity, scheme: WelfareSchemeEntity): SchemeRecommendationEntity;
    private evaluateSingleRule;
    private getCitizenAttributeValue;
}
