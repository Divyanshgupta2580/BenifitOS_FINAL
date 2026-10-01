import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';
import { IsString, IsOptional, IsObject, IsArray, IsNumber } from 'class-validator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

export class AiChatDto {
  @IsString()
  prompt: string;

  @IsOptional()
  @IsObject()
  context?: Record<string, any>;

  @IsOptional()
  @IsString()
  language?: string;
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

  @IsOptional()
  @IsString()
  language?: string;
}

export class SchemeInstructionsDto {
  @IsString()
  schemeTitle: string;

  @IsOptional()
  @IsString()
  schemeId?: string;

  @IsOptional()
  @IsString()
  language?: string;
}

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  async chat(@Body() dto: AiChatDto, @CurrentUser('sub') userId?: string) {
    const res = await this.aiService.chat(dto.prompt, dto.context, userId, dto.language);
    return {
      reply: res.content,
      provider: 'AI Copilot',
      isCached: res.isCached,
      sources: res.sources || [],
    };
  }

  @Post('explain-recommendation')
  async explainRecommendation(@Body() dto: ExplainRecommendationDto) {
    const res = await this.aiService.explainRecommendation(
      dto.schemeTitle,
      dto.matchPercentage,
      dto.criteriaMet,
      dto.missingCriteria,
      dto.language,
    );
    return {
      explanation: res.explanation,
      isCached: res.isCached,
      provider: 'AI Copilot',
    };
  }

  @Post('scheme-instructions')
  async getSchemeInstructions(@Body() dto: SchemeInstructionsDto) {
    return await this.aiService.getSchemeInstructions(dto.schemeTitle, dto.schemeId, dto.language);
  }
}
