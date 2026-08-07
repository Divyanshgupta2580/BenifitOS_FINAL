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
exports.RecommendationController = void 0;
const common_1 = require("@nestjs/common");
const recommendation_service_1 = require("./recommendation.service");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let RecommendationController = class RecommendationController {
    recommendationService;
    constructor(recommendationService) {
        this.recommendationService = recommendationService;
    }
    async getRecommendations(userId) {
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
    async recalculateRecommendations(userId) {
        const recommendations = await this.recommendationService.calculateRecommendationsForCitizen(userId);
        return {
            message: 'Recommendations recalculated successfully.',
            count: recommendations.length,
            recommendations,
        };
    }
};
exports.RecommendationController = RecommendationController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecommendationController.prototype, "getRecommendations", null);
__decorate([
    (0, common_1.Post)('recalculate'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecommendationController.prototype, "recalculateRecommendations", null);
exports.RecommendationController = RecommendationController = __decorate([
    (0, common_1.Controller)('recommendations'),
    __metadata("design:paramtypes", [recommendation_service_1.RecommendationEngineService])
], RecommendationController);
//# sourceMappingURL=recommendation.controller.js.map