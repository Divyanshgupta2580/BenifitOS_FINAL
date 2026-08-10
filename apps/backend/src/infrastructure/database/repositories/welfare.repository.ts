import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IWelfareSchemeRepository, ISchemeRecommendationRepository } from '../../../domain/welfare/welfare-repository.interface';
import { Prisma } from '@prisma/client';
import { WelfareSchemeEntity, SchemeCategory, DocumentType } from '../../../domain/welfare/scheme.entity';
import { EligibilityRule } from '../../../domain/welfare/scheme.entity';
import { SchemeRecommendationEntity } from '../../../domain/welfare/recommendation.entity';

@Injectable()
export class WelfareSchemeRepositoryImpl implements IWelfareSchemeRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToEntity(data: Prisma.WelfareSchemeGetPayload<{ include: { eligibilityRules: true; requiredDocuments: true } }>): WelfareSchemeEntity {
    return new WelfareSchemeEntity({
      id: data.id,
      code: data.code,
      title: data.title,
      description: data.description,
      category: data.category as SchemeCategory,
      department: data.department,
      state: data.state,
      isCentralScheme: data.isCentralScheme,
      financialBenefit: data.financialBenefit,
      isActive: data.isActive,
      applicationDeadline: data.applicationDeadline,
      eligibilityRules: data.eligibilityRules ? data.eligibilityRules.map((r: Prisma.EligibilityCriteriaGetPayload<{}>) => ({
        id: r.id,
        attributeKey: r.attributeKey,
        operator: r.operator as EligibilityRule['operator'],
        targetValue: r.targetValue,
        isRequired: r.isRequired,
        description: r.description,
      })) : [],
      requiredDocuments: data.requiredDocuments ? data.requiredDocuments.map((d: Prisma.RequiredDocumentGetPayload<{}>) => d.documentType as DocumentType) : [],
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  async findById(id: string): Promise<WelfareSchemeEntity | null> {
    const record = await this.prisma.client.welfareScheme.findUnique({
      where: { id },
      include: { eligibilityRules: true, requiredDocuments: true },
    });
    return record ? this.mapToEntity(record) : null;
  }

  async findByCode(code: string): Promise<WelfareSchemeEntity | null> {
    const record = await this.prisma.client.welfareScheme.findUnique({
      where: { code },
      include: { eligibilityRules: true, requiredDocuments: true },
    });
    return record ? this.mapToEntity(record) : null;
  }

  async findAllActive(category?: SchemeCategory, state?: string): Promise<WelfareSchemeEntity[]> {
    const where: Prisma.WelfareSchemeWhereInput = { isActive: true };
    if (category) where.category = category;
    if (state) where.OR = [{ state }, { isCentralScheme: true }];

    const records = await this.prisma.client.welfareScheme.findMany({
      where,
      include: { eligibilityRules: true, requiredDocuments: true },
    });
    return records.map((r: Prisma.WelfareSchemeGetPayload<{ include: { eligibilityRules: true; requiredDocuments: true } }>) => this.mapToEntity(r));
  }

  async save(scheme: WelfareSchemeEntity): Promise<WelfareSchemeEntity> {
    const record = await this.prisma.client.welfareScheme.create({
      data: {
        id: scheme.id,
        code: scheme.code,
        title: scheme.title,
        description: scheme.description,
        category: scheme.category,
        department: scheme.department,
        state: scheme.state,
        isCentralScheme: scheme.isCentralScheme,
        financialBenefit: scheme.financialBenefit,
        isActive: scheme.isActive,
      },
      include: { eligibilityRules: true, requiredDocuments: true },
    });
    return this.mapToEntity(record);
  }

  async update(scheme: WelfareSchemeEntity): Promise<WelfareSchemeEntity> {
    const record = await this.prisma.client.welfareScheme.update({
      where: { id: scheme.id },
      data: {
        title: scheme.title,
        description: scheme.description,
        category: scheme.category,
        department: scheme.department,
        financialBenefit: scheme.financialBenefit,
        isActive: scheme.isActive,
      },
      include: { eligibilityRules: true, requiredDocuments: true },
    });
    return this.mapToEntity(record);
  }
}

@Injectable()
export class SchemeRecommendationRepositoryImpl implements ISchemeRecommendationRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToEntity(data: Prisma.SchemeRecommendationGetPayload<{}>): SchemeRecommendationEntity {
    return new SchemeRecommendationEntity({
      id: data.id,
      citizenProfileId: data.citizenProfileId,
      schemeId: data.schemeId,
      matchPercentage: data.matchPercentage,
      estimatedBenefit: data.estimatedBenefit,
      isEligible: data.isEligible,
      criteriaMet: data.criteriaMet,
      missingCriteria: data.missingCriteria,
      missingDocuments: data.missingDocuments as DocumentType[],
      calculatedAt: data.calculatedAt,
    });
  }

  async findByCitizenId(citizenProfileId: string): Promise<SchemeRecommendationEntity[]> {
    const records = await this.prisma.client.schemeRecommendation.findMany({
      where: { citizenProfileId },
    });
    return records.map((r: Prisma.SchemeRecommendationGetPayload<{}>) => this.mapToEntity(r));
  }

  async findByCitizenAndScheme(citizenProfileId: string, schemeId: string): Promise<SchemeRecommendationEntity | null> {
    const record = await this.prisma.client.schemeRecommendation.findUnique({
      where: { citizenProfileId_schemeId: { citizenProfileId, schemeId } },
    });
    return record ? this.mapToEntity(record) : null;
  }

  async saveMany(recommendations: SchemeRecommendationEntity[]): Promise<void> {
    for (const rec of recommendations) {
      await this.prisma.client.schemeRecommendation.upsert({
        where: { citizenProfileId_schemeId: { citizenProfileId: rec.citizenProfileId, schemeId: rec.schemeId } },
        create: {
          id: rec.id,
          citizenProfileId: rec.citizenProfileId,
          schemeId: rec.schemeId,
          matchPercentage: rec.matchPercentage,
          estimatedBenefit: rec.estimatedBenefit,
          isEligible: rec.isEligible,
          criteriaMet: rec.criteriaMet,
          missingCriteria: rec.missingCriteria,
          missingDocuments: rec.missingDocuments,
        },
        update: {
          matchPercentage: rec.matchPercentage,
          estimatedBenefit: rec.estimatedBenefit,
          isEligible: rec.isEligible,
          criteriaMet: rec.criteriaMet,
          missingCriteria: rec.missingCriteria,
          missingDocuments: rec.missingDocuments,
        },
      });
    }
  }

  async deleteForCitizen(citizenProfileId: string): Promise<void> {
    await this.prisma.client.schemeRecommendation.deleteMany({ where: { citizenProfileId } });
  }
}
