import { IDocumentRepository } from '../../domain/document/document-repository.interface';
import { DocumentEntity } from '../../domain/document/document.entity';
import { DocumentType } from '../../domain/welfare/scheme.entity';
import { LocalStorageAdapter } from '../../infrastructure/storage/local-storage.adapter';
export declare class DocumentService {
    private readonly documentRepo;
    private readonly storageAdapter;
    constructor(documentRepo: IDocumentRepository, storageAdapter: LocalStorageAdapter);
    uploadDocument(userId: string, documentType: DocumentType, file: Express.Multer.File): Promise<DocumentEntity>;
    getUserDocuments(userId: string): Promise<DocumentEntity[]>;
    getDocumentById(id: string): Promise<DocumentEntity>;
}
