import { PrismaService } from '../prisma.service';
import { IApplicationRepository } from '../../../domain/application/application-repository.interface';
import { ApplicationEntity, ApplicationStatus } from '../../../domain/application/application.entity';
export declare class ApplicationRepositoryImpl implements IApplicationRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private mapToEntity;
    findById(id: string): Promise<ApplicationEntity | null>;
    findByApplicationNo(applicationNo: string): Promise<ApplicationEntity | null>;
    findByUserId(userId: string): Promise<ApplicationEntity[]>;
    findBySchemeId(schemeId: string): Promise<ApplicationEntity[]>;
    findByStatus(status: ApplicationStatus): Promise<ApplicationEntity[]>;
    save(application: ApplicationEntity): Promise<ApplicationEntity>;
    update(application: ApplicationEntity): Promise<ApplicationEntity>;
}
