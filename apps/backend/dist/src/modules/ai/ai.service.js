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
const prisma_service_1 = require("../../infrastructure/database/prisma.service");
let AiService = AiService_1 = class AiService {
    geminiAdapter;
    aiSafety;
    prisma;
    logger = new common_1.Logger(AiService_1.name);
    constructor(geminiAdapter, aiSafety, prisma) {
        this.geminiAdapter = geminiAdapter;
        this.aiSafety = aiSafety;
        this.prisma = prisma;
    }
    async chat(prompt, context, userId, language) {
        const sanitizedPrompt = this.aiSafety.sanitizePromptInput(prompt);
        const redactedContext = context ? this.aiSafety.redactPiiFromContext(context) : {};
        const isHindi = language === 'hi';
        let citizenProfileContext = '';
        if (userId) {
            try {
                const profile = await this.prisma.client.citizenProfile.findUnique({
                    where: { userId },
                    include: {
                        address: true,
                        recommendations: {
                            include: {
                                scheme: true,
                            },
                        },
                    },
                });
                if (profile) {
                    const age = profile.dateOfBirth
                        ? Math.floor((new Date().getTime() - new Date(profile.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
                        : 'Not specified';
                    const matchedSchemes = profile.recommendations && profile.recommendations.length > 0
                        ? profile.recommendations.map((r) => {
                            return `* Scheme: [${r.scheme.title}] (Category: ${r.scheme.category}, Department: ${r.scheme.department}, State: ${r.scheme.state || 'Central'}, Financial Benefit: ₹${r.estimatedBenefit})
  - Match Score: ${r.matchPercentage}% | Eligible: ${r.isEligible ? 'YES' : 'NO'}
  - Satisfied Criteria: ${r.criteriaMet.length > 0 ? r.criteriaMet.join('; ') : 'All general criteria met'}
  - Missing Requirements: ${r.missingCriteria.length > 0 ? r.missingCriteria.join('; ') : 'None'}`;
                        }).join('\n')
                        : 'No pre-calculated scheme recommendations found in database.';
                    citizenProfileContext = `
============================================================
VERIFIED CITIZEN DATABASE PROFILE (Loaded from BenefitOS Database):
============================================================
- Full Name: ${profile.firstName} ${profile.lastName}
- Age: ${age} years
- Gender: ${profile.gender}
- Marital Status: ${profile.maritalStatus}
- Social Category: ${profile.socialCategory}
- Occupation / Employment Status: ${profile.employmentStatus}
- Annual Household Income: ₹${profile.annualIncomeINR} / year
- Domicile State / UT: ${profile.address?.state || 'Delhi'}
- District / City: ${profile.address?.district || profile.address?.city || 'Delhi'}
- Disability Status: ${profile.disabilityType} (${profile.disabilityPercent}%)
- BPL Card Holder: ${profile.isBplCardHolder ? 'Yes' : 'No'}

PRE-CALCULATED SCHEME ELIGIBILITY & RECOMMENDATIONS (BenefitOS Matching Engine):
${matchedSchemes}
============================================================`;
                }
            }
            catch (err) {
                this.logger.warn(`Could not load citizen profile for AI chat context: ${err.message}`);
            }
        }
        const languageDirective = isHindi
            ? `MANDATORY LANGUAGE DIRECTIVE — HINDI (हिंदी):
- You MUST generate your ENTIRE response in polite, formal, accurate Hindi (हिंदी).
- Use Devanagari script for the entire response.
- Retain proper nouns and official acronyms in English only where standard (e.g., 'PM-KISAN', 'Ayushman Bharat PM-JAY', 'Aadhaar').
- Scheme format in Hindi:
  ### [योजना का नाम]
  **विभाग**: [विभाग/मंत्रालय का नाम]
  **पात्रता स्थिति**: [उपलब्ध जानकारी के अनुसार प्रासंगिक | सत्यापन आवश्यक | सत्यापित]
  **अनुमानित लाभ**: [प्रति वर्ष ₹X या योजना प्रावधानों के अनुसार]
  **यह आपके लिए क्यों लागू हो सकता है**: [आपकी प्रोफ़ाइल के अनुसार 1-2 वाक्य]
  **आवश्यक दस्तावेज़**:
  - [आधार कार्ड]
  - [आय प्रमाण पत्र]
  - [अन्य दस्तावेज़]
  **अगला कदम**: [सीएससी केंद्र या आधिकारिक पोर्टल पर आवेदन का चरण]
- Application steps format in Hindi:
  चरण 01: पात्रता की पुष्टि करें
  चरण 02: आवश्यक दस्तावेज़ तैयार करें
  चरण 03: आधिकारिक पोर्टल पर पंजीकरण करें
  चरण 04: आवेदन पत्र जमा करें
  चरण 05: आवेदन स्थिति ट्रैक करें
- Official disclaimer in Hindi: "आधिकारिक सूचना: योजनाओं की सिफारिशें आपके BenefitOS प्रोफ़ाइल में उपलब्ध जानकारी पर आधारित हैं। अंतिम पात्रता, लाभ वितरण और आवेदन स्वीकृति संबंधित सरकारी विभाग या मंत्रालय द्वारा निर्धारित की जाती है।"`
            : `MANDATORY LANGUAGE DIRECTIVE — ENGLISH:
- Respond in clear, professional, concise Indian English.
- Scheme format:
  ### [Scheme Name]
  **Department/Ministry**: [Department Name]
  **Eligibility Status**: [Appears relevant based on available profile information | Requires verification | Verified]
  **Estimated Benefit**: [₹X / Year or Subject to scheme provisions]
  **Why this may apply**: [1-2 concise sentences connecting to profile]
  **Required Documents**:
  - [Aadhaar Card]
  - [Income Certificate]
  - [Other required documents]
  **Next Step**: [Actionable step on official portal/CSC]
- Application steps format:
  Step 01: Verify Eligibility
  Step 02: Prepare Required Documents
  Step 03: Register on Official Portal
  Step 04: Complete & Submit Application Form
  Step 05: Track Application Status
- Official disclaimer: "Official Notice: Scheme recommendations and guidance are based on verified information available in your BenefitOS profile. Final eligibility, benefit disbursement, and application approval are determined exclusively by the concerned Government Ministry or implementing department."`;
        const systemInstruction = `You are BenefitOS AI Citizen Copilot, the official digital welfare intelligence assistant for Indian citizens.
Your role is to act as an authoritative, respectful, clear, neutral, citizen-friendly, and helpful government welfare assistance officer.

OFFICIAL TONE & IDENTITY:
- Speak as "BenefitOS AI Citizen Copilot" or "BenefitOS AI". NEVER mention any external AI provider, model name, or LLM infrastructure.
- Tone: Professional, respectful, clear, evidence-based, concise, and non-judgmental.
- Avoid casual greetings ("Hey!", "Great question!"), marketing hype ("Amazing benefits!"), or conversational fluff ("I am excited to help").

${languageDirective}

STRICT ELIGIBILITY & EVIDENCE RULES:
- NEVER declare unconditional eligibility without authoritative verification.
- Always distinguish between:
  1. "Appears relevant based on available information"
  2. "Requires verification"
  3. "Eligibility status: Verified" (only when pre-calculated in database)

PRIVACY DIRECTIVE:
- Do not unnecessarily recite raw citizen PII (income, disability, caste) unless directly relevant to answering their specific eligibility inquiry.

${citizenProfileContext}`;
        const fullPrompt = `${sanitizedPrompt}\n\n[Client Context: ${JSON.stringify(redactedContext)}]`;
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
    async getSchemeInstructions(schemeTitle, schemeId) {
        let scheme = null;
        if (schemeId) {
            scheme = await this.prisma.client.welfareScheme.findUnique({
                where: { id: schemeId },
                include: { eligibilityRules: true, requiredDocuments: true },
            });
        }
        if (!scheme && schemeTitle) {
            scheme = await this.prisma.client.welfareScheme.findFirst({
                where: { title: { contains: schemeTitle, mode: 'insensitive' } },
                include: { eligibilityRules: true, requiredDocuments: true },
            });
        }
        const rules = scheme?.eligibilityRules?.map((r) => r.description) || [];
        const instructions = await this.geminiAdapter.generateSchemeInstructions({
            schemeTitle: scheme?.title || schemeTitle,
            category: scheme?.category,
            department: scheme?.department,
            description: scheme?.description,
            eligibilityRules: rules,
        });
        const officialApplyUrls = {
            'PM-KISAN': 'https://pmkisan.gov.in',
            'PMAY-GRAMIN': 'https://pmayg.nic.in',
            'PM-VIDYA-SCHOLARSHIP': 'https://scholarships.gov.in',
            'UP-POST-MATRIC-SCHOLARSHIP': 'https://scholarship.up.gov.in',
            'AYUSHMAN-BHARAT-PMJAY': 'https://pmjay.gov.in',
            'PM-MUDRA-YOJANA': 'https://www.mudra.org.in',
            'NSAP-NATIONAL-PENSION': 'https://nsap.nic.in',
        };
        let applicationUrl = officialApplyUrls[scheme?.code || ''] || 'https://www.india.gov.in/my-government/schemes';
        if (scheme?.category === 'EDUCATION')
            applicationUrl = 'https://scholarships.gov.in';
        if (scheme?.category === 'HEALTHCARE')
            applicationUrl = 'https://pmjay.gov.in';
        if (scheme?.category === 'HOUSING')
            applicationUrl = 'https://pmayg.nic.in';
        if (scheme?.category === 'FINANCIAL_INCLUSION')
            applicationUrl = 'https://www.mudra.org.in';
        if (scheme?.state?.toLowerCase().includes('uttar pradesh'))
            applicationUrl = 'https://scholarship.up.gov.in';
        return {
            instructions,
            applicationUrl,
            schemeTitle: scheme?.title || schemeTitle,
        };
    }
};
exports.AiService = AiService;
exports.AiService = AiService = AiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [gemini_ai_adapter_1.GeminiAiAdapter,
        ai_safety_service_1.AiSafetyService,
        prisma_service_1.PrismaService])
], AiService);
//# sourceMappingURL=ai.service.js.map