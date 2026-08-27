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
}

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  async chat(@Body() dto: AiChatDto, @CurrentUser('sub') userId?: string) {
    const res = await this.aiService.chat(dto.prompt, dto.context, userId);
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

  @Post('scheme-instructions')
  async getSchemeInstructions(@Body() dto: SchemeInstructionsDto) {
    return await this.aiService.getSchemeInstructions(dto.schemeTitle, dto.schemeId);
  }
}
