import { ICitizenRepository } from '../../domain/citizen/citizen-repository.interface';
import { CitizenEntity } from '../../domain/citizen/citizen.entity';
import { UpdateCitizenProfileDto } from './dto/citizen.dto';
import { ISchemeRecommendationRepository } from '../../domain/welfare/welfare-repository.interface';
import { AiCacheService } from '../../infrastructure/ai/ai-cache.service';
export declare class CitizenService {
    private readonly citizenRepo;
    private readonly recommendationRepo?;
    private readonly aiCacheService?;
    constructor(citizenRepo: ICitizenRepository, recommendationRepo?: ISchemeRecommendationRepository | undefined, aiCacheService?: AiCacheService | undefined);
    getProfileByUserId(userId: string): Promise<CitizenEntity>;
    updateProfile(userId: string, dto: UpdateCitizenProfileDto): Promise<CitizenEntity>;
}
