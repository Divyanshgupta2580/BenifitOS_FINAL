import { Module } from '@nestjs/common';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { DocumentClassificationService } from './document-classification.service';
import { GeminiAiAdapter } from '../../infrastructure/ai/gemini-ai.adapter';
import { DocumentRepositoryImpl } from '../../infrastructure/database/repositories/document.repository';
import { LocalStorageAdapter } from '../../infrastructure/storage/local-storage.adapter';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Module({
  controllers: [DocumentController],
  providers: [
    DocumentService,
    DocumentClassificationService,
    GeminiAiAdapter,
    LocalStorageAdapter,
    PrismaService,
    { provide: 'IDocumentRepository', useClass: DocumentRepositoryImpl },
  ],
  exports: [DocumentService, DocumentClassificationService, LocalStorageAdapter, 'IDocumentRepository'],
})
export class DocumentModule {}
