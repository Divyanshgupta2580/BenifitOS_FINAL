import { Gender, SocialCategory, MaritalStatus, EmploymentStatus, DisabilityType } from '../../../domain/citizen/citizen.entity';
export declare class UpdateCitizenProfileDto {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: Gender;
    maritalStatus: MaritalStatus;
    socialCategory: SocialCategory;
    employmentStatus: EmploymentStatus;
    annualIncomeINR: number;
    disabilityType: DisabilityType;
    disabilityPercent: number;
    isBplCardHolder: boolean;
    bplCardNumber?: string;
    state?: string;
    district?: string;
    city?: string;
    streetAddress?: string;
    pincode?: string;
    isRural?: boolean;
    educationLevel?: string;
    course?: string;
    academicPercentage?: number;
}
