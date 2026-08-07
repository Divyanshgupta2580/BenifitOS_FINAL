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
exports.NotificationRepositoryImpl = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let NotificationRepositoryImpl = class NotificationRepositoryImpl {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    mapToEntity(data) {
        return {
            id: data.id,
            userId: data.userId,
            title: data.title,
            body: data.body,
            channel: data.channel,
            isRead: data.isRead,
            metadata: data.metadata,
            createdAt: data.createdAt,
        };
    }
    async findById(id) {
        const record = await this.prisma.notification.findUnique({ where: { id } });
        return record ? this.mapToEntity(record) : null;
    }
    async findByUserId(userId) {
        const records = await this.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        return records.map((r) => this.mapToEntity(r));
    }
    async save(notification) {
        const record = await this.prisma.notification.create({
            data: {
                id: notification.id,
                userId: notification.userId,
                title: notification.title,
                body: notification.body,
                channel: notification.channel,
                isRead: notification.isRead,
                metadata: notification.metadata || {},
            },
        });
        return this.mapToEntity(record);
    }
    async markAsRead(id) {
        await this.prisma.notification.update({
            where: { id },
            data: { isRead: true },
        });
    }
    async markAllAsRead(userId) {
        await this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
    }
};
exports.NotificationRepositoryImpl = NotificationRepositoryImpl;
exports.NotificationRepositoryImpl = NotificationRepositoryImpl = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationRepositoryImpl);
//# sourceMappingURL=notification.repository.js.map