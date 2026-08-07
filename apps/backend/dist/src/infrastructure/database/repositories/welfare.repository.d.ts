import { PrismaService } from '../prisma.service';
import { IWelfareSchemeRepository, ISchemeRecommendationRepository } from '../../../domain/welfare/welfare-repository.interface';
import { WelfareSchemeEntity, SchemeCategory } from '../../../domain/welfare/scheme.entity';
import { SchemeRecommendationEntity } from '../../../domain/welfare/recommendation.entity';
export declare class WelfareSchemeRepositoryImpl implements IWelfareSchemeRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private mapToEntity;
    findById(id: string): Promise<WelfareSchemeEntity | null>;
    findByCode(code: string): Promise<WelfareSchemeEntity | null>;
    findAllActive(category?: SchemeCategory, state?: string): Promise<WelfareSchemeEntity[]>;
    save(scheme: WelfareSchemeEntity): Promise<WelfareSchemeEntity>;
    update(scheme: WelfareSchemeEntity): Promise<WelfareSchemeEntity>;
}
export declare class SchemeRecommendationRepositoryImpl implements ISchemeRecommendationRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private mapToEntity;
    findByCitizenId(citizenProfileId: string): Promise<SchemeRecommendationEntity[]>;
    findByCitizenAndScheme(citizenProfileId: string, schemeId: string): Promise<SchemeRecommendationEntity | null>;
    saveMany(recommendations: SchemeRecommendationEntity[]): Promise<void>;
    deleteForCitizen(citizenProfileId: string): Promise<void>;
}
