"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("./auth.service");
const jwt_strategy_1 = require("./jwt.strategy");
const user_repository_1 = require("../../infrastructure/database/repositories/user.repository");
const citizen_repository_1 = require("../../infrastructure/database/repositories/citizen.repository");
const prisma_service_1 = require("../../infrastructure/database/prisma.service");
const redis_service_1 = require("../../infrastructure/redis/redis.service");
const email_service_1 = require("../../infrastructure/email/email.service");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET,
                signOptions: { expiresIn: (process.env.JWT_EXPIRATION || '15m') },
            }),
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [
            auth_service_1.AuthService,
            jwt_strategy_1.JwtStrategy,
            prisma_service_1.PrismaService,
            redis_service_1.RedisService,
            email_service_1.EmailService,
            {
                provide: 'IUserRepository',
                useClass: user_repository_1.UserRepositoryImpl,
            },
            {
                provide: 'ICitizenRepository',
                useClass: citizen_repository_1.CitizenRepositoryImpl,
            },
        ],
        exports: [auth_service_1.AuthService, jwt_strategy_1.JwtStrategy, passport_1.PassportModule, jwt_1.JwtModule, 'IUserRepository', 'ICitizenRepository'],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map