import { PrismaService } from '../prisma.service';
import { INotificationRepository, NotificationProps, NotificationType } from '../../../domain/notification/notification-repository.interface';
export declare class NotificationRepositoryImpl implements INotificationRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private mapToEntity;
    findById(id: string): Promise<NotificationProps | null>;
    findByUserId(userId: string): Promise<NotificationProps[]>;
    countUnread(userId: string): Promise<number>;
    save(notification: NotificationProps): Promise<NotificationProps>;
    markAsRead(id: string): Promise<void>;
    markAllAsRead(userId: string): Promise<void>;
    delete(id: string): Promise<void>;
    findRecentSimilar(userId: string, type: NotificationType, title: string, withinMinutes: number): Promise<NotificationProps | null>;
}
