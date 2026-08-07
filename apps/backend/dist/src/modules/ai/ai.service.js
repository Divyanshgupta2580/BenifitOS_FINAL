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
var AiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const gemini_ai_adapter_1 = require("../../infrastructure/ai/gemini-ai.adapter");
const ai_safety_service_1 = require("../../infrastructure/ai/ai-safety.service");
let AiService = AiService_1 = class AiService {
    geminiAdapter;
    aiSafety;
    logger = new common_1.Logger(AiService_1.name);
    constructor(geminiAdapter, aiSafety) {
        this.geminiAdapter = geminiAdapter;
        this.aiSafety = aiSafety;
    }
    async chat(prompt, context) {
        const sanitizedPrompt = this.aiSafety.sanitizePromptInput(prompt);
        const redactedContext = context ? this.aiSafety.redactPiiFromContext(context) : {};
        const systemInstruction = `You are BenefitOS Assistant, an expert digital welfare advisor. 
You provide accessible, polite, and accurate explanations of government welfare schemes.
NEVER make up eligibility rules. Eligibility is determined strictly by the BenefitOS Recommendation Engine.`;
        const fullPrompt = `${sanitizedPrompt}\n\n[Context: ${JSON.stringify(redactedContext)}]`;
        const result = await this.geminiAdapter.generateText({
            prompt: fullPrompt,
            systemInstruction,
        });
        return { content: result.content, provider: result.provider };
    }
    async explainRecommendation(schemeTitle, matchPercentage, criteriaMet, missingCriteria) {
        const prompt = `Explain why a citizen received a ${matchPercentage}% match for the scheme '${schemeTitle}'.
Criteria Satisfied: ${criteriaMet.join('; ')}
Missing Requirements: ${missingCriteria.join('; ')}
Explain in clear, encouraging, natural language how they can fulfill missing criteria.`;
        const res = await this.geminiAdapter.generateText({ prompt });
        return res.content;
    }
};
exports.AiService = AiService;
exports.AiService = AiService = AiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [gemini_ai_adapter_1.GeminiAiAdapter,
        ai_safety_service_1.AiSafetyService])
], AiService);
//# sourceMappingURL=ai.service.js.map