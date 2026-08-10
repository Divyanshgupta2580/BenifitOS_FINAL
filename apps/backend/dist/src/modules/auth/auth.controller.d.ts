import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    private setRefreshCookie;
    private clearRefreshCookie;
    register(dto: RegisterDto, res: Response): Promise<{
        message: string;
        user: {
            id: string;
            email: string;
            role: import("../../domain/user/user.entity").UserRole;
        };
        tokens: {
            accessToken: string;
        };
    }>;
    login(dto: LoginDto, res: Response): Promise<{
        message: string;
        user: {
            id: string;
            email: string;
            role: import("../../domain/user/user.entity").UserRole;
        };
        tokens: {
            accessToken: string;
        };
    }>;
    refresh(req: Request, dto: Partial<RefreshTokenDto>, res: Response): Promise<{
        message: string;
        tokens: {
            accessToken: string;
        };
    }>;
    logout(req: Request, dto: Partial<RefreshTokenDto>, res: Response): Promise<{
        message: string;
    }>;
}
