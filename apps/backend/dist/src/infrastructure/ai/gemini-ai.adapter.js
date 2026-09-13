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
    guidanceClient = null;
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey && !apiKey.includes('temp') && !apiKey.includes('your-')) {
            this.aiClient = new genai_1.GoogleGenAI({ apiKey });
            this.logger.log('Google Gemini AI Client (Chatbot) initialized successfully.');
        }
        else {
            this.logger.warn('GEMINI_API_KEY not configured. Running in fallback mode.');
        }
        const guidanceApiKey = process.env.GEMINI_SCHEME_GUIDANCE_API_KEY || apiKey;
        if (guidanceApiKey && !guidanceApiKey.includes('temp') && !guidanceApiKey.includes('your-')) {
            this.guidanceClient = new genai_1.GoogleGenAI({ apiKey: guidanceApiKey });
            this.logger.log('Google Gemini AI Scheme Guidance Client initialized with dedicated secondary API key.');
        }
    }
    getModelName() {
        return process.env.GEMINI_MODEL || 'gemini-3.6-flash';
    }
    async generateText(options) {
        const model = this.getModelName();
        if (!this.aiClient) {
            return {
                content: 'BenefitOS AI Citizen Copilot is currently offline. Please verify service configuration and try again.',
                tokensUsed: 0,
                provider: 'BenefitOS AI',
                model: 'BenefitOS-AI',
            };
        }
        try {
            const response = await this.aiClient.models.generateContent({
                model,
                contents: [options.prompt],
                config: {
                    systemInstruction: options.systemInstruction,
                    temperature: options.temperature || 0.3,
                    maxOutputTokens: options.maxTokens || 8192,
                    thinkingConfig: {
                        thinkingBudget: 512,
                    },
                },
            });
            const text = response.text || '';
            return {
                content: text,
                tokensUsed: Math.ceil(text.length / 4),
                provider: 'BenefitOS AI',
                model: 'BenefitOS-AI',
            };
        }
        catch (err) {
            this.logger.error(`AI generateText error: ${err.message}`);
            return {
                content: 'BenefitOS AI is temporarily unable to process your request. Please verify your connection or try again shortly.',
                tokensUsed: 0,
                provider: 'BenefitOS AI',
                model: 'BenefitOS-AI',
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
                config: {
                    maxOutputTokens: 4096,
                    thinkingConfig: {
                        thinkingBudget: 512,
                    },
                },
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
    async generateSchemeInstructions(options) {
        const client = this.guidanceClient || this.aiClient;
        const model = this.getModelName();
        const prompt = `Provide clear, authoritative, step-by-step instructions on how an Indian citizen can apply for the welfare scheme '${options.schemeTitle}' (${options.category || 'Welfare'}) offered by '${options.department || 'Government Welfare Department'}'.
Scheme Overview: ${options.description || 'Government welfare program for eligible citizens.'}
Eligibility Rules: ${options.eligibilityRules?.join('; ') || 'Standard welfare criteria.'}

Format your response in clean, formal Markdown with clear section headings and bullet points covering:
1. Prerequisites and Document Checklist (Required files and identification proofs)
2. Official Portal Registration and Account Setup (Registration on the government portal)
3. Application Form Details (Step-by-step field guidance)
4. Document Scanning and Upload Guidelines (Accepted formats and size requirements)
5. Final Submission and Acknowledgement Number (Safeguarding application reference ID)
6. Tracking Application Status and Benefit Disbursement (Verification and direct transfer tracking)

IMPORTANT: Do not use emojis, casual language, or marketing claims. Maintain a professional, neutral government portal tone.`;
        if (!client) {
            return `### Step-by-Step Application Guide for ${options.schemeTitle}

1. **Prerequisites and Document Checklist**: Prepare clear copies of your Aadhaar Card, Income Certificate, Domicile Certificate, and Bank Account Passbook.
2. **Official Portal Registration**: Access the official portal using the portal link. Complete registration and verify your mobile number.
3. **Application Form Details**: Enter your personal details, household income, state domicile, and active bank account details for direct benefit transfer.
4. **Upload Required Documents**: Upload scanned copies of required documents in PDF or JPEG format.
5. **Final Submission and Acknowledgement**: Submit your application and save your Application Reference Number for tracking.
6. **Track Status**: Monitor verification status and benefit disbursement timeline on the portal.`;
        }
        try {
            const response = await client.models.generateContent({
                model,
                contents: [prompt],
                config: {
                    systemInstruction: 'You are BenefitOS Scheme Application Specialist. Provide complete, clear, step-by-step instructions without emojis.',
                    temperature: 0.2,
                    maxOutputTokens: 8192,
                    thinkingConfig: {
                        thinkingBudget: 512,
                    },
                },
            });
            return response.text || '';
        }
        catch (err) {
            this.logger.error(`AI generateSchemeInstructions error: ${err.message}`);
            return `### Step-by-Step Application Guide for ${options.schemeTitle}

1. **Prerequisites and Document Checklist**: Verify Aadhaar, mobile number linked to bank account, and category or income certificate.
2. **Official Portal Registration**: Access the official portal and register with your credentials.
3. **Application Form Details**: Fill personal, income, and occupational details accurately.
4. **Upload Scanned Proofs**: Attach mandatory identity and income proofs.
5. **Final Submission and Acknowledgement**: Submit the form and store the Application Reference ID for tracking.`;
        }
    }
};
exports.GeminiAiAdapter = GeminiAiAdapter;
exports.GeminiAiAdapter = GeminiAiAdapter = GeminiAiAdapter_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], GeminiAiAdapter);
//# sourceMappingURL=gemini-ai.adapter.js.map