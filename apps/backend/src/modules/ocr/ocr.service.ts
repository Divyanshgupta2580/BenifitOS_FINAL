import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IDocumentRepository } from '../../domain/document/document-repository.interface';
import { GeminiAiAdapter } from '../../infrastructure/ai/gemini-ai.adapter';
import { LocalStorageAdapter } from '../../infrastructure/storage/local-storage.adapter';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class OcrPipelineService {
  constructor(
    @Inject('IDocumentRepository') private readonly documentRepo: IDocumentRepository,
    private readonly geminiAdapter: GeminiAiAdapter,
    private readonly storageAdapter: LocalStorageAdapter,
    private readonly prisma: PrismaService,
  ) {}

  async processDocumentOcr(documentId: string): Promise<{ documentId: string; confidenceScore: number; extractedFields: Record<string, any> }> {
    const doc = await this.documentRepo.findById(documentId);
    if (!doc) {
      throw new NotFoundException(`Document with ID '${documentId}' not found.`);
    }

    const fileBuffer = await this.storageAdapter.downloadFile(doc.storagePath);
    const ocrResult = await this.geminiAdapter.extractDocumentData(fileBuffer, doc.mimeType, doc.documentType);

    await this.prisma.ocrResult.upsert({
      where: { documentId: doc.id },
      create: {
        documentId: doc.id,
        rawText: ocrResult.rawText,
        confidenceScore: ocrResult.confidenceScore,
        extractedData: ocrResult.extractedFields,
      },
      update: {
        rawText: ocrResult.rawText,
        confidenceScore: ocrResult.confidenceScore,
        extractedData: ocrResult.extractedFields,
      },
    });

    return {
      documentId: doc.id,
      confidenceScore: ocrResult.confidenceScore,
      extractedFields: ocrResult.extractedFields,
    };
  }
}
