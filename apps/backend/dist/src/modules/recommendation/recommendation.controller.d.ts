import { RecommendationEngineService } from './recommendation.service';
export declare class RecommendationController {
    private readonly recommendationService;
    constructor(recommendationService: RecommendationEngineService);
    getRecommendations(userId: string): Promise<{
        count: number;
        recommendations: {
            id: string;
            schemeId: string;
            matchPercentage: number;
            estimatedBenefit: number;
            isEligible: boolean;
            criteriaMet: string[];
            missingCriteria: string[];
            missingDocuments: import("../../domain/welfare/scheme.entity").DocumentType[];
        }[];
    }>;
    recalculateRecommendations(userId: string): Promise<{
        message: string;
        count: number;
        recommendations: import("../../domain/welfare/recommendation.entity").SchemeRecommendationEntity[];
    }>;
}
