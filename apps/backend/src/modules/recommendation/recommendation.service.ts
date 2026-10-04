import { Injectable, Inject, Optional, Logger, NotFoundException } from '@nestjs/common';
import { EligibilityEvaluatorService } from './services/eligibility-evaluator.service';
import { EligibilityAiValidatorService } from './services/eligibility-ai-validator.service';
import { ICitizenRepository } from '../../domain/citizen/citizen-repository.interface';
import { IWelfareSchemeRepository, ISchemeRecommendationRepository } from '../../domain/welfare/welfare-repository.interface';
import { SchemeRecommendationEntity, EligibilityStatus } from '../../domain/welfare/recommendation.entity';
import { NotificationService } from '../notification/notification.service';
import { NotificationType, NotificationSeverity } from '../../domain/notification/notification-repository.interface';
import { randomUUID } from 'crypto';

@Injectable()
export class RecommendationEngineService {
  private readonly logger = new Logger(RecommendationEngineService.name);

  constructor(
    private readonly evaluator: EligibilityEvaluatorService,
    private readonly aiValidator: EligibilityAiValidatorService,
    @Inject('ICitizenRepository') private readonly citizenRepo: ICitizenRepository,
    @Inject('IWelfareSchemeRepository') private readonly schemeRepo: IWelfareSchemeRepository,
    @Inject('ISchemeRecommendationRepository') private readonly recommendationRepo: ISchemeRecommendationRepository,
    @Optional() private readonly notificationService?: NotificationService,
  ) {}

  async calculateRecommendationsForCitizen(userId: string): Promise<SchemeRecommendationEntity[]> {
    const citizen = await this.citizenRepo.findByUserId(userId);
    if (!citizen) {
      throw new NotFoundException(`Citizen profile not found for user '${userId}'.`);
    }

    const schemes = await this.schemeRepo.findAllActive(undefined, citizen.address?.state);
    const recommendations: SchemeRecommendationEntity[] = [];

    for (const scheme of schemes) {
      // 1. Deterministic evaluation
      const detailed = this.evaluator.evaluateDetailedEligibility(citizen, scheme);

      // 2. Second-layer Gemini validation
      const aiVal = await this.aiValidator.validateEligibility(citizen, scheme, detailed);

      // 3. Strict Status Resolution
      // A scheme is CLAIM_READY if and only if:
      // - Deterministic engine passed 100% of non-document mandatory rules
      // - AI validator confirms CLAIM_READY with all non-document criteria satisfied
      // - No missing profile fields
      let status: EligibilityStatus = 'NOT_ELIGIBLE';
      let isEligible = false;

      if (detailed.missingProfileFields.length > 0) {
        status = 'INSUFFICIENT_DATA';
        isEligible = false;
      } else if (detailed.eligibilityStatus === 'FUTURE_ELIGIBLE') {
        status = 'NOT_ELIGIBLE'; // Marked with future timing
        isEligible = false;
      } else if (
        detailed.eligibilityStatus === 'ELIGIBLE' &&
        aiVal.decision === 'CLAIM_READY' &&
        aiVal.allNonDocumentCriteriaSatisfied === true &&
        aiVal.onlyDocumentsRemaining === true
      ) {
        status = 'CLAIM_READY';
        isEligible = true;
      } else if (
        detailed.eligibilityStatus === 'ELIGIBLE' &&
        (aiVal.decision === 'REVIEW_REQUIRED' || !aiVal.allNonDocumentCriteriaSatisfied)
      ) {
        status = 'REVIEW_REQUIRED';
        isEligible = false;
      } else {
        status = 'NOT_ELIGIBLE';
        isEligible = false;
      }

      const rec = new SchemeRecommendationEntity({
        id: randomUUID(),
        citizenProfileId: citizen.id,
        schemeId: scheme.id,
        matchPercentage: isEligible ? 100 : detailed.recommendation.matchPercentage,
        estimatedBenefit: isEligible ? scheme.financialBenefit : 0,
        isEligible,
        status,
        criteriaMet: detailed.passedRules,
        missingCriteria: detailed.failedRules.concat(detailed.missingProfileFields),
        missingDocuments: scheme.requiredDocuments || [],
        aiValidation: {
          decision: aiVal.decision,
          confidence: aiVal.confidence,
          reason: aiVal.reason,
          allNonDocumentCriteriaSatisfied: aiVal.allNonDocumentCriteriaSatisfied,
          onlyDocumentsRemaining: aiVal.onlyDocumentsRemaining,
          requiredDocuments: aiVal.requiredDocuments,
        },
        calculatedAt: new Date(),
      });

      recommendations.push(rec);

      // Trigger real notification for CLAIM_READY schemes (with 24hr deduplication)
      if (status === 'CLAIM_READY' && this.notificationService) {
        try {
          await this.notificationService.createNotification({
            userId,
            type: NotificationType.SCHEME_ELIGIBILITY,
            title: `You're eligible for ${scheme.title}`,
            body: `You qualify for ${scheme.title} based on your current verified profile. Upload required documents to complete your application.`,
            severity: NotificationSeverity.SUCCESS,
            metadata: {
              schemeId: scheme.id,
              schemeCode: scheme.code,
              status: 'CLAIM_READY',
            },
            deduplicateMinutes: 1440, // 24 hours
          });
        } catch (notifErr: any) {
          this.logger.warn(`Failed to dispatch claim-ready notification: ${notifErr?.message}`);
        }
      }
    }

    // Sort by: CLAIM_READY first, then match percentage descending
    recommendations.sort((a, b) => {
      if (a.status === 'CLAIM_READY' && b.status !== 'CLAIM_READY') return -1;
      if (b.status === 'CLAIM_READY' && a.status !== 'CLAIM_READY') return 1;
      return b.matchPercentage - a.matchPercentage;
    });

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
        const detailed = scheme ? this.evaluator.evaluateDetailedEligibility(citizen, scheme) : null;

        const isClaimReady =
          r.status === 'CLAIM_READY' &&
          r.isEligible &&
          (!detailed || detailed.eligibilityStatus === 'ELIGIBLE');

        const eligibilityStatus = isClaimReady
          ? 'CLAIM_READY'
          : r.status === 'REVIEW_REQUIRED'
          ? 'REVIEW_REQUIRED'
          : detailed?.missingProfileFields && detailed.missingProfileFields.length > 0
          ? 'INSUFFICIENT_DATA'
          : detailed?.eligibilityStatus === 'FUTURE_ELIGIBLE'
          ? 'FUTURE_ELIGIBLE'
          : 'NOT_ELIGIBLE';

        const statusReason = isClaimReady
          ? "You're eligible — upload the required documents to continue."
          : detailed?.statusReason || 'Requirements not met based on stored profile.';

        return {
          id: r.id,
          schemeId: r.schemeId,
          title: scheme?.title || 'Welfare Scheme',
          code: scheme?.code || 'SCHEME',
          category: scheme?.category || 'WELFARE',
          department: scheme?.department || 'Government Department',
          description: scheme?.description || '',
          financialBenefit: scheme?.financialBenefit || 0,
          matchPercentage: r.matchPercentage,
          estimatedBenefit: r.estimatedBenefit,
          isEligible: isClaimReady,
          status: eligibilityStatus,
          eligibilityStatus,
          eligibilityTiming: detailed?.eligibilityTiming || (isClaimReady ? 'NOW' : 'NOT_APPLICABLE'),
          yearsUntilEligible: detailed?.yearsUntilEligible || (isClaimReady ? 0 : null),
          statusReason,
          missingProfileFields: detailed?.missingProfileFields || [],
          failedRules: detailed?.failedRules || [],
          passedRules: detailed?.passedRules || r.criteriaMet,
          criteriaMet: r.criteriaMet,
          missingCriteria: r.missingCriteria,
          missingDocuments: r.missingDocuments,
          aiValidation: r.aiValidation || {
            decision: isClaimReady ? 'CLAIM_READY' : 'NOT_ELIGIBLE',
            reason: statusReason,
            allNonDocumentCriteriaSatisfied: isClaimReady,
            onlyDocumentsRemaining: isClaimReady,
          },
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

