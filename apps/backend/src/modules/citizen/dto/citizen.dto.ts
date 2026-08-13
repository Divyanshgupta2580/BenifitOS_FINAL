import { IsString, IsEnum, IsNumber, IsBoolean, IsOptional, IsDateString, Min, Max } from 'class-validator';
import { Gender, SocialCategory, MaritalStatus, EmploymentStatus, DisabilityType } from '../../../domain/citizen/citizen.entity';

export class UpdateCitizenProfileDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsDateString()
  dateOfBirth: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsEnum(MaritalStatus)
  maritalStatus: MaritalStatus;

  @IsEnum(SocialCategory)
  socialCategory: SocialCategory;

  @IsEnum(EmploymentStatus)
  employmentStatus: EmploymentStatus;

  @IsNumber()
  @Min(0)
  annualIncomeINR: number;

  @IsEnum(DisabilityType)
  disabilityType: DisabilityType;

  @IsNumber()
  @Min(0)
  @Max(100)
  disabilityPercent: number;

  @IsBoolean()
  isBplCardHolder: boolean;

  @IsOptional()
  @IsString()
  bplCardNumber?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  streetAddress?: string;

  @IsOptional()
  @IsString()
  pincode?: string;

  @IsOptional()
  @IsBoolean()
  isRural?: boolean;

  @IsOptional()
  @IsString()
  educationLevel?: string;

  @IsOptional()
  @IsString()
  course?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  academicPercentage?: number;
}
