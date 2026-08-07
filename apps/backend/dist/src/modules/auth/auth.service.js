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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const argon2 = require("argon2");
const crypto_1 = require("crypto");
const user_entity_1 = require("../../domain/user/user.entity");
const redis_service_1 = require("../../infrastructure/redis/redis.service");
let AuthService = class AuthService {
    userRepo;
    jwtService;
    redisService;
    constructor(userRepo, jwtService, redisService) {
        this.userRepo = userRepo;
        this.jwtService = jwtService;
        this.redisService = redisService;
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
            role: dto.role || user_entity_1.UserRole.CITIZEN,
            isEmailVerified: false,
            isPhoneVerified: false,
            mfaEnabled: false,
        });
        const savedUser = await this.userRepo.save(user);
        const tokens = await this.generateTokens(savedUser);
        return { user: savedUser, ...tokens };
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
            const payload = this.jwtService.verify(dto.refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET || 'super_secret_jwt_refresh_key_benefit_os_32_bytes',
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
        const payload = { sub: user.id, email: user.email, role: user.role };
        const accessToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_SECRET || 'super_secret_jwt_key_benefit_os_production_change_me_32_bytes',
            expiresIn: (process.env.JWT_EXPIRATION || '15m'),
        });
        const refreshToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_REFRESH_SECRET || 'super_secret_jwt_refresh_key_benefit_os_32_bytes',
            expiresIn: (process.env.JWT_REFRESH_EXPIRATION || '7d'),
        });
        return { accessToken, refreshToken };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('IUserRepository')),
    __metadata("design:paramtypes", [Object, jwt_1.JwtService,
        redis_service_1.RedisService])
], AuthService);
//# sourceMappingURL=auth.service.js.map