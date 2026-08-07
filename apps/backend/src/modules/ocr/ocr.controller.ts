import { Controller, Post, Param, Get } from '@nestjs/common';
import { OcrPipelineService } from './ocr.service';

@Controller('ocr')
export class OcrController {
  constructor(private readonly ocrService: OcrPipelineService) {}

  @Post('process/:documentId')
  async processOcr(@Param('documentId') documentId: string) {
    const result = await this.ocrService.processDocumentOcr(documentId);
    return {
      message: 'OCR extraction completed successfully.',
      result,
    };
  }
}
