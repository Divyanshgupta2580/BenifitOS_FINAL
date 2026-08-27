import { Controller, Post, Get, Param } from '@nestjs/common';
import { OcrPipelineService } from './ocr.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('ocr')
export class OcrController {
  constructor(private readonly ocrService: OcrPipelineService) {}

  @Post('process/:documentId')
  async processOcr(@CurrentUser('sub') userId: string, @Param('documentId') documentId: string) {
    const result = await this.ocrService.processDocumentOcr(userId, documentId);
    return {
      message: 'OCR extraction completed successfully.',
      result,
    };
  }

  @Get(':documentId')
  async getOcrResult(@CurrentUser('sub') userId: string, @Param('documentId') documentId: string) {
    const result = await this.ocrService.getOcrResult(userId, documentId);
    return {
      result,
    };
  }
}
