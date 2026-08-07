import { ApplicationEntity, ApplicationStatus } from './application.entity';
export interface IApplicationRepository {
    findById(id: string): Promise<ApplicationEntity | null>;
    findByApplicationNo(applicationNo: string): Promise<ApplicationEntity | null>;
    findByUserId(userId: string): Promise<ApplicationEntity[]>;
    findBySchemeId(schemeId: string): Promise<ApplicationEntity[]>;
    findByStatus(status: ApplicationStatus): Promise<ApplicationEntity[]>;
    save(application: ApplicationEntity): Promise<ApplicationEntity>;
    update(application: ApplicationEntity): Promise<ApplicationEntity>;
}
