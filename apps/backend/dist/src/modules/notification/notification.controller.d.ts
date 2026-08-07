import { NotificationService } from './notification.service';
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    getNotifications(userId: string): Promise<{
        count: number;
        notifications: import("../../domain/notification/notification-repository.interface").NotificationProps[];
    }>;
    markAsRead(id: string): Promise<{
        message: string;
    }>;
}
