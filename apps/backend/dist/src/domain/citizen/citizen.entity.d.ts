import { BaseDomainEntity } from '../common/domain-entity.base';
export declare enum Gender {
    MALE = "MALE",
    FEMALE = "FEMALE",
    TRANSGENDER = "TRANSGENDER",
    OTHER = "OTHER"
}
export declare enum SocialCategory {
    GENERAL = "GENERAL",
    OBC = "OBC",
    SC = "SC",
    ST = "ST",
    EWS = "EWS"
}
export declare enum MaritalStatus {
    SINGLE = "SINGLE",
    MARRIED = "MARRIED",
    DIVORCED = "DIVORCED",
    WIDOWED = "WIDOWED",
    SEPARATED = "SEPARATED"
}
export declare enum EmploymentStatus {
    EMPLOYED = "EMPLOYED",
    UNEMPLOYED = "UNEMPLOYED",
    SELF_EMPLOYED = "SELF_EMPLOYED",
    STUDENT = "STUDENT",
    RETIRED = "RETIRED",
    FARMER = "FARMER",
    DAILY_WAGE = "DAILY_WAGE"
}
export declare enum DisabilityType {
    NONE = "NONE",
    VISUAL = "VISUAL",
    HEARING = "HEARING",
    LOCOMOTOR = "LOCOMOTOR",
    INTELLECTUAL = "INTELLECTUAL",
    MULTIPLE = "MULTIPLE",
    OTHER = "OTHER"
}
export interface AddressProps {
    id: string;
    streetAddress: string;
    city: string;
    district: string;
    state: string;
    pincode: string;
    isRural: boolean;
}
export interface HouseholdMemberProps {
    id: string;
    fullName: string;
    relation: string;
    age: number;
    gender: Gender;
    isDependent: boolean;
    annualIncomeINR: number;
}
export interface LandDetailProps {
    id: string;
    landSizeAcres: number;
    landType: string;
    surveyNumber?: string | null;
    district: string;
    state: string;
}
export interface CitizenProps {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    gender: Gender;
    maritalStatus: MaritalStatus;
    socialCategory: SocialCategory;
    employmentStatus: EmploymentStatus;
    annualIncomeINR: number;
    disabilityType: DisabilityType;
    disabilityPercent: number;
    isBplCardHolder: boolean;
    bplCardNumber?: string | null;
    aadhaarHash?: string | null;
    panHash?: string | null;
    address?: AddressProps | null;
    householdMembers?: HouseholdMemberProps[];
    landDetails?: LandDetailProps[];
    createdAt?: Date;
    updatedAt?: Date;
}
export declare class CitizenEntity extends BaseDomainEntity<CitizenProps> {
    private _userId;
    private _firstName;
    private _lastName;
    private _dateOfBirth;
    private _gender;
    private _maritalStatus;
    private _socialCategory;
    private _employmentStatus;
    private _annualIncomeINR;
    private _disabilityType;
    private _disabilityPercent;
    private _isBplCardHolder;
    private _bplCardNumber?;
    private _aadhaarHash?;
    private _panHash?;
    private _address?;
    private _householdMembers;
    private _landDetails;
    constructor(props: CitizenProps);
    get userId(): string;
    get firstName(): string;
    get lastName(): string;
    get dateOfBirth(): Date;
    get gender(): Gender;
    get maritalStatus(): MaritalStatus;
    get socialCategory(): SocialCategory;
    get employmentStatus(): EmploymentStatus;
    get annualIncomeINR(): number;
    get disabilityType(): DisabilityType;
    get disabilityPercent(): number;
    get isBplCardHolder(): boolean;
    get bplCardNumber(): string | null | undefined;
    get aadhaarHash(): string | null | undefined;
    get panHash(): string | null | undefined;
    get address(): AddressProps | null | undefined;
    get householdMembers(): HouseholdMemberProps[];
    get landDetails(): LandDetailProps[];
    get age(): number;
    calculateProfileCompletionPercentage(): number;
    updateDemographics(data: Partial<CitizenProps>): void;
}
