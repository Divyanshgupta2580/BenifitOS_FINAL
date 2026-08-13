import { Controller, Post, Param } from '@nestjs/common';
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
}
