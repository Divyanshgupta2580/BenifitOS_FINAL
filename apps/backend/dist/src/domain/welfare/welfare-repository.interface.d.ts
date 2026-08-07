import { WelfareSchemeEntity, SchemeCategory } from './scheme.entity';
import { SchemeRecommendationEntity } from './recommendation.entity';
export interface IWelfareSchemeRepository {
    findById(id: string): Promise<WelfareSchemeEntity | null>;
    findByCode(code: string): Promise<WelfareSchemeEntity | null>;
    findAllActive(category?: SchemeCategory, state?: string): Promise<WelfareSchemeEntity[]>;
    save(scheme: WelfareSchemeEntity): Promise<WelfareSchemeEntity>;
    update(scheme: WelfareSchemeEntity): Promise<WelfareSchemeEntity>;
}
export interface ISchemeRecommendationRepository {
    findByCitizenId(citizenProfileId: string): Promise<SchemeRecommendationEntity[]>;
    findByCitizenAndScheme(citizenProfileId: string, schemeId: string): Promise<SchemeRecommendationEntity | null>;
    saveMany(recommendations: SchemeRecommendationEntity[]): Promise<void>;
    deleteForCitizen(citizenProfileId: string): Promise<void>;
}
