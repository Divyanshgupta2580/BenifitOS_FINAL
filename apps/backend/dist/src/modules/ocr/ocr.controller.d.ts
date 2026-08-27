import { OcrPipelineService } from './ocr.service';
export declare class OcrController {
    private readonly ocrService;
    constructor(ocrService: OcrPipelineService);
    processOcr(userId: string, documentId: string): Promise<{
        message: string;
        result: {
            documentId: string;
            confidenceScore: number;
            extractedFields: Record<string, any>;
        };
    }>;
    getOcrResult(userId: string, documentId: string): Promise<{
        result: {
            id: string;
            documentId: string;
            rawText: string;
            confidenceScore: number;
            extractedData: Record<string, any>;
            processedAt: string;
        };
    }>;
}
