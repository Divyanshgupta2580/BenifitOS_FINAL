import { Injectable, Inject, NotFoundException, OnModuleInit, Logger } from '@nestjs/common';
import { IWelfareSchemeRepository } from '../../domain/welfare/welfare-repository.interface';
import { WelfareSchemeEntity, SchemeCategory } from '../../domain/welfare/scheme.entity';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { CANONICAL_WELFARE_SCHEMES } from '../../cron/daily-maintenance.cron';

@Injectable()
export class WelfareSchemeService implements OnModuleInit {
  private readonly logger = new Logger(WelfareSchemeService.name);

  constructor(
    @Inject('IWelfareSchemeRepository') private readonly schemeRepo: IWelfareSchemeRepository,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit() {
    try {
      this.logger.log('Synchronizing canonical government welfare schemes catalog into database...');
      for (const schemeDef of CANONICAL_WELFARE_SCHEMES) {
        const existing = await this.prisma.client.welfareScheme.findUnique({
          where: { code: schemeDef.code },
        });

        if (!existing) {
          await this.prisma.client.welfareScheme.create({
            data: {
              id: schemeDef.id,
              code: schemeDef.code,
              title: schemeDef.title,
              description: schemeDef.description,
              category: schemeDef.category,
              department: schemeDef.department,
              state: schemeDef.state || null,
              isCentralScheme: schemeDef.isCentralScheme,
              financialBenefit: schemeDef.financialBenefit,
              isActive: schemeDef.isActive,
              eligibilityRules: {
                create: schemeDef.rules.map((r) => ({
                  attributeKey: r.attributeKey,
                  operator: r.operator,
                  targetValue: r.targetValue,
                  isRequired: r.isRequired,
                  description: r.description,
                })),
              },
              requiredDocuments: {
                create: schemeDef.documents.map((d) => ({
                  documentType: d.documentType,
                  isMandatory: d.isMandatory,
                  description: d.description,
                })),
              },
            },
          });
        } else {
          // Idempotently update scheme metadata and synchronize eligibility rules
          await this.prisma.client.$transaction([
            this.prisma.client.welfareScheme.update({
              where: { id: existing.id },
              data: {
                title: schemeDef.title,
                description: schemeDef.description,
                category: schemeDef.category,
                department: schemeDef.department,
                state: schemeDef.state || null,
                isCentralScheme: schemeDef.isCentralScheme,
                financialBenefit: schemeDef.financialBenefit,
                isActive: schemeDef.isActive,
              },
            }),
            this.prisma.client.eligibilityCriteria.deleteMany({ where: { schemeId: existing.id } }),
            this.prisma.client.eligibilityCriteria.createMany({
              data: schemeDef.rules.map((r) => ({
                schemeId: existing.id,
                attributeKey: r.attributeKey,
                operator: r.operator,
                targetValue: r.targetValue,
                isRequired: r.isRequired,
                description: r.description,
              })),
            }),
            this.prisma.client.requiredDocument.deleteMany({ where: { schemeId: existing.id } }),
            this.prisma.client.requiredDocument.createMany({
              data: schemeDef.documents.map((d) => ({
                schemeId: existing.id,
                documentType: d.documentType,
                isMandatory: d.isMandatory,
                description: d.description,
              })),
            }),
          ]);
        }
      }
      this.logger.log('✅ Welfare schemes catalog and eligibility rules synchronized successfully.');
    } catch (err: any) {
      this.logger.warn(`Welfare scheme catalog sync notice: ${err?.message}`);
    }
  }

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
