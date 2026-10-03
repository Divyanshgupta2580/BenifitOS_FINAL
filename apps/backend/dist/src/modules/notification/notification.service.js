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
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const notification_repository_interface_1 = require("../../domain/notification/notification-repository.interface");
const realtime_gateway_1 = require("../realtime/realtime.gateway");
const crypto_1 = require("crypto");
let NotificationService = NotificationService_1 = class NotificationService {
    notificationRepo;
    realtimeGateway;
    logger = new common_1.Logger(NotificationService_1.name);
    constructor(notificationRepo, realtimeGateway) {
        this.notificationRepo = notificationRepo;
        this.realtimeGateway = realtimeGateway;
    }
    async createNotification(dto) {
        const type = dto.type || notification_repository_interface_1.NotificationType.SYSTEM;
        const severity = dto.severity || notification_repository_interface_1.NotificationSeverity.INFO;
        const channel = dto.channel || notification_repository_interface_1.ChannelType.IN_APP;
        if (dto.deduplicateMinutes && dto.deduplicateMinutes > 0) {
            const recent = await this.notificationRepo.findRecentSimilar(dto.userId, type, dto.title, dto.deduplicateMinutes);
            if (recent) {
                this.logger.debug(`Skipping duplicate notification '${dto.title}' for user ${dto.userId}`);
                return recent;
            }
        }
        const notification = {
            id: (0, crypto_1.randomUUID)(),
            userId: dto.userId,
            type,
            title: dto.title,
            body: dto.body,
            severity,
            channel,
            isRead: false,
            metadata: dto.metadata || null,
            createdAt: new Date(),
        };
        const saved = await this.notificationRepo.save(notification);
        try {
            if (this.realtimeGateway) {
                this.realtimeGateway.emitNotification(dto.userId, {
                    id: saved.id,
                    userId: saved.userId,
                    type: saved.type,
                    title: saved.title,
                    body: saved.body,
                    severity: saved.severity,
                    isRead: saved.isRead,
                    metadata: saved.metadata,
                    createdAt: saved.createdAt,
                });
            }
        }
        catch (err) {
            this.logger.warn(`Failed to emit realtime notification: ${err?.message}`);
        }
        return saved;
    }
    async sendNotification(userId, title, body, channel = notification_repository_interface_1.ChannelType.IN_APP, type = notification_repository_interface_1.NotificationType.SYSTEM, severity = notification_repository_interface_1.NotificationSeverity.INFO, metadata) {
        return await this.createNotification({
            userId,
            title,
            body,
            channel,
            type,
            severity,
            metadata,
        });
    }
    async getUserNotifications(userId) {
        return await this.notificationRepo.findByUserId(userId);
    }
    async getUnreadCount(userId) {
        return await this.notificationRepo.countUnread(userId);
    }
    async markAsRead(userId, id) {
        const notification = await this.notificationRepo.findById(id);
        if (!notification) {
            throw new common_1.NotFoundException(`Notification with ID '${id}' not found.`);
        }
        if (notification.userId !== userId) {
            throw new common_1.ForbiddenException('Access denied: You do not own this notification.');
        }
        await this.notificationRepo.markAsRead(id);
    }
    async markAllAsRead(userId) {
        await this.notificationRepo.markAllAsRead(userId);
    }
    async deleteNotification(userId, id) {
        const notification = await this.notificationRepo.findById(id);
        if (!notification) {
            throw new common_1.NotFoundException(`Notification with ID '${id}' not found.`);
        }
        if (notification.userId !== userId) {
            throw new common_1.ForbiddenException('Access denied: You do not own this notification.');
        }
        await this.notificationRepo.delete(id);
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('INotificationRepository')),
    __param(1, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [Object, realtime_gateway_1.RealtimeGateway])
], NotificationService);
//# sourceMappingURL=notification.service.js.map