import { BaseDomainEntity } from '../common/domain-entity.base';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  TRANSGENDER = 'TRANSGENDER',
  OTHER = 'OTHER',
}

export enum SocialCategory {
  GENERAL = 'GENERAL',
  OBC = 'OBC',
  SC = 'SC',
  ST = 'ST',
  EWS = 'EWS',
}

export enum MaritalStatus {
  SINGLE = 'SINGLE',
  MARRIED = 'MARRIED',
  DIVORCED = 'DIVORCED',
  WIDOWED = 'WIDOWED',
  SEPARATED = 'SEPARATED',
}

export enum EmploymentStatus {
  EMPLOYED = 'EMPLOYED',
  UNEMPLOYED = 'UNEMPLOYED',
  SELF_EMPLOYED = 'SELF_EMPLOYED',
  STUDENT = 'STUDENT',
  RETIRED = 'RETIRED',
  FARMER = 'FARMER',
  DAILY_WAGE = 'DAILY_WAGE',
}

export enum DisabilityType {
  NONE = 'NONE',
  VISUAL = 'VISUAL',
  HEARING = 'HEARING',
  LOCOMOTOR = 'LOCOMOTOR',
  INTELLECTUAL = 'INTELLECTUAL',
  MULTIPLE = 'MULTIPLE',
  OTHER = 'OTHER',
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

export class CitizenEntity extends BaseDomainEntity<CitizenProps> {
  private _userId: string;
  private _firstName: string;
  private _lastName: string;
  private _dateOfBirth: Date;
  private _gender: Gender;
  private _maritalStatus: MaritalStatus;
  private _socialCategory: SocialCategory;
  private _employmentStatus: EmploymentStatus;
  private _annualIncomeINR: number;
  private _disabilityType: DisabilityType;
  private _disabilityPercent: number;
  private _isBplCardHolder: boolean;
  private _bplCardNumber?: string | null;
  private _aadhaarHash?: string | null;
  private _panHash?: string | null;
  private _address?: AddressProps | null;
  private _householdMembers: HouseholdMemberProps[];
  private _landDetails: LandDetailProps[];

  constructor(props: CitizenProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this._userId = props.userId;
    this._firstName = props.firstName;
    this._lastName = props.lastName;
    this._dateOfBirth = props.dateOfBirth;
    this._gender = props.gender;
    this._maritalStatus = props.maritalStatus;
    this._socialCategory = props.socialCategory;
    this._employmentStatus = props.employmentStatus;
    this._annualIncomeINR = props.annualIncomeINR;
    this._disabilityType = props.disabilityType;
    this._disabilityPercent = props.disabilityPercent;
    this._isBplCardHolder = props.isBplCardHolder;
    this._bplCardNumber = props.bplCardNumber;
    this._aadhaarHash = props.aadhaarHash;
    this._panHash = props.panHash;
    this._address = props.address;
    this._householdMembers = props.householdMembers || [];
    this._landDetails = props.landDetails || [];
  }

  public get userId(): string { return this._userId; }
  public get firstName(): string { return this._firstName; }
  public get lastName(): string { return this._lastName; }
  public get dateOfBirth(): Date { return this._dateOfBirth; }
  public get gender(): Gender { return this._gender; }
  public get maritalStatus(): MaritalStatus { return this._maritalStatus; }
  public get socialCategory(): SocialCategory { return this._socialCategory; }
  public get employmentStatus(): EmploymentStatus { return this._employmentStatus; }
  public get annualIncomeINR(): number { return this._annualIncomeINR; }
  public get disabilityType(): DisabilityType { return this._disabilityType; }
  public get disabilityPercent(): number { return this._disabilityPercent; }
  public get isBplCardHolder(): boolean { return this._isBplCardHolder; }
  public get bplCardNumber(): string | null | undefined { return this._bplCardNumber; }
  public get aadhaarHash(): string | null | undefined { return this._aadhaarHash; }
  public get panHash(): string | null | undefined { return this._panHash; }
  public get address(): AddressProps | null | undefined { return this._address; }
  public get householdMembers(): HouseholdMemberProps[] { return this._householdMembers; }
  public get landDetails(): LandDetailProps[] { return this._landDetails; }

  public get age(): number {
    const today = new Date();
    let age = today.getFullYear() - this._dateOfBirth.getFullYear();
    const m = today.getMonth() - this._dateOfBirth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < this._dateOfBirth.getDate())) {
      age--;
    }
    return age;
  }

  public calculateProfileCompletionPercentage(): number {
    let score = 0;
    if (this._firstName && this._lastName) score += 20;
    if (this._dateOfBirth && this._gender) score += 20;
    if (this._socialCategory && this._employmentStatus) score += 20;
    if (this._address) score += 20;
    if (this._annualIncomeINR !== undefined) score += 20;
    return score;
  }

  public updateDemographics(data: Partial<CitizenProps>): void {
    if (data.firstName) this._firstName = data.firstName;
    if (data.lastName) this._lastName = data.lastName;
    if (data.dateOfBirth) this._dateOfBirth = data.dateOfBirth;
    if (data.gender) this._gender = data.gender;
    if (data.maritalStatus) this._maritalStatus = data.maritalStatus;
    if (data.socialCategory) this._socialCategory = data.socialCategory;
    if (data.employmentStatus) this._employmentStatus = data.employmentStatus;
    if (data.annualIncomeINR !== undefined) this._annualIncomeINR = data.annualIncomeINR;
    if (data.disabilityType) this._disabilityType = data.disabilityType;
    if (data.disabilityPercent !== undefined) this._disabilityPercent = data.disabilityPercent;
    if (data.isBplCardHolder !== undefined) this._isBplCardHolder = data.isBplCardHolder;
    if (data.bplCardNumber !== undefined) this._bplCardNumber = data.bplCardNumber;
    if (data.address) {
      this._address = {
        id: this._address?.id || data.address.id || 'addr-default',
        streetAddress: data.address.streetAddress ?? this._address?.streetAddress ?? 'Address',
        city: data.address.city ?? this._address?.city ?? 'City',
        district: data.address.district ?? this._address?.district ?? 'District',
        state: data.address.state ?? this._address?.state ?? 'National',
        pincode: data.address.pincode ?? this._address?.pincode ?? '110001',
        isRural: data.address.isRural ?? this._address?.isRural ?? false,
      };
    }
    this._updatedAt = new Date();
  }
}
