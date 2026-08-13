import { AiService } from './ai.service';
export declare class AiChatDto {
    prompt: string;
    context?: Record<string, any>;
    language?: string;
}
export declare class ExplainRecommendationDto {
    schemeTitle: string;
    matchPercentage: number;
    criteriaMet: string[];
    missingCriteria: string[];
    language?: string;
}
export declare class AiController {
    private readonly aiService;
    constructor(aiService: AiService);
    chat(dto: AiChatDto): Promise<{
        reply: string;
        provider: string;
    }>;
    explainRecommendation(dto: ExplainRecommendationDto): Promise<{
        explanation: string;
    }>;
}
