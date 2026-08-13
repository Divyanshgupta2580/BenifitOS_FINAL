"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CitizenModule = void 0;
const common_1 = require("@nestjs/common");
const citizen_controller_1 = require("./citizen.controller");
const citizen_service_1 = require("./citizen.service");
const citizen_repository_1 = require("../../infrastructure/database/repositories/citizen.repository");
const prisma_service_1 = require("../../infrastructure/database/prisma.service");
const welfare_repository_1 = require("../../infrastructure/database/repositories/welfare.repository");
let CitizenModule = class CitizenModule {
};
exports.CitizenModule = CitizenModule;
exports.CitizenModule = CitizenModule = __decorate([
    (0, common_1.Module)({
        controllers: [citizen_controller_1.CitizenController],
        providers: [
            citizen_service_1.CitizenService,
            prisma_service_1.PrismaService,
            {
                provide: 'ICitizenRepository',
                useClass: citizen_repository_1.CitizenRepositoryImpl,
            },
            {
                provide: 'ISchemeRecommendationRepository',
                useClass: welfare_repository_1.SchemeRecommendationRepositoryImpl,
            },
        ],
        exports: [citizen_service_1.CitizenService, 'ICitizenRepository'],
    })
], CitizenModule);
//# sourceMappingURL=citizen.module.js.map