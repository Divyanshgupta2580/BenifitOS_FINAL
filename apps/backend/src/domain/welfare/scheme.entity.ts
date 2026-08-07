import { BaseDomainEntity } from '../common/domain-entity.base';

export enum SchemeCategory {
  AGRICULTURE = 'AGRICULTURE',
  EDUCATION = 'EDUCATION',
  HEALTHCARE = 'HEALTHCARE',
  HOUSING = 'HOUSING',
  FINANCIAL_INCLUSION = 'FINANCIAL_INCLUSION',
  WOMEN_CHILD_DEVELOPMENT = 'WOMEN_CHILD_DEVELOPMENT',
  SOCIAL_SECURITY = 'SOCIAL_SECURITY',
  SKILL_DEVELOPMENT = 'SKILL_DEVELOPMENT',
  EMPLOYMENT = 'EMPLOYMENT',
  PENSION = 'PENSION',
}

export enum DocumentType {
  AADHAAR = 'AADHAAR',
  INCOME_CERTIFICATE = 'INCOME_CERTIFICATE',
  RATION_CARD = 'RATION_CARD',
  CASTE_CERTIFICATE = 'CASTE_CERTIFICATE',
  DISABILITY_CERTIFICATE = 'DISABILITY_CERTIFICATE',
  LAND_RECORD = 'LAND_RECORD',
  BANK_PASSBOOK = 'BANK_PASSBOOK',
  VOTER_ID = 'VOTER_ID',
  PAN_CARD = 'PAN_CARD',
  OTHER = 'OTHER',
}

export interface EligibilityRule {
  id: string;
  attributeKey: string;
  operator: 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'GREATER_EQUAL' | 'LESS_EQUAL' | 'IN' | 'CONTAINS';
  targetValue: string;
  isRequired: boolean;
  description: string;
}

export interface SchemeProps {
  id: string;
  code: string;
  title: string;
  description: string;
  category: SchemeCategory;
  department: string;
  state?: string | null;
  isCentralScheme: boolean;
  financialBenefit: number;
  isActive: boolean;
  applicationDeadline?: Date | null;
  eligibilityRules?: EligibilityRule[];
  requiredDocuments?: DocumentType[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class WelfareSchemeEntity extends BaseDomainEntity<SchemeProps> {
  private _code: string;
  private _title: string;
  private _description: string;
  private _category: SchemeCategory;
  private _department: string;
  private _state?: string | null;
  private _isCentralScheme: boolean;
  private _financialBenefit: number;
  private _isActive: boolean;
  private _applicationDeadline?: Date | null;
  private _eligibilityRules: EligibilityRule[];
  private _requiredDocuments: DocumentType[];

  constructor(props: SchemeProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this._code = props.code;
    this._title = props.title;
    this._description = props.description;
    this._category = props.category;
    this._department = props.department;
    this._state = props.state;
    this._isCentralScheme = props.isCentralScheme;
    this._financialBenefit = props.financialBenefit;
    this._isActive = props.isActive;
    this._applicationDeadline = props.applicationDeadline;
    this._eligibilityRules = props.eligibilityRules || [];
    this._requiredDocuments = props.requiredDocuments || [];
  }

  public get code(): string { return this._code; }
  public get title(): string { return this._title; }
  public get description(): string { return this._description; }
  public get category(): SchemeCategory { return this._category; }
  public get department(): string { return this._department; }
  public get state(): string | null | undefined { return this._state; }
  public get isCentralScheme(): boolean { return this._isCentralScheme; }
  public get financialBenefit(): number { return this._financialBenefit; }
  public get isActive(): boolean { return this._isActive; }
  public get applicationDeadline(): Date | null | undefined { return this._applicationDeadline; }
  public get eligibilityRules(): EligibilityRule[] { return this._eligibilityRules; }
  public get requiredDocuments(): DocumentType[] { return this._requiredDocuments; }
}
