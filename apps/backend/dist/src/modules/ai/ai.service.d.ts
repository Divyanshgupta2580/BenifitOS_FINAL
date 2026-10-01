import { GeminiAiAdapter } from '../../infrastructure/ai/gemini-ai.adapter';
import { AiSafetyService } from '../../infrastructure/ai/ai-safety.service';
import { AiCacheService } from '../../infrastructure/ai/ai-cache.service';
import { AiDataMinimizerService } from '../../infrastructure/ai/ai-data-minimizer.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';
export declare class AiService {
    private readonly geminiAdapter;
    private readonly aiSafety;
    private readonly aiCache;
    private readonly aiDataMinimizer;
    private readonly prisma;
    private readonly logger;
    constructor(geminiAdapter: GeminiAiAdapter, aiSafety: AiSafetyService, aiCache: AiCacheService, aiDataMinimizer: AiDataMinimizerService, prisma: PrismaService);
    chat(prompt: string, context?: Record<string, any>, userId?: string, language?: string): Promise<{
        content: string;
        provider: string;
        isCached?: boolean;
        sources?: string[];
    }>;
    private resolveUseCase;
    private formatEligibilityLabel;
    private buildVerifiedChatContext;
    explainRecommendation(schemeTitle: string, matchPercentage: number, criteriaMet: string[], missingCriteria: string[], language?: string): Promise<{
        explanation: string;
        isCached?: boolean;
    }>;
    getSchemeInstructions(schemeTitle: string, schemeId?: string, language?: string): Promise<{
        instructions: string;
        applicationUrl: string;
        schemeTitle: string;
        isCached?: boolean;
    }>;
}
