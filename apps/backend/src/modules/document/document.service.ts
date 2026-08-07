import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IDocumentRepository } from '../../domain/document/document-repository.interface';
import { DocumentEntity, VerificationStatus } from '../../domain/document/document.entity';
import { DocumentType } from '../../domain/welfare/scheme.entity';
import { LocalStorageAdapter } from '../../infrastructure/storage/local-storage.adapter';
import { randomUUID } from 'crypto';

@Injectable()
export class DocumentService {
  constructor(
    @Inject('IDocumentRepository') private readonly documentRepo: IDocumentRepository,
    private readonly storageAdapter: LocalStorageAdapter,
  ) {}

  async uploadDocument(
    userId: string,
    documentType: DocumentType,
    file: Express.Multer.File,
  ): Promise<DocumentEntity> {
    const uploadRes = await this.storageAdapter.uploadFile({
      fileName: file.originalname,
      fileBuffer: file.buffer,
      mimeType: file.mimetype,
    });

    const doc = new DocumentEntity({
      id: randomUUID(),
      userId,
      documentType,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      storagePath: uploadRes.storagePath,
      verificationStatus: VerificationStatus.PENDING,
    });

    return await this.documentRepo.save(doc);
  }

  async getUserDocuments(userId: string): Promise<DocumentEntity[]> {
    return await this.documentRepo.findByUserId(userId);
  }

  async getDocumentById(id: string): Promise<DocumentEntity> {
    const doc = await this.documentRepo.findById(id);
    if (!doc) {
      throw new NotFoundException(`Document with ID '${id}' not found.`);
    }
    return doc;
  }
}
