import { UserRole } from '../../../domain/user/user.entity';
export declare class RegisterDto {
    email: string;
    password: string;
    phone?: string;
    role?: UserRole;
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
