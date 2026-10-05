import { Injectable, Inject, NotFoundException, ServiceUnavailableException, Logger } from '@nestjs/common';
import { IDocumentRepository } from '../../domain/document/document-repository.interface';
import { GeminiAiAdapter } from '../../infrastructure/ai/gemini-ai.adapter';
import { LocalStorageAdapter } from '../../infrastructure/storage/local-storage.adapter';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { DocumentClassificationService } from '../document/document-classification.service';
import { VerificationStatus } from '../../domain/document/document.entity';

@Injectable()
export class OcrPipelineService {
  private readonly logger = new Logger(OcrPipelineService.name);

  constructor(
    @Inject('IDocumentRepository') private readonly documentRepo: IDocumentRepository,
    private readonly geminiAdapter: GeminiAiAdapter,
    private readonly storageAdapter: LocalStorageAdapter,
    private readonly classificationService: DocumentClassificationService,
    private readonly prisma: PrismaService,
  ) {}

  async processDocumentOcr(
    userId: string,
    documentId: string,
  ): Promise<{ documentId: string; confidenceScore: number; extractedFields: Record<string, any>; ocrStatus: string }> {
    const doc = await this.documentRepo.findById(documentId);
    if (!doc || doc.userId !== userId) {
      throw new NotFoundException(`Document with ID '${documentId}' not found or access denied.`);
    }

    const fileBuffer = await this.storageAdapter.downloadFile(doc.storagePath);
    let ocrResult: Awaited<ReturnType<GeminiAiAdapter['extractDocumentData']>>;
    try {
      ocrResult = await this.geminiAdapter.extractDocumentData(fileBuffer, doc.mimeType, doc.documentType);
    } catch (error: any) {
      this.logger.warn(`OCR unavailable for document ${documentId}: ${error?.message || error}`);
      throw new ServiceUnavailableException({
        code: 'OCR_UNAVAILABLE',
        message: 'Document text extraction is currently unavailable. Existing document data was not changed.',
      });
    }

    const classification = this.classificationService.classifyDocumentContent(
      ocrResult.rawText || fileBuffer.toString('utf-8'),
      doc.documentType,
    );

    const extractedFields = {
      ...(classification.extractedFields || {}),
      ...(ocrResult.extractedFields || {}),
      ocrStatus: 'OCR_COMPLETED',
      detectedType: classification.detectedType,
      confidence: classification.confidence,
    };

    await this.prisma.client.ocrResult.upsert({
      where: { documentId: doc.id },
      create: {
        documentId: doc.id,
        rawText: ocrResult.rawText,
        confidenceScore: classification.confidence || ocrResult.confidenceScore,
        extractedData: extractedFields,
      },
      update: {
        rawText: ocrResult.rawText,
        confidenceScore: classification.confidence || ocrResult.confidenceScore,
        extractedData: extractedFields,
      },
    });

    this.logger.log(`OCR processing completed for document ${documentId}`);

    return {
      documentId: doc.id,
      confidenceScore: classification.confidence || ocrResult.confidenceScore,
      extractedFields,
      ocrStatus: 'OCR_COMPLETED',
    };
  }

  async getOcrResult(userId: string, documentId: string) {
    const doc = await this.documentRepo.findById(documentId);
    if (!doc || doc.userId !== userId) {
      throw new NotFoundException(`Document with ID '${documentId}' not found or access denied.`);
    }

    const ocr = await this.prisma.client.ocrResult.findUnique({
      where: { documentId },
    });

    if (!ocr) {
      throw new NotFoundException(`No OCR result found for document '${documentId}'.`);
    }

    return {
      id: ocr.id,
      documentId: ocr.documentId,
      rawText: ocr.rawText,
      confidenceScore: ocr.confidenceScore,
      extractedData: ocr.extractedData as Record<string, any>,
      processedAt: ocr.processedAt ? ocr.processedAt.toISOString() : new Date().toISOString(),
    };
  }

  async confirmOcrResult(userId: string, documentId: string, confirmedFields: Record<string, any>) {
    const doc = await this.documentRepo.findById(documentId);
    if (!doc || doc.userId !== userId) {
      throw new NotFoundException(`Document with ID '${documentId}' not found or access denied.`);
    }

    const ocr = await this.prisma.client.ocrResult.findUnique({
      where: { documentId },
    });

    const existingData = (ocr?.extractedData as Record<string, any>) || {};
    const updatedData = {
      ...existingData,
      userConfirmedFields: confirmedFields,
      ocrStatus: 'CONFIRMED',
      userConfirmed: true,
      confirmedAt: new Date().toISOString(),
    };

    if (ocr) {
      await this.prisma.client.ocrResult.update({
        where: { documentId },
        data: { extractedData: updatedData },
      });
    }

    doc.updateVerificationStatus(VerificationStatus.PENDING);
    await this.documentRepo.update(doc);

    return {
      message: 'OCR extracted fields confirmed by citizen. Awaiting official verification.',
      documentId,
      confirmedData: updatedData,
      verificationStatus: 'PENDING_VERIFICATION',
    };
  }
}
