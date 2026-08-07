import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IWelfareSchemeRepository } from '../../domain/welfare/welfare-repository.interface';
import { WelfareSchemeEntity, SchemeCategory } from '../../domain/welfare/scheme.entity';

@Injectable()
export class WelfareSchemeService {
  constructor(
    @Inject('IWelfareSchemeRepository') private readonly schemeRepo: IWelfareSchemeRepository,
  ) {}

  async getAllSchemes(category?: SchemeCategory, state?: string): Promise<WelfareSchemeEntity[]> {
    return await this.schemeRepo.findAllActive(category, state);
  }

  async getSchemeById(id: string): Promise<WelfareSchemeEntity> {
    const scheme = await this.schemeRepo.findById(id);
    if (!scheme) {
      throw new NotFoundException(`Welfare scheme with ID '${id}' not found.`);
    }
    return scheme;
  }
}
