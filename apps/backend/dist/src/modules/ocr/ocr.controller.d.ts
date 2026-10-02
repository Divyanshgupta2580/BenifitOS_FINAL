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
            ocrStatus: string;
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
    confirmOcr(userId: string, documentId: string, confirmedFields: Record<string, any>): Promise<{
        message: string;
        documentId: string;
        confirmedData: {
            userConfirmedFields: Record<string, any>;
            ocrStatus: string;
            userConfirmed: boolean;
            confirmedAt: string;
        };
        verificationStatus: string;
    }>;
}
