import { ApplicationService } from './application.service';
export declare class CreateDraftDto {
    schemeId: string;
    formData: Record<string, any>;
}
export declare class ApplicationController {
    private readonly applicationService;
    constructor(applicationService: ApplicationService);
    createDraft(userId: string, dto: CreateDraftDto): Promise<{
        message: string;
        application: {
            id: string;
            applicationNo: string;
            schemeId: string;
            status: import("../../domain/application/application.entity").ApplicationStatus;
        };
    }>;
    submitApplication(id: string): Promise<{
        message: string;
        application: {
            id: string;
            applicationNo: string;
            status: import("../../domain/application/application.entity").ApplicationStatus;
            submittedAt: Date | null | undefined;
        };
    }>;
    getApplications(userId: string): Promise<{
        count: number;
        applications: {
            id: string;
            applicationNo: string;
            schemeId: string;
            status: import("../../domain/application/application.entity").ApplicationStatus;
            submittedAt: Date | null | undefined;
            createdAt: Date;
        }[];
    }>;
    getApplicationById(id: string): Promise<{
        application: {
            id: string;
            applicationNo: string;
            schemeId: string;
            status: import("../../domain/application/application.entity").ApplicationStatus;
            formData: Record<string, any>;
            history: import("../../domain/application/application.entity").ApplicationStatusHistoryProps[];
            submittedAt: Date | null | undefined;
        };
    }>;
}
