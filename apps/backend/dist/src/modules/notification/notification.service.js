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
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const notification_repository_interface_1 = require("../../domain/notification/notification-repository.interface");
const crypto_1 = require("crypto");
let NotificationService = class NotificationService {
    notificationRepo;
    constructor(notificationRepo) {
        this.notificationRepo = notificationRepo;
    }
    async sendNotification(userId, title, body, channel = notification_repository_interface_1.ChannelType.IN_APP) {
        const notification = {
            id: (0, crypto_1.randomUUID)(),
            userId,
            title,
            body,
            channel,
            isRead: false,
            createdAt: new Date(),
        };
        return await this.notificationRepo.save(notification);
    }
    async getUserNotifications(userId) {
        return await this.notificationRepo.findByUserId(userId);
    }
    async markAsRead(userId, id) {
        const notification = await this.notificationRepo.findById(id);
        if (!notification || notification.userId !== userId) {
            return;
        }
        await this.notificationRepo.markAsRead(id);
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('INotificationRepository')),
    __metadata("design:paramtypes", [Object])
], NotificationService);
//# sourceMappingURL=notification.service.js.map