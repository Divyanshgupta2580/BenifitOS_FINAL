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
var WelfareSchemeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WelfareSchemeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infrastructure/database/prisma.service");
const daily_maintenance_cron_1 = require("../../cron/daily-maintenance.cron");
const proactive_notification_service_1 = require("../notification/proactive-notification.service");
let WelfareSchemeService = WelfareSchemeService_1 = class WelfareSchemeService {
    schemeRepo;
    prisma;
    proactiveNotifService;
    logger = new common_1.Logger(WelfareSchemeService_1.name);
    constructor(schemeRepo, prisma, proactiveNotifService) {
        this.schemeRepo = schemeRepo;
        this.prisma = prisma;
        this.proactiveNotifService = proactiveNotifService;
    }
    async onModuleInit() {
        try {
            this.logger.log('Synchronizing canonical government welfare schemes catalog into database...');
            for (const schemeDef of daily_maintenance_cron_1.CANONICAL_WELFARE_SCHEMES) {
                const existing = await this.prisma.client.welfareScheme.findUnique({
                    where: { code: schemeDef.code },
                });
                if (!existing) {
                    const created = await this.prisma.client.welfareScheme.create({
                        data: {
                            id: schemeDef.id,
                            code: schemeDef.code,
                            title: schemeDef.title,
                            description: schemeDef.description,
                            category: schemeDef.category,
                            department: schemeDef.department,
                            state: schemeDef.state || null,
                            isCentralScheme: schemeDef.isCentralScheme,
                            financialBenefit: schemeDef.financialBenefit,
                            isActive: schemeDef.isActive,
                            eligibilityRules: {
                                create: schemeDef.rules.map((r) => ({
                                    attributeKey: r.attributeKey,
                                    operator: r.operator,
                                    targetValue: r.targetValue,
                                    isRequired: r.isRequired,
                                    description: r.description,
                                })),
                            },
                            requiredDocuments: {
                                create: schemeDef.documents.map((d) => ({
                                    documentType: d.documentType,
                                    isMandatory: d.isMandatory,
                                    description: d.description,
                                })),
                            },
                        },
                    });
                    if (this.proactiveNotifService) {
                        const schemeEntity = await this.schemeRepo.findById(created.id);
                        if (schemeEntity) {
                            await this.proactiveNotifService.evaluateNewSchemeForCitizens(schemeEntity);
                        }
                    }
                }
                else {
                    await this.prisma.client.$transaction([
                        this.prisma.client.welfareScheme.update({
                            where: { id: existing.id },
                            data: {
                                title: schemeDef.title,
                                description: schemeDef.description,
                                category: schemeDef.category,
                                department: schemeDef.department,
                                state: schemeDef.state || null,
                                isCentralScheme: schemeDef.isCentralScheme,
                                financialBenefit: schemeDef.financialBenefit,
                                isActive: schemeDef.isActive,
                            },
                        }),
                        this.prisma.client.eligibilityCriteria.deleteMany({ where: { schemeId: existing.id } }),
                        this.prisma.client.eligibilityCriteria.createMany({
                            data: schemeDef.rules.map((r) => ({
                                schemeId: existing.id,
                                attributeKey: r.attributeKey,
                                operator: r.operator,
                                targetValue: r.targetValue,
                                isRequired: r.isRequired,
                                description: r.description,
                            })),
                        }),
                        this.prisma.client.requiredDocument.deleteMany({ where: { schemeId: existing.id } }),
                        this.prisma.client.requiredDocument.createMany({
                            data: schemeDef.documents.map((d) => ({
                                schemeId: existing.id,
                                documentType: d.documentType,
                                isMandatory: d.isMandatory,
                                description: d.description,
                            })),
                        }),
                    ]);
                }
            }
            this.logger.log('✅ Welfare schemes catalog and eligibility rules synchronized successfully.');
        }
        catch (err) {
            this.logger.warn(`Welfare scheme catalog sync notice: ${err?.message}`);
        }
    }
    async getAllSchemes(category, state) {
        return await this.schemeRepo.findAllActive(category, state);
    }
    async getSchemeById(id) {
        const scheme = await this.schemeRepo.findById(id);
        if (!scheme) {
            throw new common_1.NotFoundException(`Welfare scheme with ID '${id}' not found.`);
        }
        return scheme;
    }
};
exports.WelfareSchemeService = WelfareSchemeService;
exports.WelfareSchemeService = WelfareSchemeService = WelfareSchemeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('IWelfareSchemeRepository')),
    __param(2, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [Object, prisma_service_1.PrismaService,
        proactive_notification_service_1.ProactiveNotificationService])
], WelfareSchemeService);
//# sourceMappingURL=welfare.service.js.map