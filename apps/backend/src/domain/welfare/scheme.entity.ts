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
  BIRTH_CERTIFICATE = 'BIRTH_CERTIFICATE',
  EDUCATIONAL_CERTIFICATE = 'EDUCATIONAL_CERTIFICATE',
  DISABILITY_CERTIFICATE = 'DISABILITY_CERTIFICATE',
  CASTE_CERTIFICATE = 'CASTE_CERTIFICATE',
  AADHAAR = 'AADHAAR',
  DRIVING_LICENSE = 'DRIVING_LICENSE',
  VOTER_ID = 'VOTER_ID',
}

export const DOCUMENT_TYPE_DISPLAY_NAMES: Record<DocumentType, string> = {
  [DocumentType.BIRTH_CERTIFICATE]: 'Birth Certificate',
  [DocumentType.EDUCATIONAL_CERTIFICATE]: 'Educational Certificate/Marksheet',
  [DocumentType.DISABILITY_CERTIFICATE]: 'Disability Certificate',
  [DocumentType.CASTE_CERTIFICATE]: 'Caste Certificate',
  [DocumentType.AADHAAR]: 'Aadhaar Card',
  [DocumentType.DRIVING_LICENSE]: 'Driving Licence',
  [DocumentType.VOTER_ID]: 'Voter ID',
};

export interface EligibilityRule {
  id: string;
  attributeKey: string;
  operator: 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'GREATER_EQUAL' | 'LESS_EQUAL' | 'IN' | 'CONTAINS';
  targetValue: string;
  isRequired: boolean;
  description: string;
}

export enum SchemeVerificationStatus {
  VERIFIED = 'VERIFIED',
  NEEDS_REVIEW = 'NEEDS_REVIEW',
  OUTDATED = 'OUTDATED',
  UNVERIFIED = 'UNVERIFIED',
}

export enum SchemeSourceType {
  CENTRAL_PORTAL = 'CENTRAL_PORTAL',
  MINISTRY_PORTAL = 'MINISTRY_PORTAL',
  STATE_PORTAL = 'STATE_PORTAL',
  MYSCHEME = 'MYSCHEME',
  NATIONAL_PORTAL = 'NATIONAL_PORTAL',
  OFFICIAL_PORTAL = 'OFFICIAL_PORTAL',
}

export enum BenefitType {
  DIRECT_BENEFIT_TRANSFER = 'DIRECT_BENEFIT_TRANSFER',
  HOUSING_GRANT = 'HOUSING_GRANT',
  SCHOLARSHIP = 'SCHOLARSHIP',
  HEALTH_COVER = 'HEALTH_COVER',
  SUBSIDIZED_LOAN = 'SUBSIDIZED_LOAN',
  MONTHLY_PENSION = 'MONTHLY_PENSION',
  SUBSIDY = 'SUBSIDY',
  OTHER = 'OTHER',
}

export enum ApplicationMode {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  HYBRID = 'HYBRID',
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
  // Provenance & Structured Fields
  sourceUrl?: string | null;
  sourceName?: string | null;
  sourceType?: SchemeSourceType | null;
  lastVerifiedAt?: Date | null;
  verificationStatus?: SchemeVerificationStatus;
  benefitType?: BenefitType | null;
  applicationUrl?: string | null;
  applicationMode?: ApplicationMode | null;
  applicationProcedure?: string | null;
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
  private _sourceUrl?: string | null;
  private _sourceName?: string | null;
  private _sourceType?: SchemeSourceType | null;
  private _lastVerifiedAt?: Date | null;
  private _verificationStatus: SchemeVerificationStatus;
  private _benefitType?: BenefitType | null;
  private _applicationUrl?: string | null;
  private _applicationMode?: ApplicationMode | null;
  private _applicationProcedure?: string | null;

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
    this._sourceUrl = props.sourceUrl;
    this._sourceName = props.sourceName;
    this._sourceType = props.sourceType;
    this._lastVerifiedAt = props.lastVerifiedAt;
    this._verificationStatus = props.verificationStatus || SchemeVerificationStatus.VERIFIED;
    this._benefitType = props.benefitType;
    this._applicationUrl = props.applicationUrl;
    this._applicationMode = props.applicationMode;
    this._applicationProcedure = props.applicationProcedure;
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
  public get sourceUrl(): string | null | undefined { return this._sourceUrl; }
  public get sourceName(): string | null | undefined { return this._sourceName; }
  public get sourceType(): SchemeSourceType | null | undefined { return this._sourceType; }
  public get lastVerifiedAt(): Date | null | undefined { return this._lastVerifiedAt; }
  public get verificationStatus(): SchemeVerificationStatus { return this._verificationStatus; }
  public get benefitType(): BenefitType | null | undefined { return this._benefitType; }
  public get applicationUrl(): string | null | undefined { return this._applicationUrl; }
  public get applicationMode(): ApplicationMode | null | undefined { return this._applicationMode; }
  public get applicationProcedure(): string | null | undefined { return this._applicationProcedure; }
}
