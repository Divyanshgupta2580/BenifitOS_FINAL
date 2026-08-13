import { Controller, Get, Post, Delete, Param, UseInterceptors, UploadedFile, Body, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './document.service';
import { DocumentType, DOCUMENT_TYPE_DISPLAY_NAMES } from '../../domain/welfare/scheme.entity';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
      fileFilter: (_req, file, callback) => {
        const allowedMimetypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedMimetypes.includes(file.mimetype?.toLowerCase())) {
          return callback(
            new BadRequestException('Invalid file format. Only PDF, JPEG, PNG, and WEBP documents are allowed.'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
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
    const result = await this.documentService.uploadDocument(userId, documentType, file);
    const doc = result.document!;
    return {
      message: 'Document verified and stored successfully.',
      document: {
        id: doc.id,
        documentType: doc.documentType,
        displayName: DOCUMENT_TYPE_DISPLAY_NAMES[doc.documentType] || doc.documentType,
        fileName: doc.fileName,
        fileSize: doc.fileSize,
        verificationStatus: doc.verificationStatus,
      },
      classification: result.classification,
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
        displayName: DOCUMENT_TYPE_DISPLAY_NAMES[d.documentType] || d.documentType,
        fileName: d.fileName,
        fileSize: d.fileSize,
        verificationStatus: d.verificationStatus,
        uploadedAt: d.createdAt,
      })),
    };
  }

  @Get(':id')
  async getDocumentById(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    const doc = await this.documentService.getDocumentById(userId, id);
    return {
      document: {
        id: doc.id,
        documentType: doc.documentType,
        displayName: DOCUMENT_TYPE_DISPLAY_NAMES[doc.documentType] || doc.documentType,
        fileName: doc.fileName,
        fileSize: doc.fileSize,
        verificationStatus: doc.verificationStatus,
        ocrResult: doc.ocrResult,
      },
    };
  }

  @Delete(':id')
  async deleteDocument(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    await this.documentService.deleteDocument(userId, id);
    return {
      message: 'Document deleted successfully.',
    };
  }
}
