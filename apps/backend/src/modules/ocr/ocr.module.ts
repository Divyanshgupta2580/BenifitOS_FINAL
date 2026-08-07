import { Module } from '@nestjs/common';
import { OcrController } from './ocr.controller';
import { OcrPipelineService } from './ocr.service';
import { GeminiAiAdapter } from '../../infrastructure/ai/gemini-ai.adapter';
import { LocalStorageAdapter } from '../../infrastructure/storage/local-storage.adapter';
import { DocumentRepositoryImpl } from '../../infrastructure/database/repositories/document.repository';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Module({
  controllers: [OcrController],
  providers: [
    OcrPipelineService,
    GeminiAiAdapter,
    LocalStorageAdapter,
    PrismaService,
    { provide: 'IDocumentRepository', useClass: DocumentRepositoryImpl },
  ],
  exports: [OcrPipelineService],
})
export class OcrModule {}
