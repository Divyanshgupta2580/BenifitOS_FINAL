import { OcrPipelineService } from './ocr.service';
export declare class OcrController {
    private readonly ocrService;
    constructor(ocrService: OcrPipelineService);
    processOcr(documentId: string): Promise<{
        message: string;
        result: {
            documentId: string;
            confidenceScore: number;
            extractedFields: Record<string, any>;
        };
    }>;
}
