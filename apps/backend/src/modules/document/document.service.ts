import { Injectable, Inject, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { IDocumentRepository } from '../../domain/document/document-repository.interface';
import { DocumentEntity, VerificationStatus } from '../../domain/document/document.entity';
import { DocumentType, DOCUMENT_TYPE_DISPLAY_NAMES } from '../../domain/welfare/scheme.entity';
import { LocalStorageAdapter } from '../../infrastructure/storage/local-storage.adapter';
import { DocumentClassificationService } from './document-classification.service';
import { GeminiAiAdapter } from '../../infrastructure/ai/gemini-ai.adapter';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);

  constructor(
    @Inject('IDocumentRepository') private readonly documentRepo: IDocumentRepository,
    private readonly storageAdapter: LocalStorageAdapter,
    private readonly classificationService: DocumentClassificationService,
    private readonly geminiAdapter: GeminiAiAdapter,
    private readonly prisma: PrismaService,
  ) {}

  async uploadDocument(
    userId: string,
    requiredDocumentType: DocumentType,
    file: Express.Multer.File,
  ): Promise<{ document?: DocumentEntity; classification: any }> {
    const validTypes = Object.values(DocumentType);
    if (!validTypes.includes(requiredDocumentType)) {
      throw new BadRequestException(
        `Unsupported document type. Supported types: ${validTypes.join(', ')}`,
      );
    }

    const fileBuffer = file.buffer || Buffer.from('');
    this.validateFileSignature(fileBuffer, file.mimetype);

    const ocrRes = await this.geminiAdapter.extractDocumentData(
      fileBuffer,
      file.mimetype,
      requiredDocumentType,
    );
    const textContent = ocrRes.rawText || fileBuffer.toString('utf-8');

    // Anti-spoofing document classification strictly based on file content
    const classification = this.classificationService.classifyDocumentContent(
      textContent,
      requiredDocumentType,
    );

    // Stop and reject immediately if mismatched or invalid. DO NOT PERSIST MISMATCHED DOCUMENT.
    if (classification.status === 'REJECTED' || classification.detectedType !== requiredDocumentType) {
      const requiredName = DOCUMENT_TYPE_DISPLAY_NAMES[requiredDocumentType] || requiredDocumentType;
      const detectedName = classification.detectedType
        ? DOCUMENT_TYPE_DISPLAY_NAMES[classification.detectedType] || classification.detectedType
        : 'Unrecognized Document';

      throw new BadRequestException({
        statusCode: 400,
        error: 'Bad Request',
        message: classification.reason || `Incorrect document. Required: ${requiredName}, Detected: ${detectedName}. Please upload your ${requiredName}.`,
        details: {
          requiredDocumentType,
          detectedDocumentType: classification.detectedType,
          status: 'REJECTED',
          reason: classification.reason,
        },
      });
    }

    if (classification.status === 'MANUAL_REVIEW') {
      throw new BadRequestException({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Uploaded document could not be verified with sufficient confidence. Please upload a clear document image.',
        details: {
          requiredDocumentType,
          detectedDocumentType: classification.detectedType,
          status: 'MANUAL_REVIEW',
        },
      });
    }

    // 1. Fetch any existing documents of the same type to replace upon successful upload
    const existingDocs = await this.documentRepo.findByUserAndType(userId, requiredDocumentType);

    // 2. Persist new file first (validation & signature already completed)
    const uploadRes = await this.storageAdapter.uploadFile({
      fileName: file.originalname,
      fileBuffer: file.buffer,
      mimeType: file.mimetype,
    });

    const doc = new DocumentEntity({
      id: randomUUID(),
      userId,
      documentType: classification.detectedType,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      storagePath: uploadRes.storagePath,
      verificationStatus: VerificationStatus.VERIFIED,
    });

    const savedDoc = await this.documentRepo.save(doc);

    await this.prisma.client.ocrResult.upsert({
      where: { documentId: savedDoc.id },
      create: {
        documentId: savedDoc.id,
        rawText: ocrRes.rawText,
        confidenceScore: classification.confidence,
        extractedData: classification.extractedFields || {},
      },
      update: {
        rawText: ocrRes.rawText,
        confidenceScore: classification.confidence,
        extractedData: classification.extractedFields || {},
      },
    });

    // 3. Only after new document and OCR result are safely persisted, remove previous version(s)
    if (existingDocs && existingDocs.length > 0) {
      for (const oldDoc of existingDocs) {
        if (oldDoc.id !== savedDoc.id) {
          try {
            await this.documentRepo.delete(oldDoc.id);
            if (oldDoc.storagePath) {
              await this.storageAdapter.deleteFile(oldDoc.storagePath);
            }
          } catch (delErr: any) {
            this.logger.warn(`Failed to clean up replaced document ${oldDoc.id}: ${delErr.message}`);
          }
        }
      }
    }

    return {
      document: savedDoc,
      classification: {
        detectedType: classification.detectedType,
        confidence: classification.confidence,
        status: 'ACCEPTED',
        displayName: DOCUMENT_TYPE_DISPLAY_NAMES[classification.detectedType],
      },
    };
  }

  public validateFileSignature(buffer: Buffer, mimeType: string): void {
    if (!buffer || buffer.length < 4) {
      throw new BadRequestException('File is empty or corrupted.');
    }

    const isPdf = buffer.length >= 4 && buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46; // %PDF
    const isJpg = buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    const isPng = buffer.length >= 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
    const isWebp = buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';

    const normalizedMime = (mimeType || '').toLowerCase();
    let valid = false;

    if (normalizedMime.includes('pdf') && isPdf) valid = true;
    else if ((normalizedMime.includes('jpeg') || normalizedMime.includes('jpg')) && isJpg) valid = true;
    else if (normalizedMime.includes('png') && isPng) valid = true;
    else if (normalizedMime.includes('webp') && isWebp) valid = true;
    else if (!normalizedMime && (isPdf || isJpg || isPng || isWebp)) valid = true;

    if (!valid) {
      throw new BadRequestException(
        'File signature mismatch. The uploaded file content does not match a valid PDF, JPEG, PNG, or WEBP document signature.',
      );
    }
  }

  async getUserDocuments(userId: string): Promise<DocumentEntity[]> {
    return await this.documentRepo.findByUserId(userId);
  }

  async getDocumentById(userId: string, id: string): Promise<DocumentEntity> {
    const doc = await this.documentRepo.findById(id);
    if (!doc || doc.userId !== userId) {
      throw new NotFoundException(`Document with ID '${id}' not found or access denied.`);
    }
    return doc;
  }

  async deleteDocument(userId: string, id: string): Promise<void> {
    const doc = await this.documentRepo.findById(id);
    if (!doc || doc.userId !== userId) {
      throw new NotFoundException(`Document with ID '${id}' not found or access denied.`);
    }
    if (doc.storagePath) {
      await this.storageAdapter.deleteFile(doc.storagePath);
    }
    await this.documentRepo.delete(id);
  }
}
