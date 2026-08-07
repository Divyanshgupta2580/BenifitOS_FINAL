"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationModule = void 0;
const common_1 = require("@nestjs/common");
const recommendation_controller_1 = require("./recommendation.controller");
const recommendation_service_1 = require("./recommendation.service");
const eligibility_evaluator_service_1 = require("./services/eligibility-evaluator.service");
const citizen_repository_1 = require("../../infrastructure/database/repositories/citizen.repository");
const welfare_repository_1 = require("../../infrastructure/database/repositories/welfare.repository");
const prisma_service_1 = require("../../infrastructure/database/prisma.service");
let RecommendationModule = class RecommendationModule {
};
exports.RecommendationModule = RecommendationModule;
exports.RecommendationModule = RecommendationModule = __decorate([
    (0, common_1.Module)({
        controllers: [recommendation_controller_1.RecommendationController],
        providers: [
            recommendation_service_1.RecommendationEngineService,
            eligibility_evaluator_service_1.EligibilityEvaluatorService,
            prisma_service_1.PrismaService,
            { provide: 'ICitizenRepository', useClass: citizen_repository_1.CitizenRepositoryImpl },
            { provide: 'IWelfareSchemeRepository', useClass: welfare_repository_1.WelfareSchemeRepositoryImpl },
            { provide: 'ISchemeRecommendationRepository', useClass: welfare_repository_1.SchemeRecommendationRepositoryImpl },
        ],
        exports: [recommendation_service_1.RecommendationEngineService],
    })
], RecommendationModule);
//# sourceMappingURL=recommendation.module.js.map