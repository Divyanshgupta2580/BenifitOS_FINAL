import { INotificationRepository, NotificationProps, ChannelType } from '../../domain/notification/notification-repository.interface';
export declare class NotificationService {
    private readonly notificationRepo;
    constructor(notificationRepo: INotificationRepository);
    sendNotification(userId: string, title: string, body: string, channel?: ChannelType): Promise<NotificationProps>;
    getUserNotifications(userId: string): Promise<NotificationProps[]>;
    markAsRead(userId: string, id: string): Promise<void>;
}
