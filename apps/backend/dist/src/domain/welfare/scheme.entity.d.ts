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
    AADHAAR = "AADHAAR",
    INCOME_CERTIFICATE = "INCOME_CERTIFICATE",
    RATION_CARD = "RATION_CARD",
    CASTE_CERTIFICATE = "CASTE_CERTIFICATE",
    DISABILITY_CERTIFICATE = "DISABILITY_CERTIFICATE",
    LAND_RECORD = "LAND_RECORD",
    BANK_PASSBOOK = "BANK_PASSBOOK",
    VOTER_ID = "VOTER_ID",
    PAN_CARD = "PAN_CARD",
    OTHER = "OTHER"
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
}
