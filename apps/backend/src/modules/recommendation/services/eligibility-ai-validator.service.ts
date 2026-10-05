import { Injectable, Logger } from '@nestjs/common';
import { GeminiAiAdapter } from '../../../infrastructure/ai/gemini-ai.adapter';
import { AiCacheService } from '../../../infrastructure/ai/ai-cache.service';
import { CitizenEntity } from '../../../domain/citizen/citizen.entity';
import { WelfareSchemeEntity } from '../../../domain/welfare/scheme.entity';
import { DetailedEvaluationResult } from './eligibility-evaluator.service';
import { createHash } from 'crypto';

export type ClaimReadyDecision = 'CLAIM_READY' | 'NOT_ELIGIBLE' | 'INSUFFICIENT_DATA' | 'REVIEW_REQUIRED';

export interface AiValidationResult {
  decision: ClaimReadyDecision;
  allNonDocumentCriteriaSatisfied: boolean;
  onlyDocumentsRemaining: boolean;
  confidence: number;
  failedCriteria: string[];
  unverifiedCriteria: string[];
  requiredDocuments: string[];
  reason: string;
  isCached?: boolean;
}

@Injectable()
export class EligibilityAiValidatorService {
  private readonly logger = new Logger(EligibilityAiValidatorService.name);

  constructor(
    private readonly geminiAdapter: GeminiAiAdapter,
    private readonly aiCache: AiCacheService,
  ) {}

  async validateEligibility(
    citizen: CitizenEntity,
    scheme: WelfareSchemeEntity,
    deterministic: DetailedEvaluationResult,
  ): Promise<AiValidationResult> {
    const requiredDocNames = (scheme.requiredDocuments || []).map((d: any) =>
      typeof d === 'string' ? d : d.documentType || d.description,
    );

    // GUARD 1: Missing profile fields -> INSUFFICIENT_DATA
    if (deterministic.missingProfileFields.length > 0) {
      return {
        decision: 'INSUFFICIENT_DATA',
        allNonDocumentCriteriaSatisfied: false,
        onlyDocumentsRemaining: false,
        confidence: 1.0,
        failedCriteria: [],
        unverifiedCriteria: deterministic.missingProfileFields,
        requiredDocuments: requiredDocNames,
        reason: `Eligibility could not be confirmed yet: Missing required profile attributes (${deterministic.missingProfileFields.join(', ')}).`,
      };
    }

    // GUARD 2: Deterministic failure -> NOT_ELIGIBLE (Gemini can NEVER override failure)
    if (deterministic.eligibilityStatus === 'NOT_ELIGIBLE' || !deterministic.recommendation.isEligible) {
      return {
        decision: 'NOT_ELIGIBLE',
        allNonDocumentCriteriaSatisfied: false,
        onlyDocumentsRemaining: false,
        confidence: 1.0,
        failedCriteria: deterministic.failedRules.length > 0 ? deterministic.failedRules : [deterministic.statusReason],
        unverifiedCriteria: [],
        requiredDocuments: requiredDocNames,
        reason: deterministic.statusReason || 'Mandatory statutory scheme criteria not satisfied.',
      };
    }

    // GUARD 3: Deterministic passed all non-document rules -> Second-layer Gemini Validation
    // Deliberately normalized: it contains every field currently modelled by
    // deterministic eligibility, but never names, hashes, addresses or other
    // database internals.
    const citizenFacts = {
      age: citizen.age,
      gender: citizen.gender,
      maritalStatus: citizen.maritalStatus,
      employmentStatus: citizen.employmentStatus,
      annualIncomeINR: citizen.annualIncomeINR,
      isBplCardHolder: citizen.isBplCardHolder,
      state: citizen.address?.state,
      district: citizen.address?.district,
      city: citizen.address?.city,
      isRural: citizen.address?.isRural,
      socialCategory: citizen.socialCategory,
      disabilityType: citizen.disabilityType,
      disabilityPercent: citizen.disabilityPercent,
      householdSize: citizen.householdMembers.length,
      land: {
        hasLand: citizen.landDetails.length > 0,
        totalAcres: citizen.landDetails.reduce((total, land) => total + (land.landSizeAcres || 0), 0),
      },
    };

    const schemeRules = (scheme.eligibilityRules || []).map((r) => ({
      attribute: r.attributeKey,
      operator: r.operator,
      target: r.targetValue,
      description: r.description,
    }));

    const profileHash = createHash('sha256')
      .update(JSON.stringify(citizenFacts))
      .digest('hex')
      .substring(0, 16);

    const schemeRuleHash = createHash('sha256')
      .update(JSON.stringify({ code: scheme.code, rules: schemeRules, docs: requiredDocNames }))
      .digest('hex')
      .substring(0, 16);

    const cacheKeyOptions = {
      useCase: 'eligibility-validation' as const,
      userId: citizen.userId,
      schemeId: scheme.id,
      schemeRuleHash,
      minimizedProfileHash: profileHash,
      language: 'en',
      promptVersion: 'v2.0',
    };

    try {
      const cached = await this.aiCache.getOrExecute(
        cacheKeyOptions,
        async () => {
          const promptPayload = {
            scheme: {
              id: scheme.id,
              code: scheme.code,
              title: scheme.title,
              description: scheme.description,
              department: scheme.department,
              scope: scheme.isCentralScheme ? 'CENTRAL' : 'STATE',
              state: scheme.state,
              sourceUrl: scheme.sourceUrl,
              lastUpdatedAt: scheme.updatedAt?.toISOString(),
              rules: schemeRules,
              requiredDocuments: requiredDocNames,
            },
            citizenProfileFacts: citizenFacts,
            deterministicEngineResult: {
              status: 'ELIGIBLE',
              passedRules: deterministic.passedRules,
              failedRules: deterministic.failedRules,
            },
          };

          const systemInstruction = `You are the BenefitOS Welfare Scheme Eligibility Auditor.
Your responsibility is to perform strict second-layer verification of citizen eligibility for government welfare schemes.
CRITICAL AUDIT RULES:
1. Base your evaluation ONLY on the supplied facts from the verified database.
2. DO NOT hallucinate, infer, or invent missing information.
3. If every required non-document criterion is satisfied by the citizen's profile facts, set "decision": "CLAIM_READY", "allNonDocumentCriteriaSatisfied": true, "onlyDocumentsRemaining": true.
4. If any mandatory criterion fails or is missing, set "decision": "NOT_ELIGIBLE" or "INSUFFICIENT_DATA".
5. Return ONLY a valid JSON object matching this schema:
{
  "decision": "CLAIM_READY" | "NOT_ELIGIBLE" | "INSUFFICIENT_DATA" | "REVIEW_REQUIRED",
  "allNonDocumentCriteriaSatisfied": boolean,
  "onlyDocumentsRemaining": boolean,
  "confidence": number,
  "failedCriteria": string[],
  "unverifiedCriteria": string[],
  "requiredDocuments": string[],
  "reason": string
}`;

          const request = {
            prompt: `Audit eligibility for this applicant:\n${JSON.stringify(promptPayload, null, 2)}`,
            systemInstruction,
            temperature: 0.1,
          };
          // The production adapter always provides generateJson.  The narrow
          // fallback keeps older test doubles compatible while preserving the
          // same strict parse/fail-closed semantics.
          const parsed: Record<string, unknown> = typeof (this.geminiAdapter as any).generateJson === 'function'
            ? await this.geminiAdapter.generateJson<Record<string, unknown>>(request)
            : JSON.parse((await this.geminiAdapter.generateText(request)).content);

          try {
            const isAiClaimReady =
              parsed.decision === 'CLAIM_READY' &&
              parsed.allNonDocumentCriteriaSatisfied === true &&
              parsed.onlyDocumentsRemaining === true;

            const decision: ClaimReadyDecision = isAiClaimReady
              ? 'CLAIM_READY'
              : parsed.decision === 'INSUFFICIENT_DATA'
              ? 'INSUFFICIENT_DATA'
              : parsed.decision === 'REVIEW_REQUIRED'
              ? 'REVIEW_REQUIRED'
              : 'NOT_ELIGIBLE';

            const validated: AiValidationResult = {
              decision,
              allNonDocumentCriteriaSatisfied: isAiClaimReady,
              onlyDocumentsRemaining: isAiClaimReady,
              confidence: typeof parsed.confidence === 'number' ? parsed.confidence : (isAiClaimReady ? 0.98 : 0.5),
              failedCriteria: Array.isArray(parsed.failedCriteria) ? parsed.failedCriteria.filter((value): value is string => typeof value === 'string') : [],
              unverifiedCriteria: Array.isArray(parsed.unverifiedCriteria) ? parsed.unverifiedCriteria.filter((value): value is string => typeof value === 'string') : [],
              requiredDocuments: Array.isArray(parsed.requiredDocuments) ? parsed.requiredDocuments.filter((value): value is string => typeof value === 'string') : requiredDocNames,
              reason: typeof parsed.reason === 'string' ? parsed.reason : (isAiClaimReady ? 'Verified statutory eligibility conditions satisfied.' : 'Eligibility criteria validation requires further review.'),
            };

            return {
              content: JSON.stringify(validated),
              provider: 'Gemini Eligibility Auditor',
            };
          } catch (parseErr) {
            // Malformed / invalid JSON from AI strictly prevents CLAIM_READY -> REVIEW_REQUIRED
            const fallback: AiValidationResult = {
              decision: 'REVIEW_REQUIRED',
              allNonDocumentCriteriaSatisfied: false,
              onlyDocumentsRemaining: false,
              confidence: 0.0,
              failedCriteria: [],
              unverifiedCriteria: ['Malformed AI response during validation'],
              requiredDocuments: requiredDocNames,
              reason: 'Second-layer AI eligibility validation returned malformed response; manual/system review required.',
            };
            return {
              content: JSON.stringify(fallback),
              provider: 'Gemini Eligibility Auditor (Parse Error)',
            };
          }
        },
        24,
      );

      const parsedResult: AiValidationResult = JSON.parse(cached.content);
      return {
        ...parsedResult,
        isCached: cached.isCached,
      };
    } catch (err: any) {
      // Upstream Gemini outage (500, 503, timeout, network error, missing key) strictly prevents CLAIM_READY -> REVIEW_REQUIRED
      this.logger.warn(`AI eligibility validation outage / error: ${err?.message}`);
      return {
        decision: 'REVIEW_REQUIRED',
        allNonDocumentCriteriaSatisfied: false,
        onlyDocumentsRemaining: false,
        confidence: 0.0,
        failedCriteria: [],
        unverifiedCriteria: ['Upstream AI validation service temporarily unavailable'],
        requiredDocuments: requiredDocNames,
        reason: 'Second-layer AI eligibility validation pending due to upstream auditor outage; statutory review required.',
      };
    }
  }
}
