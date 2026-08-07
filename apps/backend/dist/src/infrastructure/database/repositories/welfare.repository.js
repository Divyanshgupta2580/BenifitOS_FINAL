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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemeRecommendationRepositoryImpl = exports.WelfareSchemeRepositoryImpl = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const scheme_entity_1 = require("../../../domain/welfare/scheme.entity");
const recommendation_entity_1 = require("../../../domain/welfare/recommendation.entity");
let WelfareSchemeRepositoryImpl = class WelfareSchemeRepositoryImpl {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    mapToEntity(data) {
        return new scheme_entity_1.WelfareSchemeEntity({
            id: data.id,
            code: data.code,
            title: data.title,
            description: data.description,
            category: data.category,
            department: data.department,
            state: data.state,
            isCentralScheme: data.isCentralScheme,
            financialBenefit: data.financialBenefit,
            isActive: data.isActive,
            applicationDeadline: data.applicationDeadline,
            eligibilityRules: data.eligibilityRules ? data.eligibilityRules.map((r) => ({
                id: r.id,
                attributeKey: r.attributeKey,
                operator: r.operator,
                targetValue: r.targetValue,
                isRequired: r.isRequired,
                description: r.description,
            })) : [],
            requiredDocuments: data.requiredDocuments ? data.requiredDocuments.map((d) => d.documentType) : [],
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        });
    }
    async findById(id) {
        const record = await this.prisma.welfareScheme.findUnique({
            where: { id },
            include: { eligibilityRules: true, requiredDocuments: true },
        });
        return record ? this.mapToEntity(record) : null;
    }
    async findByCode(code) {
        const record = await this.prisma.welfareScheme.findUnique({
            where: { code },
            include: { eligibilityRules: true, requiredDocuments: true },
        });
        return record ? this.mapToEntity(record) : null;
    }
    async findAllActive(category, state) {
        const where = { isActive: true };
        if (category)
            where.category = category;
        if (state)
            where.OR = [{ state }, { isCentralScheme: true }];
        const records = await this.prisma.welfareScheme.findMany({
            where,
            include: { eligibilityRules: true, requiredDocuments: true },
        });
        return records.map((r) => this.mapToEntity(r));
    }
    async save(scheme) {
        const record = await this.prisma.welfareScheme.create({
            data: {
                id: scheme.id,
                code: scheme.code,
                title: scheme.title,
                description: scheme.description,
                category: scheme.category,
                department: scheme.department,
                state: scheme.state,
                isCentralScheme: scheme.isCentralScheme,
                financialBenefit: scheme.financialBenefit,
                isActive: scheme.isActive,
            },
            include: { eligibilityRules: true, requiredDocuments: true },
        });
        return this.mapToEntity(record);
    }
    async update(scheme) {
        const record = await this.prisma.welfareScheme.update({
            where: { id: scheme.id },
            data: {
                title: scheme.title,
                description: scheme.description,
                category: scheme.category,
                department: scheme.department,
                financialBenefit: scheme.financialBenefit,
                isActive: scheme.isActive,
            },
            include: { eligibilityRules: true, requiredDocuments: true },
        });
        return this.mapToEntity(record);
    }
};
exports.WelfareSchemeRepositoryImpl = WelfareSchemeRepositoryImpl;
exports.WelfareSchemeRepositoryImpl = WelfareSchemeRepositoryImpl = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WelfareSchemeRepositoryImpl);
let SchemeRecommendationRepositoryImpl = class SchemeRecommendationRepositoryImpl {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    mapToEntity(data) {
        return new recommendation_entity_1.SchemeRecommendationEntity({
            id: data.id,
            citizenProfileId: data.citizenProfileId,
            schemeId: data.schemeId,
            matchPercentage: data.matchPercentage,
            estimatedBenefit: data.estimatedBenefit,
            isEligible: data.isEligible,
            criteriaMet: data.criteriaMet,
            missingCriteria: data.missingCriteria,
            missingDocuments: data.missingDocuments,
            calculatedAt: data.calculatedAt,
        });
    }
    async findByCitizenId(citizenProfileId) {
        const records = await this.prisma.schemeRecommendation.findMany({
            where: { citizenProfileId },
        });
        return records.map((r) => this.mapToEntity(r));
    }
    async findByCitizenAndScheme(citizenProfileId, schemeId) {
        const record = await this.prisma.schemeRecommendation.findUnique({
            where: { citizenProfileId_schemeId: { citizenProfileId, schemeId } },
        });
        return record ? this.mapToEntity(record) : null;
    }
    async saveMany(recommendations) {
        for (const rec of recommendations) {
            await this.prisma.schemeRecommendation.upsert({
                where: { citizenProfileId_schemeId: { citizenProfileId: rec.citizenProfileId, schemeId: rec.schemeId } },
                create: {
                    id: rec.id,
                    citizenProfileId: rec.citizenProfileId,
                    schemeId: rec.schemeId,
                    matchPercentage: rec.matchPercentage,
                    estimatedBenefit: rec.estimatedBenefit,
                    isEligible: rec.isEligible,
                    criteriaMet: rec.criteriaMet,
                    missingCriteria: rec.missingCriteria,
                    missingDocuments: rec.missingDocuments,
                },
                update: {
                    matchPercentage: rec.matchPercentage,
                    estimatedBenefit: rec.estimatedBenefit,
                    isEligible: rec.isEligible,
                    criteriaMet: rec.criteriaMet,
                    missingCriteria: rec.missingCriteria,
                    missingDocuments: rec.missingDocuments,
                },
            });
        }
    }
    async deleteForCitizen(citizenProfileId) {
        await this.prisma.schemeRecommendation.deleteMany({ where: { citizenProfileId } });
    }
};
exports.SchemeRecommendationRepositoryImpl = SchemeRecommendationRepositoryImpl;
exports.SchemeRecommendationRepositoryImpl = SchemeRecommendationRepositoryImpl = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SchemeRecommendationRepositoryImpl);
//# sourceMappingURL=welfare.repository.js.map