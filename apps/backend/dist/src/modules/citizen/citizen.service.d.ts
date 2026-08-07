import { ICitizenRepository } from '../../domain/citizen/citizen-repository.interface';
import { CitizenEntity } from '../../domain/citizen/citizen.entity';
import { UpdateCitizenProfileDto } from './dto/citizen.dto';
export declare class CitizenService {
    private readonly citizenRepo;
    constructor(citizenRepo: ICitizenRepository);
    getProfileByUserId(userId: string): Promise<CitizenEntity>;
    updateProfile(userId: string, dto: UpdateCitizenProfileDto): Promise<CitizenEntity>;
}
