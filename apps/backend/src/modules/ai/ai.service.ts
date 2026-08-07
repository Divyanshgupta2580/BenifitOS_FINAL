import { Injectable, Logger } from '@nestjs/common';
import { GeminiAiAdapter } from '../../infrastructure/ai/gemini-ai.adapter';
import { AiSafetyService } from '../../infrastructure/ai/ai-safety.service';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly geminiAdapter: GeminiAiAdapter,
    private readonly aiSafety: AiSafetyService,
  ) {}

  async chat(prompt: string, context?: Record<string, any>): Promise<{ content: string; provider: string }> {
    const sanitizedPrompt = this.aiSafety.sanitizePromptInput(prompt);
    const redactedContext = context ? this.aiSafety.redactPiiFromContext(context) : {};

    const systemInstruction = `You are BenefitOS Assistant, an expert digital welfare advisor. 
You provide accessible, polite, and accurate explanations of government welfare schemes.
NEVER make up eligibility rules. Eligibility is determined strictly by the BenefitOS Recommendation Engine.`;

    const fullPrompt = `${sanitizedPrompt}\n\n[Context: ${JSON.stringify(redactedContext)}]`;
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
}
