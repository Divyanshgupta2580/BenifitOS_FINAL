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
exports.WelfareSchemeController = void 0;
const common_1 = require("@nestjs/common");
const welfare_service_1 = require("./welfare.service");
const scheme_entity_1 = require("../../domain/welfare/scheme.entity");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let WelfareSchemeController = class WelfareSchemeController {
    schemeService;
    constructor(schemeService) {
        this.schemeService = schemeService;
    }
    async getSchemes(category, state) {
        const schemes = await this.schemeService.getAllSchemes(category, state);
        return {
            count: schemes.length,
            schemes: schemes.map((s) => ({
                id: s.id,
                code: s.code,
                title: s.title,
                description: s.description,
                category: s.category,
                department: s.department,
                financialBenefit: s.financialBenefit,
                isCentralScheme: s.isCentralScheme,
            })),
        };
    }
    async getSchemeById(id) {
        const scheme = await this.schemeService.getSchemeById(id);
        return {
            scheme: {
                id: scheme.id,
                code: scheme.code,
                title: scheme.title,
                description: scheme.description,
                category: scheme.category,
                department: scheme.department,
                financialBenefit: scheme.financialBenefit,
                eligibilityRules: scheme.eligibilityRules,
                requiredDocuments: scheme.requiredDocuments,
            },
        };
    }
};
exports.WelfareSchemeController = WelfareSchemeController;
__decorate([
    (0, roles_decorator_1.Public)(),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('category')),
    __param(1, (0, common_1.Query)('state')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WelfareSchemeController.prototype, "getSchemes", null);
__decorate([
    (0, roles_decorator_1.Public)(),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WelfareSchemeController.prototype, "getSchemeById", null);
exports.WelfareSchemeController = WelfareSchemeController = __decorate([
    (0, common_1.Controller)('schemes'),
    __metadata("design:paramtypes", [welfare_service_1.WelfareSchemeService])
], WelfareSchemeController);
//# sourceMappingURL=welfare.controller.js.map