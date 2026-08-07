import { BaseDomainEntity } from '../common/domain-entity.base';
import { DocumentType } from './scheme.entity';

export interface RecommendationProps {
  id: string;
  citizenProfileId: string;
  schemeId: string;
  matchPercentage: number;
  estimatedBenefit: number;
  isEligible: boolean;
  criteriaMet: string[];
  missingCriteria: string[];
  missingDocuments: DocumentType[];
  calculatedAt?: Date;
}

export class SchemeRecommendationEntity extends BaseDomainEntity<RecommendationProps> {
  private _citizenProfileId: string;
  private _schemeId: string;
  private _matchPercentage: number;
  private _estimatedBenefit: number;
  private _isEligible: boolean;
  private _criteriaMet: string[];
  private _missingCriteria: string[];
  private _missingDocuments: DocumentType[];

  constructor(props: RecommendationProps) {
    super(props.id, props.calculatedAt);
    this._citizenProfileId = props.citizenProfileId;
    this._schemeId = props.schemeId;
    this._matchPercentage = props.matchPercentage;
    this._estimatedBenefit = props.estimatedBenefit;
    this._isEligible = props.isEligible;
    this._criteriaMet = props.criteriaMet || [];
    this._missingCriteria = props.missingCriteria || [];
    this._missingDocuments = props.missingDocuments || [];
  }

  public get citizenProfileId(): string { return this._citizenProfileId; }
  public get schemeId(): string { return this._schemeId; }
  public get matchPercentage(): number { return this._matchPercentage; }
  public get estimatedBenefit(): number { return this._estimatedBenefit; }
  public get isEligible(): boolean { return this._isEligible; }
  public get criteriaMet(): string[] { return this._criteriaMet; }
  public get missingCriteria(): string[] { return this._missingCriteria; }
  public get missingDocuments(): DocumentType[] { return this._missingDocuments; }
}
