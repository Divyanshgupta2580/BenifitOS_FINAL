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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const auth_dto_1 = require("./dto/auth.dto");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const throttler_1 = require("@nestjs/throttler");
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async forgotPassword(dto) {
        return await this.authService.forgotPassword(dto.email);
    }
    async resetPassword(dto) {
        return await this.authService.resetPassword(dto);
    }
    setRefreshCookie(res, refreshToken) {
        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'strict' : 'lax',
            path: '/api/v1/auth',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
    }
    clearRefreshCookie(res) {
        const isProduction = process.env.NODE_ENV === 'production';
        res.clearCookie('refresh_token', {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'strict' : 'lax',
            path: '/api/v1/auth',
        });
    }
    async register(dto, res) {
        const result = await this.authService.register(dto);
        this.setRefreshCookie(res, result.refreshToken);
        return {
            message: 'User registered successfully.',
            user: {
                id: result.user.id,
                email: result.user.email,
                role: result.user.role,
            },
            tokens: {
                accessToken: result.accessToken,
            },
        };
    }
    async login(dto, res) {
        const result = await this.authService.login(dto);
        this.setRefreshCookie(res, result.refreshToken);
        return {
            message: 'Login successful.',
            user: {
                id: result.user.id,
                email: result.user.email,
                role: result.user.role,
            },
            tokens: {
                accessToken: result.accessToken,
            },
        };
    }
    async refresh(req, dto, res) {
        const token = req.cookies?.['refresh_token'] || dto?.refreshToken;
        if (!token) {
            throw new common_1.UnauthorizedException('No refresh token provided.');
        }
        const tokens = await this.authService.refreshToken({ refreshToken: token });
        this.setRefreshCookie(res, tokens.refreshToken);
        return {
            message: 'Token refreshed successfully.',
            tokens: {
                accessToken: tokens.accessToken,
            },
        };
    }
    async logout(req, dto, res) {
        const token = req.cookies?.['refresh_token'] || dto?.refreshToken;
        if (token) {
            await this.authService.logout(token);
        }
        this.clearRefreshCookie(res);
        return { message: 'Logged out successfully.' };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, roles_decorator_1.Public)(),
    (0, throttler_1.Throttle)({ default: { limit: 15, ttl: 60000 } }),
    (0, common_1.Post)('forgot-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.ForgotPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, roles_decorator_1.Public)(),
    (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 60000 } }),
    (0, common_1.Post)('reset-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, roles_decorator_1.Public)(),
    (0, throttler_1.Throttle)({ default: { limit: 15, ttl: 60000 } }),
    (0, common_1.Post)('register'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.RegisterDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, roles_decorator_1.Public)(),
    (0, throttler_1.Throttle)({ default: { limit: 15, ttl: 60000 } }),
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, roles_decorator_1.Public)(),
    (0, throttler_1.Throttle)({ default: { limit: 15, ttl: 60000 } }),
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map