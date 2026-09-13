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

    await this.recommendationRepo.deleteForCitizen(citizen.id);
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

  async getEnrichedRecommendations(userId: string): Promise<any[]> {
    const citizen = await this.citizenRepo.findByUserId(userId);
    if (!citizen) {
      throw new NotFoundException(`Citizen profile not found for user '${userId}'.`);
    }

    const recs = await this.getRecommendations(userId);
    const enriched = await Promise.all(
      recs.map(async (r) => {
        const scheme = await this.schemeRepo.findById(r.schemeId);
        let detailedStatus: {
          eligibilityStatus: import('./services/eligibility-evaluator.service').EligibilityStatus;
          statusReason: string;
          missingProfileFields: string[];
          failedRules: string[];
          passedRules: string[];
        } = {
          eligibilityStatus: r.isEligible ? 'ELIGIBLE' : 'NOT_ELIGIBLE',
          statusReason: r.isEligible ? 'All criteria met' : 'Requirements not met',
          missingProfileFields: [],
          failedRules: [],
          passedRules: r.criteriaMet,
        };

        if (scheme) {
          const detailed = this.evaluator.evaluateDetailedEligibility(citizen, scheme);
          detailedStatus = {
            eligibilityStatus: detailed.eligibilityStatus,
            statusReason: detailed.statusReason,
            missingProfileFields: detailed.missingProfileFields,
            failedRules: detailed.failedRules,
            passedRules: detailed.passedRules,
          };
        }

        return {
          id: r.id,
          schemeId: r.schemeId,
          title: scheme?.title || 'Welfare Scheme',
          category: scheme?.category || 'WELFARE',
          department: scheme?.department || 'Government Department',
          description: scheme?.description || '',
          financialBenefit: scheme?.financialBenefit || 0,
          matchPercentage: r.matchPercentage,
          estimatedBenefit: r.estimatedBenefit,
          isEligible: r.isEligible,
          eligibilityStatus: detailedStatus.eligibilityStatus,
          statusReason: detailedStatus.statusReason,
          missingProfileFields: detailedStatus.missingProfileFields,
          failedRules: detailedStatus.failedRules,
          passedRules: detailedStatus.passedRules,
          criteriaMet: r.criteriaMet,
          missingCriteria: r.missingCriteria,
          missingDocuments: r.missingDocuments,
          scheme: scheme
            ? {
                id: scheme.id,
                code: scheme.code,
                title: scheme.title,
                description: scheme.description,
                category: scheme.category,
                department: scheme.department,
                financialBenefit: scheme.financialBenefit,
              }
            : undefined,
        };
      }),
    );
    return enriched;
  }
}
