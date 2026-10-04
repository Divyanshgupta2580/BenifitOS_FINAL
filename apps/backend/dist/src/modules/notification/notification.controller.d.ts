import { NotificationService } from './notification.service';
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    getNotifications(userId: string): Promise<{
        count: number;
        unreadCount: number;
        notifications: import("../../domain/notification/notification-repository.interface").NotificationProps[];
    }>;
    getUnreadCount(userId: string): Promise<{
        unreadCount: number;
    }>;
    markAllAsRead(userId: string): Promise<{
        message: string;
    }>;
    markAsRead(userId: string, id: string): Promise<{
        message: string;
    }>;
    clearAllNotifications(userId: string): Promise<{
        message: string;
        clearedCount: number;
    }>;
    deleteNotification(userId: string, id: string): Promise<void>;
}
