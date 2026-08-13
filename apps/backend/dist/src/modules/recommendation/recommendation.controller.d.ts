import { RecommendationEngineService } from './recommendation.service';
export declare class RecommendationController {
    private readonly recommendationService;
    constructor(recommendationService: RecommendationEngineService);
    getRecommendations(userId: string): Promise<{
        count: number;
        recommendations: any[];
    }>;
    recalculateRecommendations(userId: string): Promise<{
        message: string;
        count: number;
        recommendations: import("../../domain/welfare/recommendation.entity").SchemeRecommendationEntity[];
    }>;
}
