import { Controller, Get, Param, Query } from '@nestjs/common';
import { WelfareSchemeService } from './welfare.service';
import { SchemeCategory } from '../../domain/welfare/scheme.entity';
import { Public } from '../../common/decorators/roles.decorator';

@Controller('schemes')
export class WelfareSchemeController {
  constructor(private readonly schemeService: WelfareSchemeService) {}

  @Public()
  @Get()
  async getSchemes(@Query('category') category?: SchemeCategory, @Query('state') state?: string) {
    const schemes = await this.schemeService.getAllSchemes(category, state);
    return {
      count: schemes.length,
      schemes: schemes.map((s) => ({
        id: s.id,
        code: s.code,
        title: s.title,
        description: s.description,
        category: s.category,
        department: s.department,
        financialBenefit: s.financialBenefit,
        isCentralScheme: s.isCentralScheme,
      })),
    };
  }

  @Public()
  @Get(':id')
  async getSchemeById(@Param('id') id: string) {
    const scheme = await this.schemeService.getSchemeById(id);
    return {
      scheme: {
        id: scheme.id,
        code: scheme.code,
        title: scheme.title,
        description: scheme.description,
        category: scheme.category,
        department: scheme.department,
        financialBenefit: scheme.financialBenefit,
        eligibilityRules: scheme.eligibilityRules,
        requiredDocuments: scheme.requiredDocuments,
      },
    };
  }
}
