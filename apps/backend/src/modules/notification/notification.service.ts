import { Injectable, Inject } from '@nestjs/common';
import { INotificationRepository, NotificationProps, ChannelType } from '../../domain/notification/notification-repository.interface';
import { randomUUID } from 'crypto';

@Injectable()
export class NotificationService {
  constructor(
    @Inject('INotificationRepository') private readonly notificationRepo: INotificationRepository,
  ) {}

  async sendNotification(userId: string, title: string, body: string, channel = ChannelType.IN_APP): Promise<NotificationProps> {
    const notification: NotificationProps = {
      id: randomUUID(),
      userId,
      title,
      body,
      channel,
      isRead: false,
      createdAt: new Date(),
    };
    return await this.notificationRepo.save(notification);
  }

  async getUserNotifications(userId: string): Promise<NotificationProps[]> {
    return await this.notificationRepo.findByUserId(userId);
  }

  async markAsRead(id: string): Promise<void> {
    await this.notificationRepo.markAsRead(id);
  }
}
