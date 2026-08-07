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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepositoryImpl = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const user_entity_1 = require("../../../domain/user/user.entity");
let UserRepositoryImpl = class UserRepositoryImpl {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    mapToEntity(data) {
        return new user_entity_1.UserEntity({
            id: data.id,
            email: data.email,
            phone: data.phone,
            passwordHash: data.passwordHash,
            role: data.role,
            isEmailVerified: data.isEmailVerified,
            isPhoneVerified: data.isPhoneVerified,
            mfaEnabled: data.mfaEnabled,
            mfaSecret: data.mfaSecret,
            googleId: data.googleId,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            deletedAt: data.deletedAt,
        });
    }
    async findById(id) {
        const record = await this.prisma.user.findUnique({ where: { id } });
        return record ? this.mapToEntity(record) : null;
    }
    async findByEmail(email) {
        const record = await this.prisma.user.findUnique({ where: { email } });
        return record ? this.mapToEntity(record) : null;
    }
    async findByPhone(phone) {
        const record = await this.prisma.user.findUnique({ where: { phone } });
        return record ? this.mapToEntity(record) : null;
    }
    async findByGoogleId(googleId) {
        const record = await this.prisma.user.findUnique({ where: { googleId } });
        return record ? this.mapToEntity(record) : null;
    }
    async save(user) {
        const record = await this.prisma.user.create({
            data: {
                id: user.id,
                email: user.email,
                phone: user.phone,
                passwordHash: user.passwordHash,
                role: user.role,
                isEmailVerified: user.isEmailVerified,
                isPhoneVerified: user.isPhoneVerified,
                mfaEnabled: user.mfaEnabled,
                mfaSecret: user.mfaSecret,
                googleId: user.googleId,
            },
        });
        return this.mapToEntity(record);
    }
    async update(user) {
        const record = await this.prisma.user.update({
            where: { id: user.id },
            data: {
                email: user.email,
                phone: user.phone,
                passwordHash: user.passwordHash,
                role: user.role,
                isEmailVerified: user.isEmailVerified,
                isPhoneVerified: user.isPhoneVerified,
                mfaEnabled: user.mfaEnabled,
                mfaSecret: user.mfaSecret,
                deletedAt: user.deletedAt,
            },
        });
        return this.mapToEntity(record);
    }
    async delete(id) {
        await this.prisma.user.delete({ where: { id } });
    }
};
exports.UserRepositoryImpl = UserRepositoryImpl;
exports.UserRepositoryImpl = UserRepositoryImpl = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserRepositoryImpl);
//# sourceMappingURL=user.repository.js.map