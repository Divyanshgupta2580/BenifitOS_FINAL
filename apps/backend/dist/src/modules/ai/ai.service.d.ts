import { GeminiAiAdapter } from '../../infrastructure/ai/gemini-ai.adapter';
import { AiSafetyService } from '../../infrastructure/ai/ai-safety.service';
export declare class AiService {
    private readonly geminiAdapter;
    private readonly aiSafety;
    private readonly logger;
    constructor(geminiAdapter: GeminiAiAdapter, aiSafety: AiSafetyService);
    chat(prompt: string, context?: Record<string, any>): Promise<{
        content: string;
        provider: string;
    }>;
    explainRecommendation(schemeTitle: string, matchPercentage: number, criteriaMet: string[], missingCriteria: string[]): Promise<string>;
}
