import { IAiProvider, IVisionOcrProvider, AiPromptOptions, AiResponse } from '../../domain/ai/ai-provider.interface';
export declare class GeminiAiAdapter implements IAiProvider, IVisionOcrProvider {
    readonly providerName = "gemini";
    private readonly logger;
    private aiClient;
    constructor();
    generateText(options: AiPromptOptions): Promise<AiResponse>;
    generateStream(options: AiPromptOptions, onChunk: (chunk: string) => void): Promise<AiResponse>;
    extractDocumentData(fileBuffer: Buffer, mimeType: string, expectedDocType: string): Promise<{
        rawText: string;
        confidenceScore: number;
        extractedFields: Record<string, any>;
    }>;
}
