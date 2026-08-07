import { Controller, Get, Post } from '@nestjs/common';
import { RecommendationEngineService } from './recommendation.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('recommendations')
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationEngineService) {}

  @Get()
  async getRecommendations(@CurrentUser('sub') userId: string) {
    const recommendations = await this.recommendationService.getRecommendations(userId);
    return {
      count: recommendations.length,
      recommendations: recommendations.map((r) => ({
        id: r.id,
        schemeId: r.schemeId,
        matchPercentage: r.matchPercentage,
        estimatedBenefit: r.estimatedBenefit,
        isEligible: r.isEligible,
        criteriaMet: r.criteriaMet,
        missingCriteria: r.missingCriteria,
        missingDocuments: r.missingDocuments,
      })),
    };
  }

  @Post('recalculate')
  async recalculateRecommendations(@CurrentUser('sub') userId: string) {
    const recommendations = await this.recommendationService.calculateRecommendationsForCitizen(userId);
    return {
      message: 'Recommendations recalculated successfully.',
      count: recommendations.length,
      recommendations,
    };
  }
}
