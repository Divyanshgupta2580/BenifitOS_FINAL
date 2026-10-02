import { Injectable, Logger } from '@nestjs/common';
import { GeminiAiAdapter } from '../../infrastructure/ai/gemini-ai.adapter';
import { AiSafetyService } from '../../infrastructure/ai/ai-safety.service';
import { AiCacheService } from '../../infrastructure/ai/ai-cache.service';
import { AiDataMinimizerService } from '../../infrastructure/ai/ai-data-minimizer.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { createHash } from 'crypto';

type GuidanceUseCase =
  | 'eligible-schemes'
  | 'eligibility-explanation'
  | 'documents'
  | 'application-steps'
  | 'scheme-explanation'
  | 'missing-requirements'
  | 'general';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly geminiAdapter: GeminiAiAdapter,
    private readonly aiSafety: AiSafetyService,
    private readonly aiCache: AiCacheService,
    private readonly aiDataMinimizer: AiDataMinimizerService,
    private readonly prisma: PrismaService,
  ) {}

  async chat(
    prompt: string,
    context?: Record<string, any>,
    userId?: string,
    language?: string,
  ): Promise<{ content: string; provider: string; isCached?: boolean; sources?: string[] }> {
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
      useCase: 'chat' as const,
      userId,
      schemeId: verifiedContext.schemeId,
      schemeRuleHash: verifiedContext.schemeRuleHash,
      minimizedProfileHash: verifiedContext.contextHash,
      language: preferredLanguage,
      promptVersion: 'v5.0',
      normalizedPrompt: `${useCase}::${sanitizedPrompt}`,
    };

    const cachedResult = await this.aiCache.getOrExecute(
      cacheKeyOptions,
      async () => {
        if (verifiedContext.deterministicResponse) {
          const sanitizedDeterministic = this.sanitizeAiResponse(verifiedContext.deterministicResponse);
          return { content: sanitizedDeterministic, provider: 'AI Copilot' };
        }

        const languageDirective = preferredLanguage === 'hi'
          ? `भाषा निर्देश (HINDI DIRECTIVE):
- आपको पूरी तरह से सरल, स्पष्ट, स्वाभाविक और शुद्ध हिंदी (देवनागरी लिपि) में उत्तर देना है।
- अत्यधिक कठिन या संस्कृतनिष्ठ शब्दों से बचें। सामान्य नागरिकों के लिए आसान और स्वाभाविक भाषा का प्रयोग करें।
- किसी भी स्थिति में अंग्रेजी पैराग्राफ या वाक्य न छोड़ें।
- आधिकारिक योजना नामों (जैसे PM-KISAN, PMAY-G, UP Post-Matric Scholarship, Ayushman Bharat) को उनके सामान्य रूप में रखें।
- संक्षिप्त और प्रत्यक्ष उत्तर दें (लगभग 80–180 शब्द)।
- प्रश्न के अनुसार उपयुक्त शीर्षकों का प्रयोग करें:
  ## पात्रता
  **पात्र** / **अपात्र** / **अधूरी जानकारी**
  ### कारण
  ### आवश्यक दस्तावेज़
  ### पात्र योजनाएँ
  ### आवेदन स्थिति
  ### आगे क्या करें`
          : `LANGUAGE DIRECTIVE (ENGLISH):
- Respond in concise, professional, clear, citizen-friendly English.
- Target approximately 80–180 words for standard questions.
- Answer the user's specific question directly in the very first section.
- Use clean Markdown with question-specific headings:
  ## Eligibility
  **Eligible** / **Not eligible** / **Requires information**
  ### Why
  ### Required documents
  ### Eligible schemes
  ### Application status
  ### Next steps
- Avoid repeating the user's question or dumping unrequested scheme history.`;

        const systemInstruction = `You are AI Citizen Copilot, a trusted digital welfare assistance service for BenefitOS.
Your goal is to provide concise, direct, citizen-friendly, and factually grounded guidance for verified government welfare schemes.

CRITICAL INSTRUCTIONS:

1. BREVITY, CLARITY & CONCISENESS (PRIMARY MANDATE):
   - Answer the citizen's question DIRECTLY in the opening lines.
   - Target length: approximately 80–180 words for normal questions.
   - Use 3–6 concise bullet points when listing reasons or criteria.
   - Use 3–5 numbered steps when describing procedures.
   - Use short, readable paragraphs. Avoid long essays, filler, or scheme backstories.
   - Follow this strict priority:
     1. Answer the user's question directly.
     2. Give the most relevant verified facts.
     3. Give the next useful action, if applicable.
     4. Stop.

2. QUESTION-SPECIFIC RESPONSE STRUCTURES (DO NOT FORCE A SINGLE LARGE TEMPLATE):
   - Eligibility Inquiries (e.g., "Am I eligible for PM-KISAN?", "Why am I eligible?"):
     Start with "## Eligibility" (or "## पात्रता"), state "**Eligible**" / "**Not eligible**" (or "**पात्र**" / "**अपात्र**"), summarize why in 2–4 concise bullet points under "### Why" (or "### कारण"), and list key documents if relevant.
   - Document Inquiries (e.g., "What documents do I need?"):
     Start with "## Required documents" (or "## आवश्यक दस्तावेज़") followed by a concise numbered list of verified documents from VERIFIED_CONTEXT. Do not explain unrelated scheme mechanics.
   - Scheme Recommendations (e.g., "What schemes can I apply for?"):
     Start with "## Eligible schemes" (or "## पात्र योजनाएँ") listing ONLY schemes evaluated as eligible (isEligible = true). Provide a 1-sentence summary. Never recommend ineligible or incomplete schemes as eligible.
   - Application Status Inquiries (e.g., "Has my application been submitted?"):
     Start with "## Application status" (or "## आवेदन स्थिति"). State the exact verified record status directly. Never claim government submission unless confirmed.
   - Profile Missing Data Inquiries:
     List the exact missing fields concisely under "## Profile status" and advise updating the profile.

3. ZERO AI FLUFF & ZERO EMOJIS:
   - NEVER use conversational filler: "Certainly!", "Of course!", "Great question!", "Great news!", "I would be happy to...", "Let me explain...", "Here is a detailed explanation...", "I hope this helps!". Start immediately with the useful information.
   - NEVER use emojis of any kind. Use Markdown headings (##, ###), bold text (**), bullet points (-), and numbered lists (1.) instead.

4. DETERMINISTIC SOURCE OF TRUTH & ZERO HALLUCINATION:
   - Backend rules engine results in VERIFIED_CONTEXT are the ONLY source of truth.
   - Never invent criteria, benefits, documents, portals, or application statuses.
   - If specific details (such as room numbers or unlisted links) are absent, explicitly state: "Official information for this detail is not currently available in verified scheme records."

5. ZERO INTERNAL TECHNICAL TERMINOLOGY:
   - NEVER mention Gemini, Google AI, LLM, model, prompt, token, Redis, Prisma, PostgreSQL, database, backend, frontend, WebSocket, HTTP fallback, API, JWT, rules engine, data minimization, UUID, or internal system IDs.
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
      },
      24,
    );

    return {
      content: cachedResult.content,
      provider: 'AI Copilot',
      isCached: cachedResult.isCached,
      sources: verifiedContext.sources,
    };
  }

  public sanitizeAiResponse(text: string): string {
    if (!text) return '';
    let sanitized = text;

    // 1. Remove all emojis
    sanitized = sanitized.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1FA70}-\u{1FAFF}]/gu, '');

    // 2. Defensively replace internal technical/provider terminology if any slipped through
    const technicalReplacements: Array<[RegExp, string]> = [
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

    // 3. Clean up extra spaces
    sanitized = sanitized.replace(/[ \t]{2,}/g, ' ').replace(/\n{3,}/g, '\n\n');

    return sanitized.trim();
  }

  private resolveUseCase(prompt: string, context?: Record<string, any>): GuidanceUseCase {
    const explicit = String(context?.useCase || '').toLowerCase().trim();
    if (explicit) {
      if (explicit.includes('eligible')) return 'eligible-schemes';
      if (explicit.includes('document')) return 'documents';
      if (explicit.includes('apply') || explicit.includes('application')) return 'application-steps';
      if (explicit.includes('missing') || explicit.includes('incomplete')) return 'missing-requirements';
      if (explicit.includes('explain') || explicit.includes('eligibility')) return 'eligibility-explanation';
    }

    const normalized = prompt.toLowerCase();
    if (/future scheme|eligible.*year|when.*eligible|age.*eligible|भविष्य|अगले साल|किन योजनाओं.*भविष्य|पात्र कब/.test(normalized)) return 'eligible-schemes';
    if (/eligible schemes|eligible for|which schemes|what schemes|पात्र योजन|किन योजनाओं|योजनाओं के लिए पात्र/.test(normalized)) return 'eligible-schemes';
    if (/why.*eligible|why.*not eligible|पात्र क्यों|पात्र नहीं|कारण/.test(normalized)) return 'eligibility-explanation';
    if (/document|दस्तावेज़|कागज़ात|aadhaar|income certificate/.test(normalized)) return 'documents';
    if (/how do i apply|how to apply|application step|application process|आवेदन कैसे|आवेदन प्रक्रिया/.test(normalized)) return 'application-steps';
    if (/missing|incomplete profile|क्या कमी|अपूर्ण प्रोफ़ाइल|अधूरी जानकारी/.test(normalized)) return 'missing-requirements';
    if (/explain this scheme|scheme details|योजना समझाएं|योजना के बारे में/.test(normalized)) return 'scheme-explanation';
    return 'general';
  }

  private formatEligibilityLabel(status: string | undefined, language: 'en' | 'hi'): string {
    const normalized = status || 'NEEDS_VERIFICATION';
    if (language === 'hi') {
      if (normalized === 'ELIGIBLE') return 'पात्र (Eligible)';
      if (normalized === 'NOT_ELIGIBLE') return 'अपात्र (Not eligible)';
      if (normalized === 'INCOMPLETE_PROFILE') return 'अधूरी जानकारी (Requires information)';
      return 'सत्यापन आवश्यक (Requires verification)';
    }
    if (normalized === 'ELIGIBLE') return 'Eligible';
    if (normalized === 'NOT_ELIGIBLE') return 'Not eligible';
    if (normalized === 'INCOMPLETE_PROFILE') return 'Requires information';
    return 'Requires verification';
  }

  private async buildVerifiedChatContext(input: {
    userId?: string;
    sanitizedPrompt: string;
    redactedContext: Record<string, any>;
    language: 'en' | 'hi';
    useCase: GuidanceUseCase;
  }): Promise<{
    promptPayload: Record<string, any>;
    contextHash: string;
    sources: string[];
    deterministicResponse?: string;
    schemeId?: string;
    schemeRuleHash?: string;
  }> {
    const { userId, sanitizedPrompt, redactedContext, language, useCase } = input;

    if (!userId) {
      const promptPayload = {
        useCase,
        language,
        note:
          language === 'hi'
            ? 'उपयोगकर्ता प्रोफ़ाइल उपलब्ध नहीं है। केवल सामान्य सत्यापित योजना जानकारी का उपयोग करें।'
            : 'Citizen profile is not available. Use only general verified scheme information.',
      };
      return {
        promptPayload,
        contextHash: createHash('sha256').update(JSON.stringify(promptPayload)).digest('hex').substring(0, 24),
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

    let selectedRecommendation = profile?.recommendations.find((rec: any) => {
      if (selectedSchemeId && rec.schemeId === selectedSchemeId) return true;
      if (selectedSchemeTitle && rec.scheme?.title?.toLowerCase().includes(selectedSchemeTitle)) return true;
      return false;
    });

    // If no scheme in context, search prompt for mentioned scheme title or code
    if (!selectedRecommendation && sanitizedPrompt) {
      const lowerPrompt = sanitizedPrompt.toLowerCase();
      selectedRecommendation = profile?.recommendations.find((rec: any) => {
        const title = (rec.scheme?.title || '').toLowerCase();
        const code = (rec.scheme?.code || '').toLowerCase();
        return (title && lowerPrompt.includes(title)) || (code && lowerPrompt.includes(code));
      });
    }

    const incompleteFields = new Set<string>();
    for (const rec of profile?.recommendations || []) {
      for (const item of rec.missingCriteria || []) {
        if (item.startsWith('Missing profile data:')) {
          incompleteFields.add(item.replace('Missing profile data:', '').trim());
        }
      }
    }

    const schemeForContext = selectedRecommendation?.scheme;
    const schemeDocuments = (schemeForContext?.requiredDocuments || [])
      .filter((doc: any) => doc.isMandatory)
      .map((doc: any) => doc.description || doc.documentType)
      .slice(0, 8);

    const schemeEligibilityRules = (schemeForContext?.eligibilityRules || [])
      .filter((rule: any) => rule.isRequired)
      .map((rule: any) => rule.description || `${rule.attributeKey} ${rule.operator} ${rule.targetValue}`)
      .slice(0, 12);

    const allRecommendations = profile?.recommendations || [];

    const eligibleSchemes = allRecommendations
      .filter((rec: any) => rec.isEligible === true)
      .map((rec: any) => ({
        schemeId: rec.schemeId,
        schemeTitle: rec.scheme?.title,
        department: rec.scheme?.department,
        category: rec.scheme?.category,
        eligibilityStatus: 'ELIGIBLE',
        eligibilityTiming: 'NOW',
        yearsUntilEligible: 0,
        benefit: rec.scheme?.description,
        matchPercentage: rec.matchPercentage,
        satisfiedCriteria: Array.isArray(rec.criteriaMet) ? rec.criteriaMet.slice(0, 5) : [],
        requiredDocuments: (rec.scheme?.requiredDocuments || [])
          .filter((d: any) => d.isMandatory)
          .map((d: any) => d.description || d.documentType)
          .slice(0, 6),
      }));

    // Evaluate future eligibility for all active schemes
    const futureEligibleSchemes: Array<{
      schemeId: string;
      schemeTitle: string;
      department: string;
      category: string;
      eligibilityStatus: string;
      eligibilityTiming: string;
      yearsUntilEligible: number;
      benefit: string;
      futureCondition: string;
    }> = [];

    const citizenEntity = profile ? new (await import('../../domain/citizen/citizen.entity')).CitizenEntity({
      id: profile.id,
      userId: profile.userId,
      firstName: profile.firstName,
      lastName: profile.lastName,
      dateOfBirth: profile.dateOfBirth,
      gender: profile.gender as any,
      maritalStatus: profile.maritalStatus as any,
      socialCategory: profile.socialCategory as any,
      employmentStatus: profile.employmentStatus as any,
      annualIncomeINR: profile.annualIncomeINR,
      disabilityType: profile.disabilityType as any,
      disabilityPercent: profile.disabilityPercent,
      isBplCardHolder: profile.isBplCardHolder,
      bplCardNumber: profile.bplCardNumber,
      aadhaarHash: profile.aadhaarHash,
      panHash: profile.panHash,
      address: profile.address as any,
    }) : null;

    const evaluatorService = new (await import('../recommendation/services/eligibility-evaluator.service')).EligibilityEvaluatorService();

    for (const rec of allRecommendations) {
      if (rec.scheme && citizenEntity && !rec.isEligible) {
        const schemeEntity = new (await import('../../domain/welfare/scheme.entity')).WelfareSchemeEntity({
          id: rec.scheme.id,
          code: rec.scheme.code,
          title: rec.scheme.title,
          description: rec.scheme.description,
          category: rec.scheme.category as any,
          department: rec.scheme.department,
          state: rec.scheme.state,
          isCentralScheme: rec.scheme.isCentralScheme,
          financialBenefit: rec.scheme.financialBenefit,
          isActive: rec.scheme.isActive,
          eligibilityRules: (rec.scheme.eligibilityRules || []).map((r: any) => ({
            id: r.id,
            attributeKey: r.attributeKey,
            operator: r.operator,
            targetValue: r.targetValue,
            isRequired: r.isRequired,
            description: r.description,
          })),
          requiredDocuments: (rec.scheme.requiredDocuments || []).map((d: any) => d.documentType),
        });

        const evalResult = evaluatorService.evaluateDetailedEligibility(citizenEntity, schemeEntity);
        if (evalResult.eligibilityStatus === 'FUTURE_ELIGIBLE' && evalResult.yearsUntilEligible) {
          futureEligibleSchemes.push({
            schemeId: rec.scheme.id,
            schemeTitle: rec.scheme.title,
            department: rec.scheme.department,
            category: rec.scheme.category,
            eligibilityStatus: 'FUTURE_ELIGIBLE',
            eligibilityTiming: evalResult.eligibilityTiming,
            yearsUntilEligible: evalResult.yearsUntilEligible,
            benefit: rec.scheme.description,
            futureCondition: evalResult.statusReason,
          });
        }
      }
    }

    const ineligibleSchemes = allRecommendations
      .filter((rec: any) => rec.isEligible === false && !(rec.missingCriteria || []).some((item: string) => item.startsWith('Missing profile data:')))
      .map((rec: any) => ({
        schemeId: rec.schemeId,
        schemeTitle: rec.scheme?.title,
        department: rec.scheme?.department,
        eligibilityStatus: 'NOT_ELIGIBLE',
        reasonsNotEligible: (rec.missingCriteria || []).slice(0, 4),
        criteriaMet: (rec.criteriaMet || []).slice(0, 3),
      }));

    const incompleteSchemes = allRecommendations
      .filter((rec: any) => (rec.missingCriteria || []).some((item: string) => item.startsWith('Missing profile data:')))
      .map((rec: any) => ({
        schemeId: rec.schemeId,
        schemeTitle: rec.scheme?.title,
        department: rec.scheme?.department,
        eligibilityStatus: 'INCOMPLETE_PROFILE',
        missingRequiredFields: (rec.missingCriteria || [])
          .filter((item: string) => item.startsWith('Missing profile data:'))
          .map((item: string) => item.replace('Missing profile data:', '').trim()),
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

    const promptPayload: Record<string, any> = {
      useCase,
      language,
      queryContext: {
        hasSchemeContext: Boolean(schemeForContext),
      },
    };

    if (minimized) {
      promptPayload.citizenAttributes = citizenAttributes;
      promptPayload.eligibleSchemes = eligibleSchemes;
      promptPayload.futureEligibleSchemes = futureEligibleSchemes;
      promptPayload.ineligibleSchemes = ineligibleSchemes;
      promptPayload.incompleteSchemes = incompleteSchemes;

      if (useCase === 'eligible-schemes') {
        promptPayload.schemeRecommendationRule =
          'CRITICAL: Only list schemes from "eligibleSchemes" as currently eligible. If the user asks about future eligibility or age eligibility, summarize schemes from "futureEligibleSchemes" with their respective timeline (1 year, 2 years, or 3 years). Never recommend schemes from "ineligibleSchemes" or "incompleteSchemes".';
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
          : selectedMissingCriteria.some((item: string) => item.startsWith('Missing profile data:'))
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
      } else {
        promptPayload.schemeContext = null;
      }
    }

    if (incompleteFields.size > 0) {
      promptPayload.profileCompleteness = {
        status: 'INCOMPLETE_PROFILE',
        missingRequiredFields: Array.from(incompleteFields),
      };
    }

    let deterministicResponse: string | undefined;
    if (!schemeForContext && (useCase === 'documents' || useCase === 'application-steps' || useCase === 'scheme-explanation')) {
      deterministicResponse = language === 'hi'
        ? '## आवश्यक जानकारी\n\nकृपया पहले वह योजना चुनें जिसके बारे में आप जानकारी चाहते हैं।\n\n### आगे क्या करें\nविशिष्ट योजना का चयन करने पर ही सत्यापित दस्तावेज़ और आवेदन प्रक्रिया देखी जा सकती है।'
        : '## Scheme selection required\n\nPlease select a specific scheme first to view verified guidance.\n\n### Next steps\nSelect a scheme from your dashboard or scheme catalog to view required documents and application steps.';
    }

    if (incompleteFields.size > 0 && useCase === 'missing-requirements') {
      const missingList = Array.from(incompleteFields).map((item) => `- ${item}`).join('\n');
      deterministicResponse = language === 'hi'
        ? `## प्रोफ़ाइल स्थिति\n\n**अधूरी जानकारी**\n\nआपकी प्रोफ़ाइल में निम्नलिखित जानकारी दर्ज नहीं है:\n${missingList}\n\n### आगे क्या करें\nकृपया अपनी प्रोफ़ाइल पूरी करें ताकि पात्रता का सटीक मूल्यांकन हो सके।`
        : `## Profile status\n\n**Requires information**\n\nThe following required profile fields are missing:\n${missingList}\n\n### Next steps\nPlease complete your profile so the eligibility service can evaluate all conditions.`;
    }

    const contextHash = createHash('sha256')
      .update(`${profileHash}::${JSON.stringify(promptPayload)}`)
      .digest('hex')
      .substring(0, 24);

    const schemeRuleHash = schemeForContext
      ? createHash('sha256')
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

  async explainRecommendation(
    schemeTitle: string,
    matchPercentage: number,
    criteriaMet: string[],
    missingCriteria: string[],
    language?: string,
  ): Promise<{ explanation: string; isCached?: boolean }> {
    const isHindi = language === 'hi';
    const criteriaHash = createHash('sha256')
      .update(`${criteriaMet.sort().join(';')}|${missingCriteria.sort().join(';')}|${matchPercentage}`)
      .digest('hex')
      .substring(0, 16);

    const cacheKeyOptions = {
      useCase: 'explain' as const,
      schemeId: schemeTitle.toLowerCase().replace(/\s+/g, '-'),
      minimizedProfileHash: criteriaHash,
      language: isHindi ? 'hi' : 'en',
      promptVersion: 'v3.0',
    };

    const cachedResult = await this.aiCache.getOrExecute(
      cacheKeyOptions,
      async () => {
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
      },
      24,
    );

    return {
      explanation: cachedResult.content,
      isCached: cachedResult.isCached,
    };
  }

  async getSchemeInstructions(
    schemeTitle: string,
    schemeId?: string,
    language?: string,
  ): Promise<{
    instructions: string;
    applicationUrl: string;
    schemeTitle: string;
    isCached?: boolean;
  }> {
    let scheme: any = null;
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

    const officialApplyUrls: Record<string, string> = {
      'PM-KISAN': 'https://pmkisan.gov.in',
      'PMAY-GRAMIN': 'https://pmayg.nic.in',
      'PM-VIDYA-SCHOLARSHIP': 'https://scholarships.gov.in',
      'UP-POST-MATRIC-SCHOLARSHIP': 'https://scholarship.up.gov.in',
      'AYUSHMAN-BHARAT-PMJAY': 'https://pmjay.gov.in',
      'PM-MUDRA-YOJANA': 'https://www.mudra.org.in',
      'NSAP-NATIONAL-PENSION': 'https://nsap.nic.in',
    };

    let applicationUrl = officialApplyUrls[scheme?.code || ''] || 'https://www.india.gov.in/my-government/schemes';
    if (scheme?.category === 'EDUCATION') applicationUrl = 'https://scholarships.gov.in';
    if (scheme?.category === 'HEALTHCARE') applicationUrl = 'https://pmjay.gov.in';
    if (scheme?.category === 'HOUSING') applicationUrl = 'https://pmayg.nic.in';
    if (scheme?.category === 'FINANCIAL_INCLUSION') applicationUrl = 'https://www.mudra.org.in';
    if (scheme?.state?.toLowerCase().includes('uttar pradesh')) applicationUrl = 'https://scholarship.up.gov.in';

    const rules = scheme?.eligibilityRules?.map((r: any) => `${r.attributeKey}:${r.operator}:${r.targetValue}:${r.description}`) || [];
    const docs = scheme?.requiredDocuments?.map((d: any) => `${d.documentType}:${d.isMandatory}`) || [];
    const schemeRuleHash = createHash('sha256')
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
      useCase: 'scheme-instructions' as const,
      schemeId: scheme?.id || schemeTitle.toLowerCase().replace(/\s+/g, '-'),
      schemeRuleHash,
      minimizedProfileHash: 'static_scheme_guidance',
      language: isHindi ? 'hi' : 'en',
      promptVersion: 'v3.0',
    };

    const cachedResult = await this.aiCache.getOrExecute(
      cacheKeyOptions,
      async () => {
        const text = await this.geminiAdapter.generateSchemeInstructions({
          schemeTitle: scheme?.title || schemeTitle,
          category: scheme?.category,
          department: scheme?.department,
          description: scheme?.description,
          eligibilityRules: rules,
        });
        const sanitized = this.sanitizeAiResponse(text);
        return { content: sanitized, provider: 'AI Copilot' };
      },
      48,
    );

    return {
      instructions: cachedResult.content,
      applicationUrl,
      schemeTitle: scheme?.title || schemeTitle,
      isCached: cachedResult.isCached,
    };
  }
}
