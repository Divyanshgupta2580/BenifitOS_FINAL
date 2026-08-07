import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IDocumentRepository } from '../../../domain/document/document-repository.interface';
import { DocumentEntity, VerificationStatus } from '../../../domain/document/document.entity';
import { DocumentType } from '../../../domain/welfare/scheme.entity';

@Injectable()
export class DocumentRepositoryImpl implements IDocumentRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToEntity(data: any): DocumentEntity {
    return new DocumentEntity({
      id: data.id,
      userId: data.userId,
      documentType: data.documentType as DocumentType,
      fileName: data.fileName,
      fileSize: data.fileSize,
      mimeType: data.mimeType,
      storagePath: data.storagePath,
      encryptionKeyRef: data.encryptionKeyRef,
      verificationStatus: data.verificationStatus as VerificationStatus,
      ocrResult: data.ocrResult ? {
        id: data.ocrResult.id,
        documentId: data.ocrResult.documentId,
        rawText: data.ocrResult.rawText,
        confidenceScore: data.ocrResult.confidenceScore,
        extractedData: data.ocrResult.extractedData as Record<string, any>,
        processedAt: data.ocrResult.processedAt,
      } : null,
      uploadedAt: data.uploadedAt,
      updatedAt: data.updatedAt,
    });
  }

  async findById(id: string): Promise<DocumentEntity | null> {
    const record = await this.prisma.document.findUnique({
      where: { id },
      include: { ocrResult: true },
    });
    return record ? this.mapToEntity(record) : null;
  }

  async findByUserId(userId: string): Promise<DocumentEntity[]> {
    const records = await this.prisma.document.findMany({
      where: { userId },
      include: { ocrResult: true },
    });
    return records.map((r) => this.mapToEntity(r));
  }

  async findByUserAndType(userId: string, documentType: DocumentType): Promise<DocumentEntity[]> {
    const records = await this.prisma.document.findMany({
      where: { userId, documentType },
      include: { ocrResult: true },
    });
    return records.map((r) => this.mapToEntity(r));
  }

  async save(document: DocumentEntity): Promise<DocumentEntity> {
    const record = await this.prisma.document.create({
      data: {
        id: document.id,
        userId: document.userId,
        documentType: document.documentType,
        fileName: document.fileName,
        fileSize: document.fileSize,
        mimeType: document.mimeType,
        storagePath: document.storagePath,
        encryptionKeyRef: document.encryptionKeyRef,
        verificationStatus: document.verificationStatus,
      },
      include: { ocrResult: true },
    });
    return this.mapToEntity(record);
  }

  async update(document: DocumentEntity): Promise<DocumentEntity> {
    const record = await this.prisma.document.update({
      where: { id: document.id },
      data: {
        verificationStatus: document.verificationStatus,
      },
      include: { ocrResult: true },
    });
    return this.mapToEntity(record);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.document.delete({ where: { id } });
  }
}
