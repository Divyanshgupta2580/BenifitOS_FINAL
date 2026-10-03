import { BaseDomainEntity } from '../common/domain-entity.base';
import { DocumentType } from './scheme.entity';

export type EligibilityStatus =
  | 'NOT_ELIGIBLE'
  | 'PARTIALLY_ELIGIBLE'
  | 'INSUFFICIENT_DATA'
  | 'CLAIM_READY'
  | 'DOCUMENTS_PENDING'
  | 'APPLICATION_READY'
  | 'REVIEW_REQUIRED';

export interface RecommendationProps {
  id: string;
  citizenProfileId: string;
  schemeId: string;
  matchPercentage: number;
  estimatedBenefit: number;
  isEligible: boolean;
  status?: EligibilityStatus;
  criteriaMet: string[];
  missingCriteria: string[];
  missingDocuments: DocumentType[];
  aiValidation?: Record<string, any> | null;
  calculatedAt?: Date;
}

export class SchemeRecommendationEntity extends BaseDomainEntity<RecommendationProps> {
  private _citizenProfileId: string;
  private _schemeId: string;
  private _matchPercentage: number;
  private _estimatedBenefit: number;
  private _isEligible: boolean;
  private _status: EligibilityStatus;
  private _criteriaMet: string[];
  private _missingCriteria: string[];
  private _missingDocuments: DocumentType[];
  private _aiValidation?: Record<string, any> | null;

  constructor(props: RecommendationProps) {
    super(props.id, props.calculatedAt);
    this._citizenProfileId = props.citizenProfileId;
    this._schemeId = props.schemeId;
    this._matchPercentage = props.matchPercentage;
    this._estimatedBenefit = props.estimatedBenefit;
    this._isEligible = props.isEligible;
    this._status = props.status || (props.isEligible ? 'CLAIM_READY' : 'NOT_ELIGIBLE');
    this._criteriaMet = props.criteriaMet || [];
    this._missingCriteria = props.missingCriteria || [];
    this._missingDocuments = props.missingDocuments || [];
    this._aiValidation = props.aiValidation || null;
  }

  public get citizenProfileId(): string { return this._citizenProfileId; }
  public get schemeId(): string { return this._schemeId; }
  public get matchPercentage(): number { return this._matchPercentage; }
  public get estimatedBenefit(): number { return this._estimatedBenefit; }
  public get isEligible(): boolean { return this._isEligible; }
  public get status(): EligibilityStatus { return this._status; }
  public get criteriaMet(): string[] { return this._criteriaMet; }
  public get missingCriteria(): string[] { return this._missingCriteria; }
  public get missingDocuments(): DocumentType[] { return this._missingDocuments; }
  public get aiValidation(): Record<string, any> | null | undefined { return this._aiValidation; }
}

