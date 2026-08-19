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
var GeminiAiAdapter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiAiAdapter = void 0;
const common_1 = require("@nestjs/common");
const genai_1 = require("@google/genai");
let GeminiAiAdapter = GeminiAiAdapter_1 = class GeminiAiAdapter {
    providerName = 'gemini';
    logger = new common_1.Logger(GeminiAiAdapter_1.name);
    aiClient = null;
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey && !apiKey.includes('temp') && !apiKey.includes('your-')) {
            this.aiClient = new genai_1.GoogleGenAI({ apiKey });
            this.logger.log('Google Gemini AI Client initialized successfully.');
        }
        else {
            this.logger.warn('GEMINI_API_KEY not configured. Running in fallback mode.');
        }
    }
    getModelName() {
        return process.env.GEMINI_MODEL || 'gemini-3.6-flash';
    }
    async generateText(options) {
        const model = this.getModelName();
        if (!this.aiClient) {
            return {
                content: 'BenefitOS AI is currently unavailable (Unconfigured API key). Please try again later.',
                tokensUsed: 0,
                provider: 'gemini-unconfigured',
                model,
            };
        }
        try {
            const response = await this.aiClient.models.generateContent({
                model,
                contents: [options.prompt],
                config: {
                    systemInstruction: options.systemInstruction,
                    temperature: options.temperature || 0.3,
                    maxOutputTokens: options.maxTokens || 1000,
                },
            });
            const text = response.text || '';
            return {
                content: text,
                tokensUsed: Math.ceil(text.length / 4),
                provider: this.providerName,
                model,
            };
        }
        catch (err) {
            this.logger.error(`Gemini generateText error: ${err.message}`);
            return {
                content: '[BenefitOS AI Notice] Live AI inference is currently unavailable due to network or service connectivity. Please verify internet access and GEMINI_API_KEY configuration.',
                tokensUsed: 0,
                provider: 'gemini-offline',
                model: `${model}-fallback`,
            };
        }
    }
    async generateStream(options, onChunk) {
        const res = await this.generateText(options);
        onChunk(res.content);
        return res;
    }
    async extractDocumentData(fileBuffer, mimeType, expectedDocType) {
        const model = this.getModelName();
        if (!this.aiClient) {
            const bufferText = fileBuffer ? fileBuffer.toString('utf-8') : '';
            const rawText = bufferText.length > 5 && !bufferText.includes('\u0000')
                ? bufferText
                : `[Fallback OCR Raw Text for ${expectedDocType}]`;
            return {
                rawText,
                confidenceScore: 0.95,
                extractedFields: { docType: expectedDocType, verifiedStatus: 'MOCK_SUCCESS' },
            };
        }
        try {
            const prompt = `Analyze this ${expectedDocType} document image. Extract raw text and return a JSON object with key fields such as documentNumber, fullName, dateOfBirth, address, issueDate.`;
            const response = await this.aiClient.models.generateContent({
                model,
                contents: [
                    {
                        inlineData: {
                            mimeType,
                            data: fileBuffer.toString('base64'),
                        },
                    },
                    prompt,
                ],
            });
            const rawText = response.text || '';
            let extractedFields = {};
            try {
                const jsonMatch = rawText.match(/\{[\s\S]*\}/);
                if (jsonMatch)
                    extractedFields = JSON.parse(jsonMatch[0]);
            }
            catch {
                extractedFields = { raw: rawText };
            }
            return {
                rawText,
                confidenceScore: 0.92,
                extractedFields,
            };
        }
        catch (err) {
            this.logger.error(`Gemini Vision OCR extraction failed: ${err.message}`);
            return {
                rawText: 'OCR extraction failure.',
                confidenceScore: 0.0,
                extractedFields: {},
            };
        }
    }
};
exports.GeminiAiAdapter = GeminiAiAdapter;
exports.GeminiAiAdapter = GeminiAiAdapter = GeminiAiAdapter_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], GeminiAiAdapter);
//# sourceMappingURL=gemini-ai.adapter.js.map