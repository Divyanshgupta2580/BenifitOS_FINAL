import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { EligibilityEvaluatorService } from './services/eligibility-evaluator.service';
import { ICitizenRepository } from '../../domain/citizen/citizen-repository.interface';
import { IWelfareSchemeRepository, ISchemeRecommendationRepository } from '../../domain/welfare/welfare-repository.interface';
import { SchemeRecommendationEntity } from '../../domain/welfare/recommendation.entity';

@Injectable()
export class RecommendationEngineService {
  constructor(
    private readonly evaluator: EligibilityEvaluatorService,
    @Inject('ICitizenRepository') private readonly citizenRepo: ICitizenRepository,
    @Inject('IWelfareSchemeRepository') private readonly schemeRepo: IWelfareSchemeRepository,
    @Inject('ISchemeRecommendationRepository') private readonly recommendationRepo: ISchemeRecommendationRepository,
  ) {}

  async calculateRecommendationsForCitizen(userId: string): Promise<SchemeRecommendationEntity[]> {
    const citizen = await this.citizenRepo.findByUserId(userId);
    if (!citizen) {
      throw new NotFoundException(`Citizen profile not found for user '${userId}'.`);
    }

    const schemes = await this.schemeRepo.findAllActive(undefined, citizen.address?.state);
    const recommendations: SchemeRecommendationEntity[] = [];

    for (const scheme of schemes) {
      const rec = this.evaluator.evaluateEligibility(citizen, scheme);
      recommendations.push(rec);
    }

    // Sort by match percentage descending
    recommendations.sort((a, b) => b.matchPercentage - a.matchPercentage);

    await this.recommendationRepo.saveMany(recommendations);
    return recommendations;
  }

  async getRecommendations(userId: string): Promise<SchemeRecommendationEntity[]> {
    const citizen = await this.citizenRepo.findByUserId(userId);
    if (!citizen) {
      throw new NotFoundException(`Citizen profile not found for user '${userId}'.`);
    }
    const existing = await this.recommendationRepo.findByCitizenId(citizen.id);
    if (existing.length === 0) {
      return await this.calculateRecommendationsForCitizen(userId);
    }
    return existing;
  }
}
