import { PrismaService } from '../prisma.service';
import { IDocumentRepository } from '../../../domain/document/document-repository.interface';
import { DocumentEntity } from '../../../domain/document/document.entity';
import { DocumentType } from '../../../domain/welfare/scheme.entity';
export declare class DocumentRepositoryImpl implements IDocumentRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private mapToEntity;
    findById(id: string): Promise<DocumentEntity | null>;
    findByUserId(userId: string): Promise<DocumentEntity[]>;
    findByUserAndType(userId: string, documentType: DocumentType): Promise<DocumentEntity[]>;
    save(document: DocumentEntity): Promise<DocumentEntity>;
    update(document: DocumentEntity): Promise<DocumentEntity>;
    delete(id: string): Promise<void>;
}
