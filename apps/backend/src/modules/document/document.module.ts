import { Module } from '@nestjs/common';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { DocumentRepositoryImpl } from '../../infrastructure/database/repositories/document.repository';
import { LocalStorageAdapter } from '../../infrastructure/storage/local-storage.adapter';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Module({
  controllers: [DocumentController],
  providers: [
    DocumentService,
    LocalStorageAdapter,
    PrismaService,
    { provide: 'IDocumentRepository', useClass: DocumentRepositoryImpl },
  ],
  exports: [DocumentService, LocalStorageAdapter, 'IDocumentRepository'],
})
export class DocumentModule {}
