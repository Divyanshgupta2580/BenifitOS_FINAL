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
    async chat(prompt, context, userId) {
        const sanitizedPrompt = this.aiSafety.sanitizePromptInput(prompt);
        const redactedContext = context ? this.aiSafety.redactPiiFromContext(context) : {};
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
        const systemInstruction = `You are BenefitOS Assistant, an expert digital welfare advisor for Indian citizens.
You provide accessible, polite, encouraging, and accurate guidance on Indian government welfare schemes.

CRITICAL CITIZEN PROFILE DIRECTIVES:
1. You ALREADY have access to the citizen's verified database profile and pre-calculated scheme eligibility matches in the section below.
2. STRICT ELIGIBILITY MANDATE: Only present schemes where isEligible is YES for this citizen. DO NOT show or recommend ineligible schemes.
3. DO NOT ask the citizen for their age, gender, state, occupation, income, or category when it is already provided in their database profile.
4. When the citizen asks for suitable schemes (e.g., "schemes suitable for me", "what policies apply to me"), immediately read their pre-loaded profile and present the top eligible matched schemes.
5. Clearly explain why they qualify, the monetary or social benefits, and what next steps or documents are required.

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