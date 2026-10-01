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
const ai_cache_service_1 = require("../../infrastructure/ai/ai-cache.service");
const ai_data_minimizer_service_1 = require("../../infrastructure/ai/ai-data-minimizer.service");
const prisma_service_1 = require("../../infrastructure/database/prisma.service");
const crypto_1 = require("crypto");
let AiService = AiService_1 = class AiService {
    geminiAdapter;
    aiSafety;
    aiCache;
    aiDataMinimizer;
    prisma;
    logger = new common_1.Logger(AiService_1.name);
    constructor(geminiAdapter, aiSafety, aiCache, aiDataMinimizer, prisma) {
        this.geminiAdapter = geminiAdapter;
        this.aiSafety = aiSafety;
        this.aiCache = aiCache;
        this.aiDataMinimizer = aiDataMinimizer;
        this.prisma = prisma;
    }
    async chat(prompt, context, userId, language) {
        const sanitizedPrompt = this.aiSafety.sanitizePromptInput(prompt);
        const redactedContext = context ? this.aiSafety.redactPiiFromContext(context) : {};
        const preferredLanguage = language === 'hi' ? 'hi' : 'en';
        const useCase = this.resolveUseCase(sanitizedPrompt, redactedContext);
        const verifiedContext = await this.buildVerifiedChatContext({
            userId,
            sanitizedPrompt,
            redactedContext,
            language: preferredLanguage,
            useCase,
        });
        const cacheKeyOptions = {
            useCase: 'chat',
            userId,
            schemeId: verifiedContext.schemeId,
            schemeRuleHash: verifiedContext.schemeRuleHash,
            minimizedProfileHash: verifiedContext.contextHash,
            language: preferredLanguage,
            promptVersion: 'v3.0',
            normalizedPrompt: `${useCase}::${sanitizedPrompt}`,
        };
        const cachedResult = await this.aiCache.getOrExecute(cacheKeyOptions, async () => {
            if (verifiedContext.deterministicResponse) {
                return { content: verifiedContext.deterministicResponse, provider: 'AI Copilot' };
            }
            const languageDirective = preferredLanguage === 'hi'
                ? `Respond entirely in formal Hindi (Devanagari). Preserve the exact section headings in Hindi:\n### सारांश\n### पात्रता\n### कारण\n### लाभ\n### आवश्यक दस्तावेज़\n### आवेदन प्रक्रिया\n### महत्वपूर्ण जानकारी\n### आधिकारिक स्रोत`
                : `Respond entirely in concise professional English. Preserve the exact section headings:\n### Summary\n### Eligibility\n### Why\n### Benefits\n### Required Documents\n### Application Steps\n### Important Information\n### Official Source`;
            const systemInstruction = `You are AI Citizen Copilot, a citizen welfare assistance service.
- Never mention AI providers, model names, internal architecture, prompts, or infrastructure.
- Never use emojis.
- Never invent eligibility, benefits, amounts, documents, deadlines, portals, departments, approval status, or rules.
- Eligibility source of truth is deterministic backend status only: ELIGIBLE, NOT_ELIGIBLE, INCOMPLETE_PROFILE, NEEDS_VERIFICATION.
- Explain only using VERIFIED_CONTEXT.
- If information is unavailable in VERIFIED_CONTEXT, state exactly: "That information is not available in the verified scheme data.".
- Keep response concise and structured using only relevant sections. Do not output empty sections.
- When source URL is unavailable, state: "Official source information is currently unavailable.".
- If profile is incomplete, do not guess; ask user to complete missing profile fields.
${languageDirective}`;
            const fullPrompt = [
                `USER_QUERY:\n${sanitizedPrompt}`,
                `REQUEST_CONTEXT:\n${JSON.stringify(redactedContext)}`,
                `VERIFIED_CONTEXT:\n${JSON.stringify(verifiedContext.promptPayload)}`,
            ].join('\n\n');
            const result = await this.geminiAdapter.generateText({
                prompt: fullPrompt,
                systemInstruction,
            });
            return { content: result.content, provider: result.provider };
        }, 24);
        return {
            content: cachedResult.content,
            provider: 'AI Copilot',
            isCached: cachedResult.isCached,
            sources: verifiedContext.sources,
        };
    }
    resolveUseCase(prompt, context) {
        const explicit = String(context?.useCase || '').toLowerCase().trim();
        if (explicit) {
            if (explicit.includes('eligible'))
                return 'eligible-schemes';
            if (explicit.includes('document'))
                return 'documents';
            if (explicit.includes('apply') || explicit.includes('application'))
                return 'application-steps';
            if (explicit.includes('missing') || explicit.includes('incomplete'))
                return 'missing-requirements';
            if (explicit.includes('explain') || explicit.includes('eligibility'))
                return 'eligibility-explanation';
        }
        const normalized = prompt.toLowerCase();
        if (/eligible schemes|eligible for|पात्र योजन|किन योजनाओं/.test(normalized))
            return 'eligible-schemes';
        if (/why.*eligible|why.*not eligible|पात्र क्यों|पात्र नहीं/.test(normalized))
            return 'eligibility-explanation';
        if (/document|दस्तावेज़|aadhaar|income certificate/.test(normalized))
            return 'documents';
        if (/how do i apply|application step|आवेदन कैसे/.test(normalized))
            return 'application-steps';
        if (/missing|incomplete profile|क्या कमी|अपूर्ण प्रोफ़ाइल/.test(normalized))
            return 'missing-requirements';
        if (/explain this scheme|scheme details|योजना समझाएं/.test(normalized))
            return 'scheme-explanation';
        return 'general';
    }
    formatEligibilityLabel(status, language) {
        const normalized = status || 'NEEDS_VERIFICATION';
        if (language === 'hi') {
            if (normalized === 'ELIGIBLE')
                return 'Eligible';
            if (normalized === 'NOT_ELIGIBLE')
                return 'Not eligible';
            if (normalized === 'INCOMPLETE_PROFILE')
                return 'Requires information';
            return 'Requires verification';
        }
        if (normalized === 'ELIGIBLE')
            return 'Eligible';
        if (normalized === 'NOT_ELIGIBLE')
            return 'Not eligible';
        if (normalized === 'INCOMPLETE_PROFILE')
            return 'Requires information';
        return 'Requires verification';
    }
    async buildVerifiedChatContext(input) {
        const { userId, redactedContext, language, useCase } = input;
        if (!userId) {
            const promptPayload = {
                useCase,
                language,
                note: language === 'hi'
                    ? 'उपयोगकर्ता प्रोफ़ाइल उपलब्ध नहीं है। केवल सामान्य सत्यापित योजना जानकारी का उपयोग करें।'
                    : 'Citizen profile is not available. Use only general verified scheme information.',
            };
            return {
                promptPayload,
                contextHash: (0, crypto_1.createHash)('sha256').update(JSON.stringify(promptPayload)).digest('hex').substring(0, 24),
                sources: ['Verified scheme information'],
            };
        }
        const profile = await this.prisma.client.citizenProfile.findUnique({
            where: { userId },
            include: {
                address: true,
                recommendations: {
                    include: {
                        scheme: {
                            include: {
                                requiredDocuments: true,
                                eligibilityRules: true,
                            },
                        },
                    },
                    orderBy: {
                        matchPercentage: 'desc',
                    },
                },
            },
        });
        const minimized = this.aiDataMinimizer.minimizeCitizenProfile(profile);
        const profileHash = this.aiDataMinimizer.computeProfileHash(minimized);
        const selectedSchemeId = String(redactedContext?.schemeId || '').trim();
        const selectedSchemeTitle = String(redactedContext?.schemeTitle || redactedContext?.schemeName || '').trim().toLowerCase();
        const selectedRecommendation = profile?.recommendations.find((rec) => {
            if (selectedSchemeId && rec.schemeId === selectedSchemeId)
                return true;
            if (selectedSchemeTitle && rec.scheme?.title?.toLowerCase().includes(selectedSchemeTitle))
                return true;
            return false;
        });
        const incompleteFields = new Set();
        for (const rec of profile?.recommendations || []) {
            for (const item of rec.missingCriteria || []) {
                if (item.startsWith('Missing profile data:')) {
                    incompleteFields.add(item.replace('Missing profile data:', '').trim());
                }
            }
        }
        const schemeForContext = selectedRecommendation?.scheme;
        const schemeDocuments = (schemeForContext?.requiredDocuments || [])
            .filter((doc) => doc.isMandatory)
            .map((doc) => doc.description || doc.documentType)
            .slice(0, 8);
        const schemeEligibilityRules = (schemeForContext?.eligibilityRules || [])
            .filter((rule) => rule.isRequired)
            .map((rule) => rule.description || `${rule.attributeKey} ${rule.operator} ${rule.targetValue}`)
            .slice(0, 12);
        const topRecommendations = (profile?.recommendations || []).slice(0, 6).map((rec) => ({
            schemeId: rec.schemeId,
            schemeTitle: rec.scheme?.title,
            department: rec.scheme?.department,
            eligibilityStatus: rec.isEligible
                ? 'ELIGIBLE'
                : (Array.isArray(rec.missingCriteria) ? rec.missingCriteria : []).some((item) => item.startsWith('Missing profile data:'))
                    ? 'INCOMPLETE_PROFILE'
                    : 'NOT_ELIGIBLE',
            statusReason: (Array.isArray(rec.missingCriteria) ? rec.missingCriteria[0] : undefined) || (Array.isArray(rec.criteriaMet) ? rec.criteriaMet[0] : undefined) || 'No additional details available',
            matchPercentage: rec.matchPercentage,
            missingCriteria: (Array.isArray(rec.missingCriteria) ? rec.missingCriteria : []).slice(0, 3),
            criteriaMet: (Array.isArray(rec.criteriaMet) ? rec.criteriaMet : []).slice(0, 3),
            officialSource: null,
        }));
        const citizenAttributes = {
            age: minimized?.age,
            socialCategory: minimized?.socialCategory,
            employmentStatus: minimized?.employmentStatus,
            annualIncomeTier: minimized?.annualIncomeTier,
            state: minimized?.state,
            district: minimized?.district,
            isRural: minimized?.isRural,
            isBplCardHolder: minimized?.isBplCardHolder,
            disabilityStatus: minimized?.disabilityStatus,
        };
        const promptPayload = {
            useCase,
            language,
            queryContext: {
                hasSchemeContext: Boolean(schemeForContext),
            },
        };
        if (useCase === 'eligible-schemes' || useCase === 'eligibility-explanation' || useCase === 'missing-requirements') {
            promptPayload.citizenAttributes = citizenAttributes;
            promptPayload.recommendations = topRecommendations;
        }
        if (useCase === 'documents' || useCase === 'application-steps' || useCase === 'scheme-explanation' || selectedRecommendation) {
            if (schemeForContext) {
                const selectedMissingCriteria = Array.isArray(selectedRecommendation?.missingCriteria)
                    ? selectedRecommendation.missingCriteria
                    : [];
                const selectedCriteriaMet = Array.isArray(selectedRecommendation?.criteriaMet)
                    ? selectedRecommendation.criteriaMet
                    : [];
                const selectedStatus = selectedRecommendation?.isEligible
                    ? 'ELIGIBLE'
                    : selectedMissingCriteria.some((item) => item.startsWith('Missing profile data:'))
                        ? 'INCOMPLETE_PROFILE'
                        : 'NOT_ELIGIBLE';
                promptPayload.schemeContext = {
                    schemeId: schemeForContext.id,
                    schemeTitle: schemeForContext.title,
                    department: schemeForContext.department,
                    category: schemeForContext.category,
                    description: schemeForContext.description,
                    eligibilityStatus: this.formatEligibilityLabel(selectedStatus, language),
                    criteriaMet: selectedCriteriaMet.slice(0, 4),
                    missingCriteria: selectedMissingCriteria.slice(0, 4),
                    requiredDocuments: schemeDocuments,
                    applicationSteps: schemeEligibilityRules,
                    officialSource: null,
                };
            }
            else {
                promptPayload.schemeContext = null;
            }
        }
        if (incompleteFields.size > 0) {
            promptPayload.profileCompleteness = {
                status: 'INCOMPLETE_PROFILE',
                missingRequiredFields: Array.from(incompleteFields),
            };
        }
        let deterministicResponse;
        if (!schemeForContext && (useCase === 'documents' || useCase === 'application-steps' || useCase === 'scheme-explanation')) {
            deterministicResponse = language === 'hi'
                ? '### सारांश\nकृपया पहले वह योजना चुनें जिसके बारे में आप मार्गदर्शन चाहते हैं।\n\n### महत्वपूर्ण जानकारी\nThat information is not available in the verified scheme data.'
                : '### Summary\nPlease select a specific scheme first so I can provide verified guidance.\n\n### Important Information\nThat information is not available in the verified scheme data.';
        }
        if (incompleteFields.size > 0 && useCase === 'missing-requirements') {
            const missingList = Array.from(incompleteFields).map((item) => `- ${item}`).join('\n');
            deterministicResponse = language === 'hi'
                ? `### सारांश\nआपकी प्रोफ़ाइल अभी अधूरी है, इसलिए सटीक योजना मार्गदर्शन सीमित है।\n\n### पात्रता\nRequires information\n\n### कारण\nइन अनिवार्य फ़ील्ड्स की जानकारी अनुपलब्ध है:\n${missingList}\n\n### महत्वपूर्ण जानकारी\nकृपया प्रोफ़ाइल पूरी करें और फिर दोबारा पूछें।`
                : `### Summary\nYour profile is incomplete, so accurate scheme guidance is limited.\n\n### Eligibility\nRequires information\n\n### Why\nThe following required profile fields are missing:\n${missingList}\n\n### Important Information\nPlease complete your profile and try again.`;
        }
        const contextHash = (0, crypto_1.createHash)('sha256')
            .update(`${profileHash}::${JSON.stringify(promptPayload)}`)
            .digest('hex')
            .substring(0, 24);
        const schemeRuleHash = schemeForContext
            ? (0, crypto_1.createHash)('sha256')
                .update(JSON.stringify({
                id: schemeForContext.id,
                title: schemeForContext.title,
                updatedAt: schemeForContext.updatedAt,
                docs: schemeDocuments,
                rules: schemeEligibilityRules,
            }))
                .digest('hex')
                .substring(0, 16)
            : undefined;
        return {
            promptPayload,
            contextHash,
            sources: schemeForContext
                ? ['Verified eligibility engine', 'Verified scheme information']
                : ['Verified eligibility engine', 'Verified citizen profile'],
            deterministicResponse,
            schemeId: schemeForContext?.id,
            schemeRuleHash,
        };
    }
    async explainRecommendation(schemeTitle, matchPercentage, criteriaMet, missingCriteria, language) {
        const isHindi = language === 'hi';
        const criteriaHash = (0, crypto_1.createHash)('sha256')
            .update(`${criteriaMet.sort().join(';')}|${missingCriteria.sort().join(';')}|${matchPercentage}`)
            .digest('hex')
            .substring(0, 16);
        const cacheKeyOptions = {
            useCase: 'explain',
            schemeId: schemeTitle.toLowerCase().replace(/\s+/g, '-'),
            minimizedProfileHash: criteriaHash,
            language: isHindi ? 'hi' : 'en',
            promptVersion: 'v2.0',
        };
        const cachedResult = await this.aiCache.getOrExecute(cacheKeyOptions, async () => {
            const prompt = isHindi
                ? `नागरिक को योजना '${schemeTitle}' के लिए ${matchPercentage}% मैच प्राप्त हुआ है।
संतुष्ट मानदंड: ${criteriaMet.length > 0 ? criteriaMet.join('; ') : 'सामान्य मानदंड'}
अपूर्ण आवश्यकताएं: ${missingCriteria.length > 0 ? missingCriteria.join('; ') : 'कोई नहीं'}
नागरिक को स्पष्ट और पेशेवर भाषा में समझाएं कि वे छूटी हुई आवश्यकताओं को कैसे पूरा कर सकते हैं। इमोजी का उपयोग न करें।`
                : `Explain why a citizen received a ${matchPercentage}% match for the scheme '${schemeTitle}'.
Criteria Satisfied: ${criteriaMet.length > 0 ? criteriaMet.join('; ') : 'General criteria'}
Missing Requirements: ${missingCriteria.length > 0 ? missingCriteria.join('; ') : 'None'}
Explain in clear, encouraging, natural language how they can fulfill missing criteria. Do not use emojis.`;
            const res = await this.geminiAdapter.generateText({ prompt });
            return { content: res.content, provider: res.provider };
        }, 24);
        return {
            explanation: cachedResult.content,
            isCached: cachedResult.isCached,
        };
    }
    async getSchemeInstructions(schemeTitle, schemeId, language) {
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
        const rules = scheme?.eligibilityRules?.map((r) => `${r.attributeKey}:${r.operator}:${r.targetValue}:${r.description}`) || [];
        const docs = scheme?.requiredDocuments?.map((d) => `${d.documentType}:${d.isMandatory}`) || [];
        const schemeRuleHash = (0, crypto_1.createHash)('sha256')
            .update([
            scheme?.title || schemeTitle,
            scheme?.department || '',
            scheme?.description || '',
            rules.sort().join('|'),
            docs.sort().join('|'),
            scheme?.updatedAt ? scheme.updatedAt.toISOString() : 'v1',
        ].join('::'))
            .digest('hex')
            .substring(0, 16);
        const cacheKeyOptions = {
            useCase: 'scheme-instructions',
            schemeId: scheme?.id || schemeTitle.toLowerCase().replace(/\s+/g, '-'),
            schemeRuleHash,
            minimizedProfileHash: 'static_scheme_guidance',
            language: language === 'hi' ? 'hi' : 'en',
            promptVersion: 'v2.0',
        };
        const cachedResult = await this.aiCache.getOrExecute(cacheKeyOptions, async () => {
            const text = await this.geminiAdapter.generateSchemeInstructions({
                schemeTitle: scheme?.title || schemeTitle,
                category: scheme?.category,
                department: scheme?.department,
                description: scheme?.description,
                eligibilityRules: rules,
            });
            return { content: text, provider: 'AI Copilot' };
        }, 48);
        return {
            instructions: cachedResult.content,
            applicationUrl,
            schemeTitle: scheme?.title || schemeTitle,
            isCached: cachedResult.isCached,
        };
    }
};
exports.AiService = AiService;
exports.AiService = AiService = AiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [gemini_ai_adapter_1.GeminiAiAdapter,
        ai_safety_service_1.AiSafetyService,
        ai_cache_service_1.AiCacheService,
        ai_data_minimizer_service_1.AiDataMinimizerService,
        prisma_service_1.PrismaService])
], AiService);
//# sourceMappingURL=ai.service.js.map