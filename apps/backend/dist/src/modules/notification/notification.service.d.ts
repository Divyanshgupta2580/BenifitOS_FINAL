import { INotificationRepository, NotificationProps, ChannelType, NotificationType, NotificationSeverity } from '../../domain/notification/notification-repository.interface';
import { RealtimeGateway } from '../realtime/realtime.gateway';
export interface CreateNotificationDto {
    userId: string;
    type?: NotificationType;
    title: string;
    body: string;
    severity?: NotificationSeverity;
    channel?: ChannelType;
    metadata?: Record<string, any>;
    deduplicateMinutes?: number;
}
export declare class NotificationService {
    private readonly notificationRepo;
    private readonly realtimeGateway?;
    private readonly logger;
    constructor(notificationRepo: INotificationRepository, realtimeGateway?: RealtimeGateway | undefined);
    createNotification(dto: CreateNotificationDto): Promise<NotificationProps>;
    sendNotification(userId: string, title: string, body: string, channel?: ChannelType, type?: NotificationType, severity?: NotificationSeverity, metadata?: Record<string, any>): Promise<NotificationProps>;
    getUserNotifications(userId: string): Promise<NotificationProps[]>;
    getUnreadCount(userId: string): Promise<number>;
    markAsRead(userId: string, id: string): Promise<void>;
    markAllAsRead(userId: string): Promise<void>;
    deleteNotification(userId: string, id: string): Promise<void>;
}
