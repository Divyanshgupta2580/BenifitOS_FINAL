import { IApplicationRepository } from '../../domain/application/application-repository.interface';
import { ApplicationEntity } from '../../domain/application/application.entity';
export declare class ApplicationService {
    private readonly applicationRepo;
    constructor(applicationRepo: IApplicationRepository);
    createDraft(userId: string, schemeId: string, formData: Record<string, any>): Promise<ApplicationEntity>;
    submitApplication(id: string): Promise<ApplicationEntity>;
    getUserApplications(userId: string): Promise<ApplicationEntity[]>;
    getApplicationById(id: string): Promise<ApplicationEntity>;
}
