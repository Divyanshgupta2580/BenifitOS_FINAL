import { BaseDomainEntity } from '../common/domain-entity.base';
export declare enum SchemeCategory {
    AGRICULTURE = "AGRICULTURE",
    EDUCATION = "EDUCATION",
    HEALTHCARE = "HEALTHCARE",
    HOUSING = "HOUSING",
    FINANCIAL_INCLUSION = "FINANCIAL_INCLUSION",
    WOMEN_CHILD_DEVELOPMENT = "WOMEN_CHILD_DEVELOPMENT",
    SOCIAL_SECURITY = "SOCIAL_SECURITY",
    SKILL_DEVELOPMENT = "SKILL_DEVELOPMENT",
    EMPLOYMENT = "EMPLOYMENT",
    PENSION = "PENSION"
}
export declare enum DocumentType {
    BIRTH_CERTIFICATE = "BIRTH_CERTIFICATE",
    EDUCATIONAL_CERTIFICATE = "EDUCATIONAL_CERTIFICATE",
    DISABILITY_CERTIFICATE = "DISABILITY_CERTIFICATE",
    CASTE_CERTIFICATE = "CASTE_CERTIFICATE",
    AADHAAR = "AADHAAR",
    DRIVING_LICENSE = "DRIVING_LICENSE",
    VOTER_ID = "VOTER_ID",
    INCOME_CERTIFICATE = "INCOME_CERTIFICATE",
    RATION_CARD = "RATION_CARD",
    LAND_RECORD = "LAND_RECORD",
    BANK_PASSBOOK = "BANK_PASSBOOK",
    PAN_CARD = "PAN_CARD",
    OTHER = "OTHER"
}
export declare const DOCUMENT_TYPE_DISPLAY_NAMES: Record<DocumentType, string>;
export interface EligibilityRule {
    id: string;
    attributeKey: string;
    operator: 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'GREATER_EQUAL' | 'LESS_EQUAL' | 'IN' | 'CONTAINS';
    targetValue: string;
    isRequired: boolean;
    description: string;
}
export declare enum SchemeVerificationStatus {
    VERIFIED = "VERIFIED",
    NEEDS_REVIEW = "NEEDS_REVIEW",
    OUTDATED = "OUTDATED",
    UNVERIFIED = "UNVERIFIED"
}
export declare enum SchemeSourceType {
    CENTRAL_PORTAL = "CENTRAL_PORTAL",
    MINISTRY_PORTAL = "MINISTRY_PORTAL",
    STATE_PORTAL = "STATE_PORTAL",
    MYSCHEME = "MYSCHEME",
    NATIONAL_PORTAL = "NATIONAL_PORTAL",
    OFFICIAL_PORTAL = "OFFICIAL_PORTAL"
}
export declare enum BenefitType {
    DIRECT_BENEFIT_TRANSFER = "DIRECT_BENEFIT_TRANSFER",
    HOUSING_GRANT = "HOUSING_GRANT",
    SCHOLARSHIP = "SCHOLARSHIP",
    HEALTH_COVER = "HEALTH_COVER",
    SUBSIDIZED_LOAN = "SUBSIDIZED_LOAN",
    COLLATERAL_FREE_LOAN = "COLLATERAL_FREE_LOAN",
    MONTHLY_PENSION = "MONTHLY_PENSION",
    SUBSIDY = "SUBSIDY",
    OTHER = "OTHER"
}
export declare enum ApplicationMode {
    ONLINE = "ONLINE",
    OFFLINE = "OFFLINE",
    HYBRID = "HYBRID"
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
export declare class WelfareSchemeEntity extends BaseDomainEntity<SchemeProps> {
    private _code;
    private _title;
    private _description;
    private _category;
    private _department;
    private _state?;
    private _isCentralScheme;
    private _financialBenefit;
    private _isActive;
    private _applicationDeadline?;
    private _eligibilityRules;
    private _requiredDocuments;
    private _sourceUrl?;
    private _sourceName?;
    private _sourceType?;
    private _lastVerifiedAt?;
    private _verificationStatus;
    private _benefitType?;
    private _applicationUrl?;
    private _applicationMode?;
    private _applicationProcedure?;
    constructor(props: SchemeProps);
    get code(): string;
    get title(): string;
    get description(): string;
    get category(): SchemeCategory;
    get department(): string;
    get state(): string | null | undefined;
    get isCentralScheme(): boolean;
    get financialBenefit(): number;
    get isActive(): boolean;
    get applicationDeadline(): Date | null | undefined;
    get eligibilityRules(): EligibilityRule[];
    get requiredDocuments(): DocumentType[];
    get sourceUrl(): string | null | undefined;
    get sourceName(): string | null | undefined;
    get sourceType(): SchemeSourceType | null | undefined;
    get lastVerifiedAt(): Date | null | undefined;
    get verificationStatus(): SchemeVerificationStatus;
    get benefitType(): BenefitType | null | undefined;
    get applicationUrl(): string | null | undefined;
    get applicationMode(): ApplicationMode | null | undefined;
    get applicationProcedure(): string | null | undefined;
}
