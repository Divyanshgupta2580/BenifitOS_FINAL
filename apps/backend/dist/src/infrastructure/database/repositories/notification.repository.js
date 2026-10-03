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
const notification_repository_interface_1 = require("../../../domain/notification/notification-repository.interface");
let NotificationRepositoryImpl = class NotificationRepositoryImpl {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    mapToEntity(data) {
        return {
            id: data.id,
            userId: data.userId,
            type: data.type || notification_repository_interface_1.NotificationType.SYSTEM,
            title: data.title,
            body: data.body,
            severity: data.severity || notification_repository_interface_1.NotificationSeverity.INFO,
            channel: data.channel,
            isRead: data.isRead,
            metadata: data.metadata || null,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        };
    }
    async findById(id) {
        const record = await this.prisma.client.notification.findUnique({ where: { id } });
        return record ? this.mapToEntity(record) : null;
    }
    async findByUserId(userId) {
        const records = await this.prisma.client.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
        return records.map((r) => this.mapToEntity(r));
    }
    async countUnread(userId) {
        return await this.prisma.client.notification.count({
            where: { userId, isRead: false },
        });
    }
    async save(notification) {
        const record = await this.prisma.client.notification.create({
            data: {
                id: notification.id,
                userId: notification.userId,
                type: notification.type || 'SYSTEM',
                title: notification.title,
                body: notification.body,
                severity: notification.severity || 'INFO',
                channel: notification.channel || 'IN_APP',
                isRead: notification.isRead || false,
                metadata: notification.metadata || {},
            },
        });
        return this.mapToEntity(record);
    }
    async markAsRead(id) {
        await this.prisma.client.notification.update({
            where: { id },
            data: { isRead: true },
        });
    }
    async markAllAsRead(userId) {
        await this.prisma.client.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
    }
    async delete(id) {
        await this.prisma.client.notification.delete({
            where: { id },
        });
    }
    async findRecentSimilar(userId, type, title, withinMinutes) {
        const since = new Date(Date.now() - withinMinutes * 60 * 1000);
        const record = await this.prisma.client.notification.findFirst({
            where: {
                userId,
                type,
                title,
                createdAt: { gte: since },
            },
            orderBy: { createdAt: 'desc' },
        });
        return record ? this.mapToEntity(record) : null;
    }
};
exports.NotificationRepositoryImpl = NotificationRepositoryImpl;
exports.NotificationRepositoryImpl = NotificationRepositoryImpl = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationRepositoryImpl);
//# sourceMappingURL=notification.repository.js.map