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
exports.AiController = exports.SchemeInstructionsDto = exports.ExplainRecommendationDto = exports.AiChatDto = void 0;
const common_1 = require("@nestjs/common");
const ai_service_1 = require("./ai.service");
const class_validator_1 = require("class-validator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
class AiChatDto {
    prompt;
    context;
    language;
}
exports.AiChatDto = AiChatDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AiChatDto.prototype, "prompt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], AiChatDto.prototype, "context", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AiChatDto.prototype, "language", void 0);
class ExplainRecommendationDto {
    schemeTitle;
    matchPercentage;
    criteriaMet;
    missingCriteria;
    language;
}
exports.ExplainRecommendationDto = ExplainRecommendationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExplainRecommendationDto.prototype, "schemeTitle", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ExplainRecommendationDto.prototype, "matchPercentage", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], ExplainRecommendationDto.prototype, "criteriaMet", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], ExplainRecommendationDto.prototype, "missingCriteria", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExplainRecommendationDto.prototype, "language", void 0);
class SchemeInstructionsDto {
    schemeTitle;
    schemeId;
}
exports.SchemeInstructionsDto = SchemeInstructionsDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SchemeInstructionsDto.prototype, "schemeTitle", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SchemeInstructionsDto.prototype, "schemeId", void 0);
let AiController = class AiController {
    aiService;
    constructor(aiService) {
        this.aiService = aiService;
    }
    async chat(dto, userId) {
        const res = await this.aiService.chat(dto.prompt, dto.context, userId, dto.language);
        return {
            reply: res.content,
            provider: 'BenefitOS AI',
        };
    }
    async explainRecommendation(dto) {
        const explanation = await this.aiService.explainRecommendation(dto.schemeTitle, dto.matchPercentage, dto.criteriaMet, dto.missingCriteria);
        return { explanation };
    }
    async getSchemeInstructions(dto) {
        return await this.aiService.getSchemeInstructions(dto.schemeTitle, dto.schemeId);
    }
};
exports.AiController = AiController;
__decorate([
    (0, common_1.Post)('chat'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AiChatDto, String]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "chat", null);
__decorate([
    (0, common_1.Post)('explain-recommendation'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ExplainRecommendationDto]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "explainRecommendation", null);
__decorate([
    (0, common_1.Post)('scheme-instructions'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SchemeInstructionsDto]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "getSchemeInstructions", null);
exports.AiController = AiController = __decorate([
    (0, common_1.Controller)('ai'),
    __metadata("design:paramtypes", [ai_service_1.AiService])
], AiController);
//# sourceMappingURL=ai.controller.js.map