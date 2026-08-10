import { BaseDomainEntity } from '../common/domain-entity.base';

export enum ApplicationStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  ACTION_REQUIRED = 'ACTION_REQUIRED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
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

export class ApplicationEntity extends BaseDomainEntity<ApplicationProps> {
  private _applicationNo: string;
  private _userId: string;
  private _schemeId: string;
  private _status: ApplicationStatus;
  private _formData: Record<string, any>;
  private _remarks?: string | null;
  private _documentIds: string[];
  private _history: ApplicationStatusHistoryProps[];
  private _submittedAt?: Date | null;

  constructor(props: ApplicationProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this._applicationNo = props.applicationNo;
    this._userId = props.userId;
    this._schemeId = props.schemeId;
    this._status = props.status;
    this._formData = props.formData;
    this._remarks = props.remarks;
    this._documentIds = props.documentIds || [];
    this._history = props.history || [];
    this._submittedAt = props.submittedAt;
  }

  public get applicationNo(): string { return this._applicationNo; }
  public get userId(): string { return this._userId; }
  public get schemeId(): string { return this._schemeId; }
  public get status(): ApplicationStatus { return this._status; }
  public get formData(): Record<string, any> { return this._formData; }
  public get remarks(): string | null | undefined { return this._remarks; }
  public get documentIds(): string[] { return this._documentIds; }
  public get history(): ApplicationStatusHistoryProps[] { return this._history; }
  public get submittedAt(): Date | null | undefined { return this._submittedAt; }

  public submit(): void {
    if (this._status !== ApplicationStatus.DRAFT) {
      throw new Error('Only DRAFT applications can be submitted.');
    }
    this._status = ApplicationStatus.SUBMITTED;
    this._submittedAt = new Date();
    this._updatedAt = new Date();
  }

  public transitionTo(newStatus: ApplicationStatus, changedById: string, note?: string): void {
    const oldStatus = this._status;
    this._status = newStatus;
    this._history.push({
      id: `hist-${Date.now()}`,
      applicationId: this.id,
      fromStatus: oldStatus,
      toStatus: newStatus,
      changedById,
      note,
      changedAt: new Date(),
    });
    this._updatedAt = new Date();
  }
}
