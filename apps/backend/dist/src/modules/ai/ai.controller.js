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
exports.AiController = exports.ExplainRecommendationDto = exports.AiChatDto = void 0;
const common_1 = require("@nestjs/common");
const ai_service_1 = require("./ai.service");
const class_validator_1 = require("class-validator");
class AiChatDto {
    prompt;
    context;
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
class ExplainRecommendationDto {
    schemeTitle;
    matchPercentage;
    criteriaMet;
    missingCriteria;
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
let AiController = class AiController {
    aiService;
    constructor(aiService) {
        this.aiService = aiService;
    }
    async chat(dto) {
        const res = await this.aiService.chat(dto.prompt, dto.context);
        return {
            reply: res.content,
            provider: res.provider,
        };
    }
    async explainRecommendation(dto) {
        const explanation = await this.aiService.explainRecommendation(dto.schemeTitle, dto.matchPercentage, dto.criteriaMet, dto.missingCriteria);
        return { explanation };
    }
};
exports.AiController = AiController;
__decorate([
    (0, common_1.Post)('chat'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AiChatDto]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "chat", null);
__decorate([
    (0, common_1.Post)('explain-recommendation'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ExplainRecommendationDto]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "explainRecommendation", null);
exports.AiController = AiController = __decorate([
    (0, common_1.Controller)('ai'),
    __metadata("design:paramtypes", [ai_service_1.AiService])
], AiController);
//# sourceMappingURL=ai.controller.js.map