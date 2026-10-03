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
    getModelCandidates() {
        const configured = process.env.GEMINI_MODEL;
        const candidates = [configured, 'gemini-3.5-flash-lite', 'gemini-3.8-flash'].filter(Boolean);
        return Array.from(new Set(candidates));
    }
    getModelName() {
        return process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
    }
    async generateText(options) {
        const clients = [this.aiClient, this.guidanceClient].filter(Boolean);
        const models = this.getModelCandidates();
        if (clients.length === 0) {
            return {
                content: 'AI Copilot is currently offline. Please verify service configuration and try again.',
                tokensUsed: 0,
                provider: 'AI Copilot',
                model: 'AI-Copilot',
            };
        }
        const config = {
            systemInstruction: options.systemInstruction,
            temperature: options.temperature || 0.3,
            maxOutputTokens: options.maxTokens || 8192,
            thinkingConfig: {
                thinkingBudget: 512,
            },
        };
        for (const client of clients) {
            for (const model of models) {
                try {
                    const response = await client.models.generateContent({
                        model,
                        contents: [options.prompt],
                        config,
                    });
                    const text = response.text || '';
                    if (text) {
                        return {
                            content: text,
                            tokensUsed: Math.ceil(text.length / 4),
                            provider: 'AI Copilot',
                            model,
                        };
                    }
                }
                catch (err) {
                    this.logger.warn(`Gemini client model ${model} attempt failed: ${err.message}. Trying next candidate...`);
                }
            }
        }
        return {
            content: 'AI Copilot is temporarily unable to process your request. Please verify your connection or try again shortly.',
            tokensUsed: 0,
            provider: 'AI Copilot',
            model: 'AI-Copilot',
        };
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
            const isReadableText = bufferText.length > 5 && !bufferText.includes('\u0000');
            const rawText = isReadableText ? bufferText : '';
            return {
                rawText,
                confidenceScore: isReadableText ? 0.85 : 0.0,
                extractedFields: { docType: expectedDocType, providerStatus: isReadableText ? 'TEXT_STREAM_PARSED' : 'OFFLINE_UNCONFIGURED' },
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
            const bufferText = fileBuffer ? fileBuffer.toString('utf-8') : '';
            const isReadableText = bufferText.length > 5 && !bufferText.includes('\u0000');
            return {
                rawText: isReadableText ? bufferText : '',
                confidenceScore: isReadableText ? 0.85 : 0.0,
                extractedFields: {
                    docType: expectedDocType,
                    providerStatus: isReadableText ? 'TEXT_STREAM_FALLBACK' : 'OFFLINE_UNCONFIGURED',
                    error: err.message,
                },
            };
        }
    }
    async generateSchemeInstructions(options) {
        const clients = [this.guidanceClient, this.aiClient].filter(Boolean);
        const models = this.getModelCandidates();
        const isHindi = options.language === 'hi';
        const prompt = isHindi
            ? `कृपया भारतीय नागरिक के लिए कल्याणकारी योजना '${options.schemeTitle}' (${options.category || 'कल्याण'}) जो कि '${options.department || 'सरकारी कल्याण विभाग'}' द्वारा प्रदान की जाती है, के लिए आवेदन करने हेतु स्पष्ट, आधिकारिक और चरणबद्ध निर्देश (Step-by-Step Instructions) शुद्ध एवं स्पष्ट हिंदी (देवनागरी लिपि) में प्रदान करें।
योजना विवरण: ${options.description || 'पात्र नागरिकों के लिए सरकारी कल्याणकारी कार्यक्रम।'}
पात्रता नियम: ${options.eligibilityRules?.join('; ') || 'मानक कल्याणकारी मानदंड।'}

निम्नलिखित मुख्य शीर्षकों के साथ स्पष्ट मार्कडाउन (Markdown) प्रारूप में उत्तर दें:
1. आवश्यक शर्तें एवं दस्तावेज़ चेकलिस्ट (Prerequisites and Document Checklist)
2. आधिकारिक पोर्टल पंजीकरण एवं खाता निर्माण (Official Portal Registration)
3. आवेदन पत्र भरने के निर्देश (Application Form Details)
4. दस्तावेज़ स्कैन एवं अपलोड दिशानिर्देश (Document Upload Guidelines)
5. अंतिम सबमिशन एवं पावती संदर्भ संख्या (Final Submission and Reference Number)
6. आवेदन स्थिति एवं लाभ वितरण ट्रैकिंग (Status Tracking and DBT Disbursement)

महत्वपूर्ण: किसी भी इमोजी (emojis) का उपयोग न करें। पूरी तरह से सरल, स्वाभाविक और शुद्ध हिंदी (देवनागरी) में लिखें।`
            : `Provide clear, authoritative, step-by-step instructions on how an Indian citizen can apply for the welfare scheme '${options.schemeTitle}' (${options.category || 'Welfare'}) offered by '${options.department || 'Government Welfare Department'}'.
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
        if (clients.length === 0) {
            return isHindi
                ? `### ${options.schemeTitle} के लिए चरणबद्ध आवेदन मार्गदर्शिका

1. **आवश्यक शर्तें एवं दस्तावेज़ चेकलिस्ट**: आधार कार्ड, आय प्रमाण पत्र, निवास प्रमाण पत्र और सक्रिय बैंक पासबुक की स्पष्ट प्रतियां तैयार रखें।
2. **आधिकारिक पोर्टल पंजीकरण**: आधिकारिक सरकारी पोर्टल पर जाएं और अपने मोबाइल नंबर से पंजीकरण पूर्ण करें।
3. **आवेदन पत्र विवरण**: अपना व्यक्तिगत विवरण, पारिवारिक आय, राज्य निवास और डीबीटी बैंक खाता विवरण दर्ज करें।
4. **आवश्यक दस्तावेज़ अपलोड करें**: मांगे गए आवश्यक पहचान एवं श्रेणी प्रमाण पत्र पीडीएफ या जेपीईजी प्रारूप में अपलोड करें।
5. **अंतिम सबमिशन एवं पावती**: आवेदन पत्र जमा करें और भविष्य के संदर्भ के लिए आवेदन संदर्भ संख्या (Acknowledgment Reference Number) सुरक्षित रखें।
6. **स्थिति ट्रैक करें**: पोर्टल पर अपने आवेदन की सत्यापन स्थिति और लाभ वितरण की निगरानी करें।`
                : `### Step-by-Step Application Guide for ${options.schemeTitle}

1. **Prerequisites and Document Checklist**: Prepare clear copies of your Aadhaar Card, Income Certificate, Domicile Certificate, and Bank Account Passbook.
2. **Official Portal Registration**: Access the official portal using the portal link. Complete registration and verify your mobile number.
3. **Application Form Details**: Enter your personal details, household income, state domicile, and active bank account details for direct benefit transfer.
4. **Upload Required Documents**: Upload scanned copies of required documents in PDF or JPEG format.
5. **Final Submission and Acknowledgement**: Submit your application and save your Application Reference Number for tracking.
6. **Track Status**: Monitor verification status and benefit disbursement timeline on the portal.`;
        }
        const config = {
            systemInstruction: isHindi
                ? 'You are an AI Copilot scheme application specialist. Provide complete, clear, step-by-step instructions in Hindi (Devanagari script) without emojis.'
                : 'You are an AI Copilot scheme application specialist. Provide complete, clear, step-by-step instructions without emojis.',
            temperature: 0.2,
            maxOutputTokens: 8192,
            thinkingConfig: {
                thinkingBudget: 512,
            },
        };
        for (const client of clients) {
            for (const model of models) {
                try {
                    const response = await client.models.generateContent({
                        model,
                        contents: [prompt],
                        config,
                    });
                    const text = response.text || '';
                    if (text) {
                        return text;
                    }
                }
                catch (err) {
                    this.logger.warn(`AI generateSchemeInstructions attempt failed on model ${model}: ${err.message}. Trying next candidate...`);
                }
            }
        }
        return isHindi
            ? `### ${options.schemeTitle} के लिए चरणबद्ध आवेदन मार्गदर्शिका

1. **आवश्यक शर्तें एवं दस्तावेज़ चेकलिस्ट**: आधार कार्ड, बैंक खाते से लिंक मोबाइल नंबर और आय प्रमाण पत्र सत्यापित करें।
2. **आधिकारिक पोर्टल पंजीकरण**: आधिकारिक पोर्टल पर जाएं और अपने विवरण से पंजीकरण करें।
3. **आवेदन पत्र विवरण**: व्यक्तिगत, आय और व्यावसायिक विवरण सही-सही भरें।
4. **स्कैन किए गए प्रमाण अपलोड करें**: आवश्यक पहचान और आय प्रमाण संलग्न करें।
5. **अंतिम सबमिशन एवं पावती**: फॉर्म जमा करें और ट्रैकिंग के लिए आवेदन संदर्भ आईडी सुरक्षित रखें।`
            : `### Step-by-Step Application Guide for ${options.schemeTitle}

1. **Prerequisites and Document Checklist**: Verify Aadhaar, mobile number linked to bank account, and category or income certificate.
2. **Official Portal Registration**: Access the official portal and register with your credentials.
3. **Application Form Details**: Fill personal, income, and occupational details accurately.
4. **Upload Scanned Proofs**: Attach mandatory identity and income proofs.
5. **Final Submission and Acknowledgement**: Submit the form and store the Application Reference ID for tracking.`;
    }
};
exports.GeminiAiAdapter = GeminiAiAdapter;
exports.GeminiAiAdapter = GeminiAiAdapter = GeminiAiAdapter_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], GeminiAiAdapter);
//# sourceMappingURL=gemini-ai.adapter.js.map