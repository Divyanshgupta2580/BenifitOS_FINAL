export declare class AiSafetyService {
    sanitizePromptInput(input: string): string;
    redactPiiFromContext(context: Record<string, any>): Record<string, any>;
}
