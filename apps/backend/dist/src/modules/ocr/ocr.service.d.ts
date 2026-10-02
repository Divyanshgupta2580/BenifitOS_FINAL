import { IDocumentRepository } from '../../domain/document/document-repository.interface';
import { GeminiAiAdapter } from '../../infrastructure/ai/gemini-ai.adapter';
import { LocalStorageAdapter } from '../../infrastructure/storage/local-storage.adapter';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { DocumentClassificationService } from '../document/document-classification.service';
export declare class OcrPipelineService {
    private readonly documentRepo;
    private readonly geminiAdapter;
    private readonly storageAdapter;
    private readonly classificationService;
    private readonly prisma;
    private readonly logger;
    constructor(documentRepo: IDocumentRepository, geminiAdapter: GeminiAiAdapter, storageAdapter: LocalStorageAdapter, classificationService: DocumentClassificationService, prisma: PrismaService);
    processDocumentOcr(userId: string, documentId: string): Promise<{
        documentId: string;
        confidenceScore: number;
        extractedFields: Record<string, any>;
        ocrStatus: string;
    }>;
    getOcrResult(userId: string, documentId: string): Promise<{
        id: string;
        documentId: string;
        rawText: string;
        confidenceScore: number;
        extractedData: Record<string, any>;
        processedAt: string;
    }>;
    confirmOcrResult(userId: string, documentId: string, confirmedFields: Record<string, any>): Promise<{
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
