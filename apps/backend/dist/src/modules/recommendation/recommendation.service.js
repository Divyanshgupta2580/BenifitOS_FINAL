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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationEngineService = void 0;
const common_1 = require("@nestjs/common");
const eligibility_evaluator_service_1 = require("./services/eligibility-evaluator.service");
let RecommendationEngineService = class RecommendationEngineService {
    evaluator;
    citizenRepo;
    schemeRepo;
    recommendationRepo;
    constructor(evaluator, citizenRepo, schemeRepo, recommendationRepo) {
        this.evaluator = evaluator;
        this.citizenRepo = citizenRepo;
        this.schemeRepo = schemeRepo;
        this.recommendationRepo = recommendationRepo;
    }
    async calculateRecommendationsForCitizen(userId) {
        const citizen = await this.citizenRepo.findByUserId(userId);
        if (!citizen) {
            throw new common_1.NotFoundException(`Citizen profile not found for user '${userId}'.`);
        }
        const schemes = await this.schemeRepo.findAllActive(undefined, citizen.address?.state);
        const recommendations = [];
        for (const scheme of schemes) {
            const rec = this.evaluator.evaluateEligibility(citizen, scheme);
            recommendations.push(rec);
        }
        recommendations.sort((a, b) => b.matchPercentage - a.matchPercentage);
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
        const recs = await this.getRecommendations(userId);
        const enriched = await Promise.all(recs.map(async (r) => {
            const scheme = await this.schemeRepo.findById(r.schemeId);
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
        }));
        return enriched;
    }
};
exports.RecommendationEngineService = RecommendationEngineService;
exports.RecommendationEngineService = RecommendationEngineService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)('ICitizenRepository')),
    __param(2, (0, common_1.Inject)('IWelfareSchemeRepository')),
    __param(3, (0, common_1.Inject)('ISchemeRecommendationRepository')),
    __metadata("design:paramtypes", [eligibility_evaluator_service_1.EligibilityEvaluatorService, Object, Object, Object])
], RecommendationEngineService);
//# sourceMappingURL=recommendation.service.js.map