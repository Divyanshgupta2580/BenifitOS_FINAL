"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const argon2 = require("argon2");
const crypto_1 = require("crypto");
const user_entity_1 = require("../../domain/user/user.entity");
const citizen_entity_1 = require("../../domain/citizen/citizen.entity");
const redis_service_1 = require("../../infrastructure/redis/redis.service");
const email_service_1 = require("../../infrastructure/email/email.service");
let AuthService = AuthService_1 = class AuthService {
    userRepo;
    citizenRepo;
    jwtService;
    redisService;
    emailService;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(userRepo, citizenRepo, jwtService, redisService, emailService) {
        this.userRepo = userRepo;
        this.citizenRepo = citizenRepo;
        this.jwtService = jwtService;
        this.redisService = redisService;
        this.emailService = emailService;
    }
    async register(dto) {
        const existing = await this.userRepo.findByEmail(dto.email);
        if (existing) {
            throw new common_1.ConflictException(`User with email '${dto.email}' already exists.`);
        }
        const passwordHash = await argon2.hash(dto.password);
        const user = new user_entity_1.UserEntity({
            id: (0, crypto_1.randomUUID)(),
            email: dto.email,
            phone: dto.phone,
            passwordHash,
            role: user_entity_1.UserRole.CITIZEN,
            isEmailVerified: false,
            isPhoneVerified: false,
            mfaEnabled: false,
        });
        const savedUser = await this.userRepo.save(user);
        const birthDate = dto.age ? new Date(new Date().getFullYear() - dto.age, 0, 1) : new Date(2000, 0, 1);
        const citizen = new citizen_entity_1.CitizenEntity({
            id: (0, crypto_1.randomUUID)(),
            userId: savedUser.id,
            firstName: dto.name.split(' ')[0] || dto.name,
            lastName: dto.name.split(' ').slice(1).join(' ') || '',
            dateOfBirth: birthDate,
            gender: dto.gender || citizen_entity_1.Gender.OTHER,
            maritalStatus: citizen_entity_1.MaritalStatus.SINGLE,
            socialCategory: dto.category || citizen_entity_1.SocialCategory.GENERAL,
            employmentStatus: dto.profession || citizen_entity_1.EmploymentStatus.UNEMPLOYED,
            annualIncomeINR: dto.annualIncome || 0,
            disabilityType: citizen_entity_1.DisabilityType.NONE,
            disabilityPercent: 0,
            isBplCardHolder: false,
            address: {
                id: (0, crypto_1.randomUUID)(),
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
    async forgotPassword(email) {
        const normalizedEmail = (email || '').trim().toLowerCase();
        const user = await this.userRepo.findByEmail(normalizedEmail);
        let rawToken;
        if (user) {
            rawToken = (0, crypto_1.randomBytes)(32).toString('hex');
            const tokenHash = (0, crypto_1.createHash)('sha256').update(rawToken).digest('hex');
            await this.redisService.set(`pwd_reset:${tokenHash}`, JSON.stringify({ userId: user.id, email: user.email }), 900);
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}`;
            if (this.emailService && this.emailService.isConfigured()) {
                await this.emailService.sendPasswordResetEmail(user.email, resetUrl);
                this.logger.log(`Password reset email dispatched to ${user.email}`);
            }
            else {
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
    async resetPassword(dto) {
        const tokenHash = (0, crypto_1.createHash)('sha256').update(dto.token.trim()).digest('hex');
        const sessionStr = await this.redisService.get(`pwd_reset:${tokenHash}`);
        if (!sessionStr) {
            throw new common_1.BadRequestException('Invalid or expired password reset token.');
        }
        let session;
        try {
            session = JSON.parse(sessionStr);
        }
        catch {
            throw new common_1.BadRequestException('Malformed password reset session.');
        }
        await this.redisService.del(`pwd_reset:${tokenHash}`);
        const user = await this.userRepo.findById(session.userId);
        if (!user) {
            throw new common_1.NotFoundException('Associated citizen user account not found.');
        }
        const newHash = await argon2.hash(dto.newPassword);
        user.updatePassword(newHash);
        await this.userRepo.update(user);
        this.logger.log(`Password successfully reset for citizen user ${user.id}`);
        return {
            success: true,
            message: 'Your password has been successfully updated. You may now log in with your new credentials.',
        };
    }
    async login(dto) {
        const user = await this.userRepo.findByEmail(dto.email);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email or password.');
        }
        const isValid = await argon2.verify(user.passwordHash, dto.password);
        if (!isValid) {
            throw new common_1.UnauthorizedException('Invalid email or password.');
        }
        const tokens = await this.generateTokens(user);
        return { user, ...tokens };
    }
    async refreshToken(dto) {
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
                throw new common_1.UnauthorizedException('Refresh token revoked or reused.');
            }
            const user = await this.userRepo.findById(payload.sub);
            if (!user) {
                throw new common_1.UnauthorizedException('User no longer exists.');
            }
            await this.redisService.set(`bl_${dto.refreshToken}`, 'true', 7 * 24 * 60 * 60);
            return await this.generateTokens(user);
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token.');
        }
    }
    async logout(refreshToken) {
        await this.redisService.set(`bl_${refreshToken}`, 'true', 7 * 24 * 60 * 60);
    }
    async generateTokens(user) {
        const accessSecret = process.env.JWT_SECRET;
        const refreshSecret = process.env.JWT_REFRESH_SECRET;
        if (!accessSecret || !refreshSecret) {
            throw new Error('JWT configuration missing. Server cannot issue tokens.');
        }
        const payload = { sub: user.id, email: user.email, role: user.role };
        const accessToken = this.jwtService.sign(payload, {
            secret: accessSecret,
            expiresIn: (process.env.JWT_EXPIRATION || '15m'),
        });
        const refreshToken = this.jwtService.sign(payload, {
            secret: refreshSecret,
            expiresIn: (process.env.JWT_REFRESH_EXPIRATION || '7d'),
        });
        return { accessToken, refreshToken };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('IUserRepository')),
    __param(1, (0, common_1.Inject)('ICitizenRepository')),
    __param(4, (0, common_1.Inject)(email_service_1.EmailService)),
    __metadata("design:paramtypes", [Object, Object, jwt_1.JwtService,
        redis_service_1.RedisService,
        email_service_1.EmailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map