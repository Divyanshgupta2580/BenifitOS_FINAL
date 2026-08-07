import { PrismaService } from '../prisma.service';
import { ICitizenRepository } from '../../../domain/citizen/citizen-repository.interface';
import { CitizenEntity } from '../../../domain/citizen/citizen.entity';
export declare class CitizenRepositoryImpl implements ICitizenRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private mapToEntity;
    findById(id: string): Promise<CitizenEntity | null>;
    findByUserId(userId: string): Promise<CitizenEntity | null>;
    findByAadhaarHash(aadhaarHash: string): Promise<CitizenEntity | null>;
    save(citizen: CitizenEntity): Promise<CitizenEntity>;
    update(citizen: CitizenEntity): Promise<CitizenEntity>;
    delete(id: string): Promise<void>;
}
