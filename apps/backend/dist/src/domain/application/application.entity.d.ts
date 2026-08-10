import { BaseDomainEntity } from '../common/domain-entity.base';
export declare enum ApplicationStatus {
    DRAFT = "DRAFT",
    SUBMITTED = "SUBMITTED",
    UNDER_REVIEW = "UNDER_REVIEW",
    ACTION_REQUIRED = "ACTION_REQUIRED",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    WITHDRAWN = "WITHDRAWN"
}
export interface ApplicationStatusHistoryProps {
    id: string;
    applicationId: string;
    fromStatus: ApplicationStatus;
    toStatus: ApplicationStatus;
    changedById: string;
    note?: string | null;
    changedAt: Date;
}
export interface ApplicationProps {
    id: string;
    applicationNo: string;
    userId: string;
    schemeId: string;
    status: ApplicationStatus;
    formData: Record<string, unknown>;
    remarks?: string | null;
    documentIds?: string[];
    history?: ApplicationStatusHistoryProps[];
    submittedAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare class ApplicationEntity extends BaseDomainEntity<ApplicationProps> {
    private _applicationNo;
    private _userId;
    private _schemeId;
    private _status;
    private _formData;
    private _remarks?;
    private _documentIds;
    private _history;
    private _submittedAt?;
    constructor(props: ApplicationProps);
    get applicationNo(): string;
    get userId(): string;
    get schemeId(): string;
    get status(): ApplicationStatus;
    get formData(): Record<string, any>;
    get remarks(): string | null | undefined;
    get documentIds(): string[];
    get history(): ApplicationStatusHistoryProps[];
    get submittedAt(): Date | null | undefined;
    submit(): void;
    transitionTo(newStatus: ApplicationStatus, changedById: string, note?: string): void;
}
