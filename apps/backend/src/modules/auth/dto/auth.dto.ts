import { IsEmail, IsString, MinLength, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { UserRole } from '../../../domain/user/user.entity';
import { Gender, SocialCategory, EmploymentStatus } from '../../../domain/citizen/citizen.entity';

export class RegisterDto {
  @IsString({ message: 'Full name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  name: string;

  @IsNumber({}, { message: 'Age must be a valid integer' })
  @Min(18, { message: 'Citizen must be at least 18 years old' })
  @Max(120, { message: 'Age must be less than 120' })
  age: number;

  @IsOptional()
  @IsEnum(Gender, { message: 'Gender must be MALE, FEMALE, TRANSGENDER, or OTHER' })
  gender?: Gender;

  @IsEnum(SocialCategory, { message: 'Category must be one of GENERAL, OBC, SC, ST, EWS' })
  category: SocialCategory;

  @IsEnum(EmploymentStatus, { message: 'Profession must be one of EMPLOYED, UNEMPLOYED, SELF_EMPLOYED, STUDENT, RETIRED, FARMER, DAILY_WAGE' })
  profession: EmploymentStatus;

  @IsNumber({}, { message: 'Annual income must be a valid number' })
  @Min(0, { message: 'Annual income cannot be negative' })
  annualIncome: number;

  @IsString({ message: 'State of residence is required' })
  state: string;

  @IsEmail({}, { message: 'Must be a valid email address' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class RefreshTokenDto {
  @IsString()
  refreshToken: string;
}

export class GoogleLoginDto {
  @IsString()
  idToken: string;
}

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Must be a valid email address' })
  email: string;
}

export class ResetPasswordDto {
  @IsString({ message: 'Reset token is required' })
  token: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  newPassword: string;
}
