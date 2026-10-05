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
const prisma_service_1 = require("../../infrastructure/database/prisma.service");
const scheme_entity_1 = require("../../domain/welfare/scheme.entity");
let RecommendationEngineService = RecommendationEngineService_1 = class RecommendationEngineService {
    evaluator;
    aiValidator;
    citizenRepo;
    schemeRepo;
    recommendationRepo;
    notificationService;
    prisma;
    logger = new common_1.Logger(RecommendationEngineService_1.name);
    constructor(evaluator, aiValidator, citizenRepo, schemeRepo, recommendationRepo, notificationService, prisma) {
        this.evaluator = evaluator;
        this.aiValidator = aiValidator;
        this.citizenRepo = citizenRepo;
        this.schemeRepo = schemeRepo;
        this.recommendationRepo = recommendationRepo;
        this.notificationService = notificationService;
        this.prisma = prisma;
    }
    async calculateRecommendationsForCitizen(userId) {
        const citizen = await this.citizenRepo.findByUserId(userId);
        if (!citizen) {
            throw new common_1.NotFoundException(`Citizen profile not found for user '${userId}'.`);
        }
        const existingRecs = await this.recommendationRepo.findByCitizenId(citizen.id);
        const prevStatusMap = new Map(existingRecs.map((r) => [r.schemeId, r.status]));
        const schemes = await this.schemeRepo.findAllActive(undefined, citizen.address?.state);
        const documents = this.prisma
            ? await this.prisma.client.document.findMany({
                where: { userId, verificationStatus: 'VERIFIED' },
                select: { documentType: true },
            })
            : [];
        const verifiedDocumentTypes = new Set(documents.map((document) => document.documentType));
        if (citizen.aadhaarHash) {
            verifiedDocumentTypes.add(scheme_entity_1.DocumentType.AADHAAR);
        }
        if (citizen.panHash) {
            verifiedDocumentTypes.add(scheme_entity_1.DocumentType.PAN_CARD);
        }
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
                const missingDocuments = (scheme.requiredDocuments || []).filter((documentType) => !verifiedDocumentTypes.has(documentType));
                if (missingDocuments.length > 0) {
                    status = 'DOCUMENTS_PENDING';
                    isEligible = false;
                }
                else {
                    status = 'CLAIM_READY';
                    isEligible = true;
                }
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
            const prevStatus = prevStatusMap.get(scheme.id);
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
                missingDocuments: (scheme.requiredDocuments || []).filter((documentType) => !verifiedDocumentTypes.has(documentType)),
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
                        type: notification_repository_interface_1.NotificationType.DOCUMENT_REQUIRED,
                        title: `Documents required: ${scheme.title}`,
                        body: `Eligibility is confirmed based on your current profile. Upload: ${rec.missingDocuments.join(', ')}.`,
                        severity: notification_repository_interface_1.NotificationSeverity.WARNING,
                        metadata: { schemeId: scheme.id, schemeCode: scheme.code, missingDocuments: rec.missingDocuments, destination: '/documents' },
                        dedupKey: `${userId}:${scheme.id}:DOCUMENT_REQUIRED:${scheme.updatedAt.toISOString()}`,
                    });
                }
                catch (notifErr) {
                    this.logger.warn(`Failed to dispatch missing-document notification: ${notifErr?.message}`);
                }
            }
            if (status === 'CLAIM_READY' && this.notificationService) {
                try {
                    if (prevStatus && prevStatus !== 'CLAIM_READY') {
                        await this.notificationService.createNotification({
                            userId,
                            type: notification_repository_interface_1.NotificationType.BECAME_ELIGIBLE,
                            title: `You're now eligible for ${scheme.title}`,
                            body: `Based on your updated profile details, you now qualify for ${scheme.title} (₹${scheme.financialBenefit.toLocaleString('en-IN')}/year).`,
                            severity: notification_repository_interface_1.NotificationSeverity.SUCCESS,
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
                    }
                    else {
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
                                destination: `/schemes/${scheme.id}`,
                            },
                            dedupKey: `${userId}:${scheme.id}:SCHEME_ELIGIBILITY:v1`,
                            deduplicateMinutes: 1440,
                        });
                    }
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
        eligibility_ai_validator_service_1.EligibilityAiValidatorService, Object, Object, Object, notification_service_1.NotificationService,
        prisma_service_1.PrismaService])
], RecommendationEngineService);
//# sourceMappingURL=recommendation.service.js.map