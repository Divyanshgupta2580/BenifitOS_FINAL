import { JwtService } from '@nestjs/jwt';
import { RegisterDto, LoginDto, RefreshTokenDto, ResetPasswordDto } from './dto/auth.dto';
import { UserEntity } from '../../domain/user/user.entity';
import { IUserRepository } from '../../domain/user/user-repository.interface';
import { ICitizenRepository } from '../../domain/citizen/citizen-repository.interface';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { EmailService } from '../../infrastructure/email/email.service';
export declare class AuthService {
    private readonly userRepo;
    private readonly citizenRepo;
    private readonly jwtService;
    private readonly redisService;
    private readonly emailService?;
    private readonly logger;
    constructor(userRepo: IUserRepository, citizenRepo: ICitizenRepository, jwtService: JwtService, redisService: RedisService, emailService?: EmailService | undefined);
    register(dto: RegisterDto): Promise<{
        user: UserEntity;
        accessToken: string;
        refreshToken: string;
    }>;
    forgotPassword(email: string): Promise<{
        success: boolean;
        configured: boolean;
        message: string;
        resetToken?: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
    login(dto: LoginDto): Promise<{
        user: UserEntity;
        accessToken: string;
        refreshToken: string;
    }>;
    refreshToken(dto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(refreshToken: string): Promise<void>;
    private generateTokens;
}
