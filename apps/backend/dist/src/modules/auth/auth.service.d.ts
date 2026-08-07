import { JwtService } from '@nestjs/jwt';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto/auth.dto';
import { UserEntity } from '../../domain/user/user.entity';
import { IUserRepository } from '../../domain/user/user-repository.interface';
import { RedisService } from '../../infrastructure/redis/redis.service';
export declare class AuthService {
    private readonly userRepo;
    private readonly jwtService;
    private readonly redisService;
    constructor(userRepo: IUserRepository, jwtService: JwtService, redisService: RedisService);
    register(dto: RegisterDto): Promise<{
        user: UserEntity;
        accessToken: string;
        refreshToken: string;
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
