import { ICitizenRepository } from '../../domain/citizen/citizen-repository.interface';
import { CitizenEntity } from '../../domain/citizen/citizen.entity';
import { UpdateCitizenProfileDto } from './dto/citizen.dto';
import { ISchemeRecommendationRepository } from '../../domain/welfare/welfare-repository.interface';
export declare class CitizenService {
    private readonly citizenRepo;
    private readonly recommendationRepo?;
    constructor(citizenRepo: ICitizenRepository, recommendationRepo?: ISchemeRecommendationRepository | undefined);
    getProfileByUserId(userId: string): Promise<CitizenEntity>;
    updateProfile(userId: string, dto: UpdateCitizenProfileDto): Promise<CitizenEntity>;
}
