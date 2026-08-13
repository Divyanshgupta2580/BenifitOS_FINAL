import { SocialCategory, EmploymentStatus } from '../../../domain/citizen/citizen.entity';
export declare class RegisterDto {
    name: string;
    age: number;
    category: SocialCategory;
    profession: EmploymentStatus;
    annualIncome: number;
    state: string;
    email: string;
    password: string;
    phone?: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
export declare class GoogleLoginDto {
    idToken: string;
}
export declare class ForgotPasswordDto {
    email: string;
}
export declare class ResetPasswordDto {
    token: string;
    newPassword: string;
}
