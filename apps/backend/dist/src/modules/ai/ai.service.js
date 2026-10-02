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
            promptVersion: 'v4.0',
            normalizedPrompt: `${useCase}::${sanitizedPrompt}`,
        };
        const cachedResult = await this.aiCache.getOrExecute(cacheKeyOptions, async () => {
            if (verifiedContext.deterministicResponse) {
                const sanitizedDeterministic = this.sanitizeAiResponse(verifiedContext.deterministicResponse);
                return { content: sanitizedDeterministic, provider: 'AI Copilot' };
            }
            const languageDirective = preferredLanguage === 'hi'
                ? `भाषा निर्देश (LANGUAGE DIRECTIVE - HINDI):
- आपको पूरी तरह से औपचारिक, सरल और शुद्ध हिंदी (देवनागरी लिपि) में उत्तर देना है।
- किसी भी स्थिति में अंग्रेजी पैराग्राफ या वाक्य न छोड़ें।
- योजनाओं के आधिकारिक नाम (जैसे PM-KISAN, Ayushman Bharat, UP Post-Matric Scholarship) को रोमन या देवनागरी में रख सकते हैं।
- आवश्यकतानुसार केवल इन मानक हिंदी शीर्षकों का प्रयोग करें:
  ### सारांश
  ### पात्रता स्थिति
  ### आप पात्र क्यों हैं / अपात्रता के कारण
  ### आवश्यक दस्तावेज़
  ### आवेदन प्रक्रिया
  ### महत्वपूर्ण जानकारी
  ### आधिकारिक स्रोत`
                : `LANGUAGE DIRECTIVE (ENGLISH):
- Respond entirely in concise, professional, grammatically correct, citizen-friendly English.
- Use the following standard section headings when relevant:
  ### Summary
  ### Eligibility Status
  ### Why You Qualify / Ineligibility Reasons
  ### Required Documents
  ### Application Steps
  ### Important Information
  ### Official Source`;
            const systemInstruction = `You are AI Citizen Copilot, a citizen welfare assistance service for BenefitOS.
Your purpose is to provide truthful, concise, professional, and citizen-friendly explanations of verified government welfare schemes.

CRITICAL RULES (ABSOLUTE MANDATES):
1. DETERMINISTIC SOURCE OF TRUTH:
   - Deterministic backend eligibility results provided in VERIFIED_CONTEXT are the ONLY source of truth.
   - NEVER calculate, override, or invent eligibility.
   - If VERIFIED_CONTEXT indicates a citizen is ELIGIBLE, explain why using ONLY the verified satisfied criteria.
   - If VERIFIED_CONTEXT indicates NOT_ELIGIBLE, clearly explain the verified missing or failed conditions.
   - If VERIFIED_CONTEXT indicates INCOMPLETE_PROFILE, clearly list the required profile fields that are missing.
   - When asked "What schemes can I apply for?" or "Which schemes am I eligible for?", you MUST ONLY recommend schemes explicitly listed in "eligibleSchemes". You must NEVER present schemes from "ineligibleSchemes" or "incompleteSchemes" as eligible. If "eligibleSchemes" is empty, clearly state that based on the verified profile, the citizen is not currently eligible for any scheme.

2. TRUTHFULNESS & ZERO FABRICATION:
   - Only state facts provided in VERIFIED_CONTEXT.
   - Never invent income thresholds, age rules, caste rules, benefits, document requirements, deadlines, portals, or departments.
   - Never claim a document is verified unless verified status is provided.
   - Never claim an application has been submitted to a government authority or portal unless that action is confirmed in the context.
   - If information (such as official application URL or specific procedure) is not in VERIFIED_CONTEXT, explicitly state: "Official information for this detail is not currently available in the verified scheme data."

3. PROFESSIONAL TONE & STYLE:
   - Concise, respectful, objective, and citizen-friendly.
   - NEVER use emojis under any circumstances.
   - NEVER use conversational filler or excessive enthusiasm (e.g., "Great!", "Awesome!", "Congratulations!", "Sure!", "Absolutely!").
   - Use clean Markdown: headings (###), bold text for key terms, and bullet points or numbered lists.
   - Avoid long dense walls of text. Keep explanations direct and complete.

4. ZERO INTERNAL TERMINOLOGY LEAKAGE:
   - NEVER mention Gemini, Google AI, LLM, model, prompt, token, Redis, Prisma, PostgreSQL, database, backend, frontend, WebSocket, HTTP, API, JWT, rules engine, data minimization, UUID, or internal system IDs.
   - Always speak as a citizen-facing welfare assistant.

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
            const sanitizedContent = this.sanitizeAiResponse(result.content);
            return { content: sanitizedContent, provider: result.provider };
        }, 24);
        return {
            content: cachedResult.content,
            provider: 'AI Copilot',
            isCached: cachedResult.isCached,
            sources: verifiedContext.sources,
        };
    }
    sanitizeAiResponse(text) {
        if (!text)
            return '';
        let sanitized = text;
        sanitized = sanitized.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1FA70}-\u{1FAFF}]/gu, '');
        const technicalReplacements = [
            [/\b(Gemini|Google GenAI|Google Gemini|OpenAI|ChatGPT|Claude)\b/gi, 'BenefitOS Copilot'],
            [/\b(Large Language Model|LLM)\b/gi, 'guidance service'],
            [/\b(Redis|PostgreSQL|Postgres|Prisma)\b/gi, 'system'],
            [/\b(backend database|backend server|backend engine|backend API|REST API|API endpoint|backend|database|RESTful API)\b/gi, 'verified records'],
            [/\b(WebSocket|HTTP fallback)\b/gi, 'connection'],
            [/\b(system prompt|prompt injection|prompt payload|system instruction)\b/gi, 'inquiry'],
            [/\b(data minimization|rules engine|eligibility engine)\b/gi, 'eligibility verification service'],
            [/\b([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\b/gi, '[ID]'],
        ];
        for (const [regex, replacement] of technicalReplacements) {
            sanitized = sanitized.replace(regex, replacement);
        }
        sanitized = sanitized.replace(/[ \t]{2,}/g, ' ').replace(/\n{3,}/g, '\n\n');
        return sanitized.trim();
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
        if (/eligible schemes|eligible for|which schemes|what schemes|पात्र योजन|किन योजनाओं|योजनाओं के लिए पात्र/.test(normalized))
            return 'eligible-schemes';
        if (/why.*eligible|why.*not eligible|पात्र क्यों|पात्र नहीं|कारण/.test(normalized))
            return 'eligibility-explanation';
        if (/document|दस्तावेज़|कागज़ात|aadhaar|income certificate/.test(normalized))
            return 'documents';
        if (/how do i apply|how to apply|application step|application process|आवेदन कैसे|आवेदन प्रक्रिया/.test(normalized))
            return 'application-steps';
        if (/missing|incomplete profile|क्या कमी|अपूर्ण प्रोफ़ाइल|अधूरी जानकारी/.test(normalized))
            return 'missing-requirements';
        if (/explain this scheme|scheme details|योजना समझाएं|योजना के बारे में/.test(normalized))
            return 'scheme-explanation';
        return 'general';
    }
    formatEligibilityLabel(status, language) {
        const normalized = status || 'NEEDS_VERIFICATION';
        if (language === 'hi') {
            if (normalized === 'ELIGIBLE')
                return 'पात्र (Eligible)';
            if (normalized === 'NOT_ELIGIBLE')
                return 'अपात्र (Not eligible)';
            if (normalized === 'INCOMPLETE_PROFILE')
                return 'अधूरी जानकारी (Requires information)';
            return 'सत्यापन आवश्यक (Requires verification)';
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
        const { userId, sanitizedPrompt, redactedContext, language, useCase } = input;
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
        let selectedRecommendation = profile?.recommendations.find((rec) => {
            if (selectedSchemeId && rec.schemeId === selectedSchemeId)
                return true;
            if (selectedSchemeTitle && rec.scheme?.title?.toLowerCase().includes(selectedSchemeTitle))
                return true;
            return false;
        });
        if (!selectedRecommendation && sanitizedPrompt) {
            const lowerPrompt = sanitizedPrompt.toLowerCase();
            selectedRecommendation = profile?.recommendations.find((rec) => {
                const title = (rec.scheme?.title || '').toLowerCase();
                const code = (rec.scheme?.code || '').toLowerCase();
                return (title && lowerPrompt.includes(title)) || (code && lowerPrompt.includes(code));
            });
        }
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
        const allRecommendations = profile?.recommendations || [];
        const eligibleSchemes = allRecommendations
            .filter((rec) => rec.isEligible === true)
            .map((rec) => ({
            schemeId: rec.schemeId,
            schemeTitle: rec.scheme?.title,
            department: rec.scheme?.department,
            category: rec.scheme?.category,
            eligibilityStatus: 'ELIGIBLE',
            benefit: rec.scheme?.description,
            matchPercentage: rec.matchPercentage,
            satisfiedCriteria: Array.isArray(rec.criteriaMet) ? rec.criteriaMet.slice(0, 5) : [],
            requiredDocuments: (rec.scheme?.requiredDocuments || [])
                .filter((d) => d.isMandatory)
                .map((d) => d.description || d.documentType)
                .slice(0, 6),
        }));
        const ineligibleSchemes = allRecommendations
            .filter((rec) => rec.isEligible === false && !(rec.missingCriteria || []).some((item) => item.startsWith('Missing profile data:')))
            .map((rec) => ({
            schemeId: rec.schemeId,
            schemeTitle: rec.scheme?.title,
            department: rec.scheme?.department,
            eligibilityStatus: 'NOT_ELIGIBLE',
            reasonsNotEligible: (rec.missingCriteria || []).slice(0, 4),
            criteriaMet: (rec.criteriaMet || []).slice(0, 3),
        }));
        const incompleteSchemes = allRecommendations
            .filter((rec) => (rec.missingCriteria || []).some((item) => item.startsWith('Missing profile data:')))
            .map((rec) => ({
            schemeId: rec.schemeId,
            schemeTitle: rec.scheme?.title,
            department: rec.scheme?.department,
            eligibilityStatus: 'INCOMPLETE_PROFILE',
            missingRequiredFields: (rec.missingCriteria || [])
                .filter((item) => item.startsWith('Missing profile data:'))
                .map((item) => item.replace('Missing profile data:', '').trim()),
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
        if (minimized) {
            promptPayload.citizenAttributes = citizenAttributes;
            promptPayload.eligibleSchemes = eligibleSchemes;
            promptPayload.ineligibleSchemes = ineligibleSchemes;
            promptPayload.incompleteSchemes = incompleteSchemes;
            if (useCase === 'eligible-schemes') {
                promptPayload.schemeRecommendationRule =
                    'CRITICAL: Only list schemes from "eligibleSchemes". Never recommend schemes from "ineligibleSchemes" or "incompleteSchemes". If "eligibleSchemes" is empty, state clearly that no schemes are currently eligible based on verified profile data.';
            }
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
                    criteriaMet: selectedCriteriaMet.slice(0, 5),
                    missingCriteria: selectedMissingCriteria.slice(0, 5),
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
                ? '### सारांश\nकृपया पहले वह योजना चुनें जिसके बारे में आप मार्गदर्शन चाहते हैं।\n\n### महत्वपूर्ण जानकारी\nयह जानकारी सत्यापित योजना डेटा में उपलब्ध नहीं है।'
                : '### Summary\nPlease select a specific scheme first so I can provide verified guidance.\n\n### Important Information\nOfficial information for this detail is not currently available in the verified scheme data.';
        }
        if (incompleteFields.size > 0 && useCase === 'missing-requirements') {
            const missingList = Array.from(incompleteFields).map((item) => `- ${item}`).join('\n');
            deterministicResponse = language === 'hi'
                ? `### सारांश\nआपकी प्रोफ़ाइल अभी अधूरी है, इसलिए सटीक योजना मार्गदर्शन सीमित है।\n\n### पात्रता स्थिति\nअधूरी जानकारी (Requires information)\n\n### अपूर्ण आवश्यकताएं\nइन अनिवार्य फ़ील्ड्स की जानकारी प्रोफ़ाइल में दर्ज नहीं है:\n${missingList}\n\n### महत्वपूर्ण जानकारी\nकृपया अपनी प्रोफ़ाइल पूरी करें ताकि सटीक पात्रता का मूल्यांकन किया जा सके।`
                : `### Summary\nYour profile is incomplete, so accurate scheme guidance is limited.\n\n### Eligibility Status\nRequires information\n\n### Missing Requirements\nThe following required profile fields are missing:\n${missingList}\n\n### Important Information\nPlease complete your profile so the eligibility service can evaluate all conditions.`;
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
            promptVersion: 'v3.0',
        };
        const cachedResult = await this.aiCache.getOrExecute(cacheKeyOptions, async () => {
            const languageDirective = isHindi
                ? 'उत्तर पूरी तरह से शुद्ध और औपचारिक हिंदी (देवनागरी लिपि) में दें। किसी भी स्थिति में इमोजी या अप्रासंगिक तकनीकी शब्दों का प्रयोग न करें।'
                : 'Respond in clear, professional, concise English. Never use emojis or internal technical terms.';
            const prompt = isHindi
                ? `नागरिक को योजना '${schemeTitle}' के लिए ${matchPercentage}% मैच प्राप्त हुआ है।
संतुष्ट मानदंड: ${criteriaMet.length > 0 ? criteriaMet.join('; ') : 'सामान्य मानदंड'}
अपूर्ण आवश्यकताएं: ${missingCriteria.length > 0 ? missingCriteria.join('; ') : 'कोई नहीं'}
नागरिक को स्पष्ट और पेशेवर भाषा में समझाएं कि वे छूटी हुई आवश्यकताओं को कैसे पूरा कर सकते हैं।`
                : `Explain why a citizen received a ${matchPercentage}% match for the scheme '${schemeTitle}'.
Criteria Satisfied: ${criteriaMet.length > 0 ? criteriaMet.join('; ') : 'General criteria'}
Missing Requirements: ${missingCriteria.length > 0 ? missingCriteria.join('; ') : 'None'}
Explain in clear, professional, natural language how they can fulfill missing criteria.`;
            const res = await this.geminiAdapter.generateText({
                prompt,
                systemInstruction: `You are AI Citizen Copilot. Provide accurate, professional citizen guidance based strictly on the supplied criteria.\n${languageDirective}`,
            });
            const sanitized = this.sanitizeAiResponse(res.content);
            return { content: sanitized, provider: res.provider };
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
        const isHindi = language === 'hi';
        const cacheKeyOptions = {
            useCase: 'scheme-instructions',
            schemeId: scheme?.id || schemeTitle.toLowerCase().replace(/\s+/g, '-'),
            schemeRuleHash,
            minimizedProfileHash: 'static_scheme_guidance',
            language: isHindi ? 'hi' : 'en',
            promptVersion: 'v3.0',
        };
        const cachedResult = await this.aiCache.getOrExecute(cacheKeyOptions, async () => {
            const text = await this.geminiAdapter.generateSchemeInstructions({
                schemeTitle: scheme?.title || schemeTitle,
                category: scheme?.category,
                department: scheme?.department,
                description: scheme?.description,
                eligibilityRules: rules,
            });
            const sanitized = this.sanitizeAiResponse(text);
            return { content: sanitized, provider: 'AI Copilot' };
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