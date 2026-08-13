import { ApplicationService } from './application.service';
export declare class CreateDraftDto {
    schemeId: string;
    formData?: Record<string, any>;
    attachedDocumentIds?: string[];
}
export declare class UpdateApplicationDto {
    status?: string;
    formData?: Record<string, any>;
    attachedDocumentIds?: string[];
}
export declare class ApplicationController {
    private readonly applicationService;
    constructor(applicationService: ApplicationService);
    createApplication(userId: string, dto: CreateDraftDto): Promise<{
        message: string;
        application: {
            id: string;
            applicationNo: string;
            applicationNumber: string;
            schemeId: string;
            status: import("../../domain/application/application.entity").ApplicationStatus;
        };
    }>;
    createDraft(userId: string, dto: CreateDraftDto): Promise<{
        message: string;
        application: {
            id: string;
            applicationNo: string;
            applicationNumber: string;
            schemeId: string;
            status: import("../../domain/application/application.entity").ApplicationStatus;
        };
    }>;
    updateApplication(userId: string, id: string, dto: UpdateApplicationDto): Promise<{
        message: string;
        application: {
            id: string;
            applicationNo: string;
            applicationNumber: string;
            status: import("../../domain/application/application.entity").ApplicationStatus;
        };
    }>;
    submitApplication(userId: string, id: string): Promise<{
        message: string;
        application: {
            id: string;
            applicationNo: string;
            applicationNumber: string;
            status: import("../../domain/application/application.entity").ApplicationStatus;
            submittedAt: Date | null | undefined;
        };
    }>;
    getApplications(userId: string): Promise<{
        count: number;
        applications: {
            id: string;
            applicationNo: string;
            applicationNumber: string;
            schemeId: string;
            status: import("../../domain/application/application.entity").ApplicationStatus;
            submittedAt: Date | null | undefined;
            createdAt: Date;
        }[];
    }>;
    getApplicationById(userId: string, id: string): Promise<{
        application: {
            id: string;
            applicationNo: string;
            applicationNumber: string;
            schemeId: string;
            status: import("../../domain/application/application.entity").ApplicationStatus;
            formData: Record<string, any>;
            history: import("../../domain/application/application.entity").ApplicationStatusHistoryProps[];
            submittedAt: Date | null | undefined;
        };
    }>;
}
