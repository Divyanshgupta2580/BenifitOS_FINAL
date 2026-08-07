import { EligibilityEvaluatorService } from './services/eligibility-evaluator.service';
import { ICitizenRepository } from '../../domain/citizen/citizen-repository.interface';
import { IWelfareSchemeRepository, ISchemeRecommendationRepository } from '../../domain/welfare/welfare-repository.interface';
import { SchemeRecommendationEntity } from '../../domain/welfare/recommendation.entity';
export declare class RecommendationEngineService {
    private readonly evaluator;
    private readonly citizenRepo;
    private readonly schemeRepo;
    private readonly recommendationRepo;
    constructor(evaluator: EligibilityEvaluatorService, citizenRepo: ICitizenRepository, schemeRepo: IWelfareSchemeRepository, recommendationRepo: ISchemeRecommendationRepository);
    calculateRecommendationsForCitizen(userId: string): Promise<SchemeRecommendationEntity[]>;
    getRecommendations(userId: string): Promise<SchemeRecommendationEntity[]>;
}
