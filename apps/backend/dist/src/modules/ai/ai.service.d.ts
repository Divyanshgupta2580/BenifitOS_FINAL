import { GeminiAiAdapter } from '../../infrastructure/ai/gemini-ai.adapter';
import { AiSafetyService } from '../../infrastructure/ai/ai-safety.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';
export declare class AiService {
    private readonly geminiAdapter;
    private readonly aiSafety;
    private readonly prisma;
    private readonly logger;
    constructor(geminiAdapter: GeminiAiAdapter, aiSafety: AiSafetyService, prisma: PrismaService);
    chat(prompt: string, context?: Record<string, any>, userId?: string): Promise<{
        content: string;
        provider: string;
    }>;
    explainRecommendation(schemeTitle: string, matchPercentage: number, criteriaMet: string[], missingCriteria: string[]): Promise<string>;
    getSchemeInstructions(schemeTitle: string, schemeId?: string): Promise<{
        instructions: string;
        applicationUrl: string;
        schemeTitle: string;
    }>;
}
