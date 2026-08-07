import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';
import { IsString, IsOptional, IsObject, IsArray, IsNumber } from 'class-validator';

export class AiChatDto {
  @IsString()
  prompt: string;

  @IsOptional()
  @IsObject()
  context?: Record<string, any>;
}

export class ExplainRecommendationDto {
  @IsString()
  schemeTitle: string;

  @IsNumber()
  matchPercentage: number;

  @IsArray()
  criteriaMet: string[];

  @IsArray()
  missingCriteria: string[];
}

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  async chat(@Body() dto: AiChatDto) {
    const res = await this.aiService.chat(dto.prompt, dto.context);
    return {
      reply: res.content,
      provider: res.provider,
    };
  }

  @Post('explain-recommendation')
  async explainRecommendation(@Body() dto: ExplainRecommendationDto) {
    const explanation = await this.aiService.explainRecommendation(
      dto.schemeTitle,
      dto.matchPercentage,
      dto.criteriaMet,
      dto.missingCriteria,
    );
    return { explanation };
  }
}
