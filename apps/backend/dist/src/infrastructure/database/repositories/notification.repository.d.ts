import { PrismaService } from '../prisma.service';
import { INotificationRepository, NotificationProps } from '../../../domain/notification/notification-repository.interface';
export declare class NotificationRepositoryImpl implements INotificationRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private mapToEntity;
    findById(id: string): Promise<NotificationProps | null>;
    findByUserId(userId: string): Promise<NotificationProps[]>;
    save(notification: NotificationProps): Promise<NotificationProps>;
    markAsRead(id: string): Promise<void>;
    markAllAsRead(userId: string): Promise<void>;
}
