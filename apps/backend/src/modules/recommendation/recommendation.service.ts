import { Injectable, Inject, Optional, Logger, NotFoundException } from '@nestjs/common';
import { EligibilityEvaluatorService } from './services/eligibility-evaluator.service';
import { EligibilityAiValidatorService } from './services/eligibility-ai-validator.service';
import { ICitizenRepository } from '../../domain/citizen/citizen-repository.interface';
import { IWelfareSchemeRepository, ISchemeRecommendationRepository } from '../../domain/welfare/welfare-repository.interface';
import { SchemeRecommendationEntity, EligibilityStatus } from '../../domain/welfare/recommendation.entity';
import { NotificationService } from '../notification/notification.service';
import { NotificationType, NotificationSeverity } from '../../domain/notification/notification-repository.interface';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { DocumentType } from '../../domain/welfare/scheme.entity';

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
    private readonly prisma?: PrismaService,
  ) {}

  async calculateRecommendationsForCitizen(userId: string): Promise<SchemeRecommendationEntity[]> {
    const citizen = await this.citizenRepo.findByUserId(userId);
    if (!citizen) {
      throw new NotFoundException(`Citizen profile not found for user '${userId}'.`);
    }

    const existingRecs = await this.recommendationRepo.findByCitizenId(citizen.id);
    const prevStatusMap = new Map<string, EligibilityStatus>(
      existingRecs.map((r) => [r.schemeId, r.status]),
    );

    const schemes = await this.schemeRepo.findAllActive(undefined, citizen.address?.state);
    // Load document state once.  A pending upload is never treated as verified.
    const documents = this.prisma
      ? await this.prisma.client.document.findMany({
          where: { userId, verificationStatus: 'VERIFIED' },
          select: { documentType: true },
        })
      : [];
    const verifiedDocumentTypes = new Set(documents.map((document) => document.documentType as DocumentType));
    if (citizen.aadhaarHash) {
      verifiedDocumentTypes.add(DocumentType.AADHAAR);
    }
    if (citizen.panHash) {
      verifiedDocumentTypes.add(DocumentType.PAN_CARD);
    }
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
        const missingDocuments = (scheme.requiredDocuments || []).filter(
          (documentType) => !verifiedDocumentTypes.has(documentType),
        );
        // A citizen can be profile-eligible while still not being able to
        // submit.  Keep this distinct from CLAIM_READY.
        if (missingDocuments.length > 0) {
          status = 'DOCUMENTS_PENDING';
          isEligible = false;
        } else {
          status = 'CLAIM_READY';
          isEligible = true;
        }
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

      const prevStatus = prevStatusMap.get(scheme.id);

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
        missingDocuments: (scheme.requiredDocuments || []).filter(
          (documentType) => !verifiedDocumentTypes.has(documentType),
        ),
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

      if (status === 'DOCUMENTS_PENDING' && this.notificationService && rec.missingDocuments.length > 0) {
        try {
          await this.notificationService.createNotification({
            userId,
            type: NotificationType.DOCUMENT_REQUIRED,
            title: `Documents required: ${scheme.title}`,
            body: `Eligibility is confirmed based on your current profile. Upload: ${rec.missingDocuments.join(', ')}.`,
            severity: NotificationSeverity.WARNING,
            metadata: { schemeId: scheme.id, schemeCode: scheme.code, missingDocuments: rec.missingDocuments, destination: '/documents' },
            dedupKey: `${userId}:${scheme.id}:DOCUMENT_REQUIRED:${scheme.updatedAt.toISOString()}`,
          });
        } catch (notifErr: any) {
          this.logger.warn(`Failed to dispatch missing-document notification: ${notifErr?.message}`);
        }
      }

      // Proactive Notification Dispatch for CLAIM_READY schemes
      if (status === 'CLAIM_READY' && this.notificationService) {
        try {
          if (prevStatus && prevStatus !== 'CLAIM_READY') {
            // Meaningful transition from NOT_ELIGIBLE / INSUFFICIENT_DATA -> CLAIM_READY
            await this.notificationService.createNotification({
              userId,
              type: NotificationType.BECAME_ELIGIBLE,
              title: `You're now eligible for ${scheme.title}`,
              body: `Based on your updated profile details, you now qualify for ${scheme.title} (₹${scheme.financialBenefit.toLocaleString('en-IN')}/year).`,
              severity: NotificationSeverity.SUCCESS,
              metadata: {
                schemeId: scheme.id,
                schemeCode: scheme.code,
                status: 'CLAIM_READY',
                previousStatus: prevStatus,
                destination: `/schemes/${scheme.id}`,
              },
              dedupKey: `${userId}:${scheme.id}:BECAME_ELIGIBLE:${Date.now().toString().substring(0, 7)}`,
              deduplicateMinutes: 1440,
            });
          } else {
            // Initial eligibility notification
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
                destination: `/schemes/${scheme.id}`,
              },
              dedupKey: `${userId}:${scheme.id}:SCHEME_ELIGIBILITY:v1`,
              deduplicateMinutes: 1440,
            });
          }
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

    // saveMany uses per-scheme upserts.  Do not delete first: a concurrent,
    // older evaluation must not create a window with no recommendations.
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
          : r.status === 'DOCUMENTS_PENDING'
          ? 'DOCUMENTS_PENDING'
          : r.status === 'INSUFFICIENT_DATA'
          ? 'INSUFFICIENT_DATA'
          : r.status === 'REVIEW_REQUIRED'
          ? 'REVIEW_REQUIRED'
          : detailed?.eligibilityStatus === 'FUTURE_ELIGIBLE'
          ? 'FUTURE_ELIGIBLE'
          : r.isEligible
          ? 'ELIGIBLE'
          : 'NOT_ELIGIBLE';

        return {
          id: r.id,
          schemeId: r.schemeId,
          scheme: scheme
            ? {
                id: scheme.id,
                code: scheme.code,
                title: scheme.title,
                description: scheme.description,
                category: scheme.category,
                department: scheme.department,
                financialBenefit: scheme.financialBenefit,
                isCentralScheme: scheme.isCentralScheme,
                state: scheme.state,
                requiredDocuments: scheme.requiredDocuments,
              }
            : undefined,
          status: r.status,
          eligibilityStatus,
          isEligible: isClaimReady,
          matchPercentage: isClaimReady ? 100 : r.matchPercentage,
          estimatedBenefit: isClaimReady && scheme ? scheme.financialBenefit : r.estimatedBenefit,
          criteriaMet: r.criteriaMet,
          missingCriteria: r.missingCriteria,
          missingDocuments: r.missingDocuments,
          aiValidation: r.aiValidation,
          timing: detailed?.eligibilityTiming,
          eligibilityTiming: detailed?.eligibilityTiming || 'NOT_APPLICABLE',
          yearsUntilEligible: detailed?.yearsUntilEligible ?? null,
          statusReason: detailed?.statusReason,
          calculatedAt: r.calculatedAt,
        };
      }),
    );

    return enriched;
  }
}
