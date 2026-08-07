import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { GeminiAiAdapter } from '../../infrastructure/ai/gemini-ai.adapter';
import { AiSafetyService } from '../../infrastructure/ai/ai-safety.service';

@Module({
  controllers: [AiController],
  providers: [AiService, GeminiAiAdapter, AiSafetyService],
  exports: [AiService, GeminiAiAdapter, AiSafetyService],
})
export class AiModule {}
