import { IDocumentRepository } from '../../domain/document/document-repository.interface';
import { GeminiAiAdapter } from '../../infrastructure/ai/gemini-ai.adapter';
import { LocalStorageAdapter } from '../../infrastructure/storage/local-storage.adapter';
import { PrismaService } from '../../infrastructure/database/prisma.service';
export declare class OcrPipelineService {
    private readonly documentRepo;
    private readonly geminiAdapter;
    private readonly storageAdapter;
    private readonly prisma;
    constructor(documentRepo: IDocumentRepository, geminiAdapter: GeminiAiAdapter, storageAdapter: LocalStorageAdapter, prisma: PrismaService);
    processDocumentOcr(documentId: string): Promise<{
        documentId: string;
        confidenceScore: number;
        extractedFields: Record<string, any>;
    }>;
}
