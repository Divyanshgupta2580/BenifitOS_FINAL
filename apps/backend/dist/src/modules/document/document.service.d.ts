import { IDocumentRepository } from '../../domain/document/document-repository.interface';
import { DocumentEntity } from '../../domain/document/document.entity';
import { DocumentType } from '../../domain/welfare/scheme.entity';
import { LocalStorageAdapter } from '../../infrastructure/storage/local-storage.adapter';
import { DocumentClassificationService } from './document-classification.service';
import { GeminiAiAdapter } from '../../infrastructure/ai/gemini-ai.adapter';
import { PrismaService } from '../../infrastructure/database/prisma.service';
export declare class DocumentService {
    private readonly documentRepo;
    private readonly storageAdapter;
    private readonly classificationService;
    private readonly geminiAdapter;
    private readonly prisma;
    private readonly logger;
    constructor(documentRepo: IDocumentRepository, storageAdapter: LocalStorageAdapter, classificationService: DocumentClassificationService, geminiAdapter: GeminiAiAdapter, prisma: PrismaService);
    uploadDocument(userId: string, requiredDocumentType: DocumentType, file: Express.Multer.File): Promise<{
        document?: DocumentEntity;
        classification: any;
    }>;
    validateFileSignature(buffer: Buffer, mimeType: string): void;
    getUserDocuments(userId: string): Promise<DocumentEntity[]>;
    getDocumentById(userId: string, id: string): Promise<DocumentEntity>;
    deleteDocument(userId: string, id: string): Promise<void>;
}
