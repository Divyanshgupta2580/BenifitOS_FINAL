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
}
