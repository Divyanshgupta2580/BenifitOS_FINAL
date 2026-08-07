import { Injectable, Inject, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { randomUUID } from 'crypto';
import { RegisterDto, LoginDto, RefreshTokenDto, GoogleLoginDto } from './dto/auth.dto';
import { UserEntity, UserRole } from '../../domain/user/user.entity';
import { IUserRepository } from '../../domain/user/user-repository.interface';
import { RedisService } from '../../infrastructure/redis/redis.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  async register(dto: RegisterDto): Promise<{ user: UserEntity; accessToken: string; refreshToken: string }> {
    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException(`User with email '${dto.email}' already exists.`);
    }

    const passwordHash = await argon2.hash(dto.password);
    const user = new UserEntity({
      id: randomUUID(),
      email: dto.email,
      phone: dto.phone,
      passwordHash,
      role: dto.role || UserRole.CITIZEN,
      isEmailVerified: false,
      isPhoneVerified: false,
      mfaEnabled: false,
    });

    const savedUser = await this.userRepo.save(user);
    const tokens = await this.generateTokens(savedUser);
    return { user: savedUser, ...tokens };
  }

  async login(dto: LoginDto): Promise<{ user: UserEntity; accessToken: string; refreshToken: string }> {
    const user = await this.userRepo.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isValid = await argon2.verify(user.passwordHash, dto.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const tokens = await this.generateTokens(user);
    return { user, ...tokens };
  }

  async refreshToken(dto: RefreshTokenDto): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = this.jwtService.verify(dto.refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'super_secret_jwt_refresh_key_benefit_os_32_bytes',
      });
      const isBlacklisted = await this.redisService.get(`bl_${dto.refreshToken}`);
      if (isBlacklisted) {
        throw new UnauthorizedException('Refresh token revoked or reused.');
      }
      const user = await this.userRepo.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User no longer exists.');
      }
      // Blacklist old refresh token (Token Family Rotation)
      await this.redisService.set(`bl_${dto.refreshToken}`, 'true', 7 * 24 * 60 * 60);
      return await this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }
  }

  async logout(refreshToken: string): Promise<void> {
    await this.redisService.set(`bl_${refreshToken}`, 'true', 7 * 24 * 60 * 60);
  }

  private async generateTokens(user: UserEntity): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'super_secret_jwt_key_benefit_os_production_change_me_32_bytes',
      expiresIn: (process.env.JWT_EXPIRATION || '15m') as any,
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'super_secret_jwt_refresh_key_benefit_os_32_bytes',
      expiresIn: (process.env.JWT_REFRESH_EXPIRATION || '7d') as any,
    });

    return { accessToken, refreshToken };
  }
}
