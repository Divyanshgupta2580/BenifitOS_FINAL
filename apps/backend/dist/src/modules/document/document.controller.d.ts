import { DocumentService } from './document.service';
import { DocumentType } from '../../domain/welfare/scheme.entity';
export declare class DocumentController {
    private readonly documentService;
    constructor(documentService: DocumentService);
    uploadDocument(userId: string, documentType: DocumentType, file: Express.Multer.File): Promise<{
        message: string;
        document: {
            id: string;
            documentType: DocumentType;
            fileName: string;
            fileSize: number;
            verificationStatus: import("../../domain/document/document.entity").VerificationStatus;
        };
    }>;
    getDocuments(userId: string): Promise<{
        count: number;
        documents: {
            id: string;
            documentType: DocumentType;
            fileName: string;
            fileSize: number;
            verificationStatus: import("../../domain/document/document.entity").VerificationStatus;
            uploadedAt: Date;
        }[];
    }>;
    getDocumentById(id: string): Promise<{
        document: {
            id: string;
            documentType: DocumentType;
            fileName: string;
            fileSize: number;
            verificationStatus: import("../../domain/document/document.entity").VerificationStatus;
            ocrResult: import("../../domain/document/document.entity").OcrResultProps | null | undefined;
        };
    }>;
}
