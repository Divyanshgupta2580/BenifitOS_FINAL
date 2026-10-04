"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var RecommendationEngineService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationEngineService = void 0;
const common_1 = require("@nestjs/common");
const eligibility_evaluator_service_1 = require("./services/eligibility-evaluator.service");
const eligibility_ai_validator_service_1 = require("./services/eligibility-ai-validator.service");
const recommendation_entity_1 = require("../../domain/welfare/recommendation.entity");
const notification_service_1 = require("../notification/notification.service");
const notification_repository_interface_1 = require("../../domain/notification/notification-repository.interface");
const crypto_1 = require("crypto");
let RecommendationEngineService = RecommendationEngineService_1 = class RecommendationEngineService {
    evaluator;
    aiValidator;
    citizenRepo;
    schemeRepo;
    recommendationRepo;
    notificationService;
    logger = new common_1.Logger(RecommendationEngineService_1.name);
    constructor(evaluator, aiValidator, citizenRepo, schemeRepo, recommendationRepo, notificationService) {
        this.evaluator = evaluator;
        this.aiValidator = aiValidator;
        this.citizenRepo = citizenRepo;
        this.schemeRepo = schemeRepo;
        this.recommendationRepo = recommendationRepo;
        this.notificationService = notificationService;
    }
    async calculateRecommendationsForCitizen(userId) {
        const citizen = await this.citizenRepo.findByUserId(userId);
        if (!citizen) {
            throw new common_1.NotFoundException(`Citizen profile not found for user '${userId}'.`);
        }
        const schemes = await this.schemeRepo.findAllActive(undefined, citizen.address?.state);
        const recommendations = [];
        for (const scheme of schemes) {
            const detailed = this.evaluator.evaluateDetailedEligibility(citizen, scheme);
            const aiVal = await this.aiValidator.validateEligibility(citizen, scheme, detailed);
            let status = 'NOT_ELIGIBLE';
            let isEligible = false;
            if (detailed.missingProfileFields.length > 0) {
                status = 'INSUFFICIENT_DATA';
                isEligible = false;
            }
            else if (detailed.eligibilityStatus === 'FUTURE_ELIGIBLE') {
                status = 'NOT_ELIGIBLE';
                isEligible = false;
            }
            else if (detailed.eligibilityStatus === 'ELIGIBLE' &&
                aiVal.decision === 'CLAIM_READY' &&
                aiVal.allNonDocumentCriteriaSatisfied === true &&
                aiVal.onlyDocumentsRemaining === true) {
                status = 'CLAIM_READY';
                isEligible = true;
            }
            else if (detailed.eligibilityStatus === 'ELIGIBLE' &&
                (aiVal.decision === 'REVIEW_REQUIRED' || !aiVal.allNonDocumentCriteriaSatisfied)) {
                status = 'REVIEW_REQUIRED';
                isEligible = false;
            }
            else {
                status = 'NOT_ELIGIBLE';
                isEligible = false;
            }
            const rec = new recommendation_entity_1.SchemeRecommendationEntity({
                id: (0, crypto_1.randomUUID)(),
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
            if (status === 'CLAIM_READY' && this.notificationService) {
                try {
                    await this.notificationService.createNotification({
                        userId,
                        type: notification_repository_interface_1.NotificationType.SCHEME_ELIGIBILITY,
                        title: `You're eligible for ${scheme.title}`,
                        body: `You qualify for ${scheme.title} based on your current verified profile. Upload required documents to complete your application.`,
                        severity: notification_repository_interface_1.NotificationSeverity.SUCCESS,
                        metadata: {
                            schemeId: scheme.id,
                            schemeCode: scheme.code,
                            status: 'CLAIM_READY',
                        },
                        deduplicateMinutes: 1440,
                    });
                }
                catch (notifErr) {
                    this.logger.warn(`Failed to dispatch claim-ready notification: ${notifErr?.message}`);
                }
            }
        }
        recommendations.sort((a, b) => {
            if (a.status === 'CLAIM_READY' && b.status !== 'CLAIM_READY')
                return -1;
            if (b.status === 'CLAIM_READY' && a.status !== 'CLAIM_READY')
                return 1;
            return b.matchPercentage - a.matchPercentage;
        });
        await this.recommendationRepo.deleteForCitizen(citizen.id);
        await this.recommendationRepo.saveMany(recommendations);
        return recommendations;
    }
    async getRecommendations(userId) {
        const citizen = await this.citizenRepo.findByUserId(userId);
        if (!citizen) {
            throw new common_1.NotFoundException(`Citizen profile not found for user '${userId}'.`);
        }
        const existing = await this.recommendationRepo.findByCitizenId(citizen.id);
        if (existing.length === 0) {
            return await this.calculateRecommendationsForCitizen(userId);
        }
        return existing;
    }
    async getEnrichedRecommendations(userId) {
        const citizen = await this.citizenRepo.findByUserId(userId);
        if (!citizen) {
            throw new common_1.NotFoundException(`Citizen profile not found for user '${userId}'.`);
        }
        const recs = await this.getRecommendations(userId);
        const enriched = await Promise.all(recs.map(async (r) => {
            const scheme = await this.schemeRepo.findById(r.schemeId);
            const detailed = scheme ? this.evaluator.evaluateDetailedEligibility(citizen, scheme) : null;
            const isClaimReady = r.status === 'CLAIM_READY' &&
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
        }));
        return enriched;
    }
};
exports.RecommendationEngineService = RecommendationEngineService;
exports.RecommendationEngineService = RecommendationEngineService = RecommendationEngineService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)('ICitizenRepository')),
    __param(3, (0, common_1.Inject)('IWelfareSchemeRepository')),
    __param(4, (0, common_1.Inject)('ISchemeRecommendationRepository')),
    __param(5, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [eligibility_evaluator_service_1.EligibilityEvaluatorService,
        eligibility_ai_validator_service_1.EligibilityAiValidatorService, Object, Object, Object, notification_service_1.NotificationService])
], RecommendationEngineService);
//# sourceMappingURL=recommendation.service.js.map