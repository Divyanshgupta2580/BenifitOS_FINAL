import { Injectable, Inject, UnauthorizedException, ConflictException, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { randomUUID, randomBytes, createHash } from 'crypto';
import { RegisterDto, LoginDto, RefreshTokenDto, GoogleLoginDto, ResetPasswordDto } from './dto/auth.dto';
import { UserEntity, UserRole } from '../../domain/user/user.entity';
import { IUserRepository } from '../../domain/user/user-repository.interface';
import { ICitizenRepository } from '../../domain/citizen/citizen-repository.interface';
import { CitizenEntity, Gender, MaritalStatus, SocialCategory, EmploymentStatus, DisabilityType } from '../../domain/citizen/citizen.entity';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { EmailService } from '../../infrastructure/email/email.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
    @Inject('ICitizenRepository') private readonly citizenRepo: ICitizenRepository,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    @Inject(EmailService) private readonly emailService?: EmailService,
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
      role: UserRole.CITIZEN,
      isEmailVerified: false,
      isPhoneVerified: false,
      mfaEnabled: false,
    });

    const savedUser = await this.userRepo.save(user);

    // Atomically create baseline CitizenProfile
    const birthDate = dto.age ? new Date(new Date().getFullYear() - dto.age, 0, 1) : new Date(2000, 0, 1);
    const citizen = new CitizenEntity({
      id: randomUUID(),
      userId: savedUser.id,
      firstName: dto.name.split(' ')[0] || dto.name,
      lastName: dto.name.split(' ').slice(1).join(' ') || '',
      dateOfBirth: birthDate,
      gender: Gender.OTHER,
      maritalStatus: MaritalStatus.SINGLE,
      socialCategory: dto.category || SocialCategory.GENERAL,
      employmentStatus: dto.profession || EmploymentStatus.UNEMPLOYED,
      annualIncomeINR: dto.annualIncome || 0,
      disabilityType: DisabilityType.NONE,
      disabilityPercent: 0,
      isBplCardHolder: false,
      address: {
        id: randomUUID(),
        streetAddress: '',
        city: '',
        district: '',
        state: dto.state || 'Delhi',
        pincode: '',
        isRural: false,
      },
    });

    await this.citizenRepo.save(citizen);

    const tokens = await this.generateTokens(savedUser);
    return { user: savedUser, ...tokens };
  }

  async forgotPassword(email: string): Promise<{ success: boolean; configured: boolean; message: string; resetToken?: string }> {
    const normalizedEmail = (email || '').trim().toLowerCase();
    const user = await this.userRepo.findByEmail(normalizedEmail);
    let rawToken: string | undefined;

    if (user) {
      rawToken = randomBytes(32).toString('hex');
      const tokenHash = createHash('sha256').update(rawToken).digest('hex');

      // Store hashed token in Redis with 15-minute expiration (900s)
      await this.redisService.set(
        `pwd_reset:${tokenHash}`,
        JSON.stringify({ userId: user.id, email: user.email }),
        900,
      );

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}`;

      if (this.emailService && this.emailService.isConfigured()) {
        await this.emailService.sendPasswordResetEmail(user.email, resetUrl);
        this.logger.log(`Password reset email dispatched to ${user.email}`);
      } else {
        this.logger.log(`Password reset token generated for user ${user.id} (Email provider unconfigured)`);
      }
    }

    const isEmailConfigured = Boolean(this.emailService && this.emailService.isConfigured());

    return {
      success: true,
      configured: isEmailConfigured,
      message: 'If an account exists with this email address, password reset instructions have been dispatched.',
      resetToken: process.env.NODE_ENV !== 'production' ? rawToken : undefined,
    };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ success: boolean; message: string }> {
    const tokenHash = createHash('sha256').update(dto.token.trim()).digest('hex');
    const sessionStr = await this.redisService.get(`pwd_reset:${tokenHash}`);

    if (!sessionStr) {
      throw new BadRequestException('Invalid or expired password reset token.');
    }

    let session: { userId: string; email: string };
    try {
      session = JSON.parse(sessionStr);
    } catch {
      throw new BadRequestException('Malformed password reset session.');
    }

    // Invalidate token immediately (single-use)
    await this.redisService.del(`pwd_reset:${tokenHash}`);

    const user = await this.userRepo.findById(session.userId);
    if (!user) {
      throw new NotFoundException('Associated citizen user account not found.');
    }

    // Hash new password with Argon2
    const newHash = await argon2.hash(dto.newPassword);
    user.updatePassword(newHash);
    await this.userRepo.update(user);

    this.logger.log(`Password successfully reset for citizen user ${user.id}`);
    return {
      success: true,
      message: 'Your password has been successfully updated. You may now log in with your new credentials.',
    };
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
      const refreshSecret = process.env.JWT_REFRESH_SECRET;
      if (!refreshSecret) {
        throw new Error('JWT_REFRESH_SECRET is not configured');
      }
      const payload = this.jwtService.verify(dto.refreshToken, {
        secret: refreshSecret,
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
    const accessSecret = process.env.JWT_SECRET;
    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!accessSecret || !refreshSecret) {
      throw new Error('JWT configuration missing. Server cannot issue tokens.');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, {
      secret: accessSecret,
      expiresIn: (process.env.JWT_EXPIRATION || '15m') as any,
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: (process.env.JWT_REFRESH_EXPIRATION || '7d') as any,
    });

    return { accessToken, refreshToken };
  }
}
