import { Injectable, Logger } from '@nestjs/common';
import { GeminiAiAdapter } from '../../infrastructure/ai/gemini-ai.adapter';
import { AiSafetyService } from '../../infrastructure/ai/ai-safety.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly geminiAdapter: GeminiAiAdapter,
    private readonly aiSafety: AiSafetyService,
    private readonly prisma: PrismaService,
  ) {}

  async chat(prompt: string, context?: Record<string, any>, userId?: string): Promise<{ content: string; provider: string }> {
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
            ? profile.recommendations.map((r: any) => {
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
      } catch (err: any) {
        this.logger.warn(`Could not load citizen profile for AI chat context: ${err.message}`);
      }
    }

    const systemInstruction = `You are BenefitOS AI Citizen Copilot, the official digital welfare intelligence assistant for Indian citizens.
Your role is to act as an authoritative, respectful, clear, neutral, citizen-friendly, and helpful government welfare assistance officer.

OFFICIAL TONE & IDENTITY:
- Speak as "BenefitOS AI Citizen Copilot" or "BenefitOS AI". NEVER mention any external AI provider, model name, or LLM infrastructure.
- Tone: Professional, respectful, clear, evidence-based, concise, and non-judgmental.
- Avoid casual greetings ("Hey!", "Great question!"), marketing hype ("Amazing benefits!"), or conversational fluff ("I am excited to help").
- Use formal, clear Indian English conventions.

STRICT ELIGIBILITY & EVIDENCE RULES:
- NEVER declare unconditional eligibility (e.g. do not say "You are eligible" or "You qualify" without qualification).
- Always distinguish between:
  1. "Appears relevant based on available information"
  2. "Requires verification"
  3. "Eligibility status: Verified" (only when pre-calculated in database)
- Always include the official disclaimer: "Final eligibility, benefit disbursement, and application approval are determined by the concerned government department or implementing agency."

STRUCTURED RESPONSE FORMATTING:
Organize your advice into clean, structured sections:
1. Summary (1-2 sentences on what was analyzed).
2. Scheme Recommendation (if recommending schemes):
   - Format each scheme clearly:
     ### [Scheme Name]
     **Department/Ministry**: [Department Name]
     **Eligibility Status**: [Appears relevant based on available profile information | Requires verification]
     **Estimated Benefit**: [₹X / Year or Subject to scheme provisions]
     **Why this may apply**: [1-2 concise sentences connecting to their profile]
     **Required Documents**:
     - [Aadhaar Card]
     - [Income Certificate]
     - [Other relevant documents]
     **Next Step**: [Concrete actionable step on official portal/CSC]
3. Application Guidance (if asked how to apply):
   - Use numbered steps: 01. Verify Eligibility, 02. Prepare Documents, 03. Register on Official Portal, 04. Submit Form, 05. Track Status.
4. Important Notice: Reminder that official portals/agencies make final determination.

${citizenProfileContext}`;

    const fullPrompt = `${sanitizedPrompt}\n\n[Client Context: ${JSON.stringify(redactedContext)}]`;
    const result = await this.geminiAdapter.generateText({
      prompt: fullPrompt,
      systemInstruction,
    });

    return { content: result.content, provider: result.provider };
  }

  async explainRecommendation(schemeTitle: string, matchPercentage: number, criteriaMet: string[], missingCriteria: string[]): Promise<string> {
    const prompt = `Explain why a citizen received a ${matchPercentage}% match for the scheme '${schemeTitle}'.
Criteria Satisfied: ${criteriaMet.join('; ')}
Missing Requirements: ${missingCriteria.join('; ')}
Explain in clear, encouraging, natural language how they can fulfill missing criteria.`;

    const res = await this.geminiAdapter.generateText({ prompt });
    return res.content;
  }

  async getSchemeInstructions(schemeTitle: string, schemeId?: string): Promise<{
    instructions: string;
    applicationUrl: string;
    schemeTitle: string;
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

    const rules = scheme?.eligibilityRules?.map((r: any) => r.description) || [];
    const instructions = await this.geminiAdapter.generateSchemeInstructions({
      schemeTitle: scheme?.title || schemeTitle,
      category: scheme?.category,
      department: scheme?.department,
      description: scheme?.description,
      eligibilityRules: rules,
    });

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

    return {
      instructions,
      applicationUrl,
      schemeTitle: scheme?.title || schemeTitle,
    };
  }
}
