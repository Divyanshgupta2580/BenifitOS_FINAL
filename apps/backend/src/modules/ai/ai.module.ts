import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { GeminiAiAdapter } from '../../infrastructure/ai/gemini-ai.adapter';
import { AiSafetyService } from '../../infrastructure/ai/ai-safety.service';
import { AiCacheService } from '../../infrastructure/ai/ai-cache.service';
import { AiDataMinimizerService } from '../../infrastructure/ai/ai-data-minimizer.service';

@Module({
  controllers: [AiController],
  providers: [AiService, GeminiAiAdapter, AiSafetyService, AiCacheService, AiDataMinimizerService],
  exports: [AiService, GeminiAiAdapter, AiSafetyService, AiCacheService, AiDataMinimizerService],
})
export class AiModule {}
