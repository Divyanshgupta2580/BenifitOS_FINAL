import { IApplicationRepository } from '../../domain/application/application-repository.interface';
import { ApplicationEntity, ApplicationStatus } from '../../domain/application/application.entity';
export declare class ApplicationService {
    private readonly applicationRepo;
    constructor(applicationRepo: IApplicationRepository);
    createDraft(userId: string, schemeId: string, formData: Record<string, any>): Promise<ApplicationEntity>;
    submitApplication(userId: string, id: string): Promise<ApplicationEntity>;
    updateApplication(userId: string, id: string, data: {
        status?: ApplicationStatus;
        formData?: Record<string, any>;
    }): Promise<ApplicationEntity>;
    getUserApplications(userId: string): Promise<ApplicationEntity[]>;
    getApplicationById(userId: string, id: string): Promise<ApplicationEntity>;
}
