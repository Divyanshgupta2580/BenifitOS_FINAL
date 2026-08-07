import { Controller, Get, Post, Param, UseInterceptors, UploadedFile, Body, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './document.service';
import { DocumentType } from '../../domain/welfare/scheme.entity';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @CurrentUser('sub') userId: string,
    @Body('documentType') documentType: DocumentType,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded.');
    }
    if (!documentType) {
      throw new BadRequestException('Document type is required.');
    }
    const doc = await this.documentService.uploadDocument(userId, documentType, file);
    return {
      message: 'Document uploaded successfully.',
      document: {
        id: doc.id,
        documentType: doc.documentType,
        fileName: doc.fileName,
        fileSize: doc.fileSize,
        verificationStatus: doc.verificationStatus,
      },
    };
  }

  @Get()
  async getDocuments(@CurrentUser('sub') userId: string) {
    const documents = await this.documentService.getUserDocuments(userId);
    return {
      count: documents.length,
      documents: documents.map((d) => ({
        id: d.id,
        documentType: d.documentType,
        fileName: d.fileName,
        fileSize: d.fileSize,
        verificationStatus: d.verificationStatus,
        uploadedAt: d.createdAt,
      })),
    };
  }

  @Get(':id')
  async getDocumentById(@Param('id') id: string) {
    const doc = await this.documentService.getDocumentById(id);
    return {
      document: {
        id: doc.id,
        documentType: doc.documentType,
        fileName: doc.fileName,
        fileSize: doc.fileSize,
        verificationStatus: doc.verificationStatus,
        ocrResult: doc.ocrResult,
      },
    };
  }
}
