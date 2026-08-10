import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { INotificationRepository, NotificationProps, ChannelType } from '../../../domain/notification/notification-repository.interface';
import { Prisma } from '@prisma/client';

@Injectable()
export class NotificationRepositoryImpl implements INotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToEntity(data: Prisma.NotificationGetPayload<{}>): NotificationProps {
    return {
      id: data.id,
      userId: data.userId,
      title: data.title,
      body: data.body,
      channel: data.channel as ChannelType,
      isRead: data.isRead,
      metadata: data.metadata as Record<string, unknown>,
      createdAt: data.createdAt,
    };
  }

  async findById(id: string): Promise<NotificationProps | null> {
    const record = await this.prisma.client.notification.findUnique({ where: { id } });
    return record ? this.mapToEntity(record) : null;
  }

  async findByUserId(userId: string): Promise<NotificationProps[]> {
    const records = await this.prisma.client.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return records.map((r: Prisma.NotificationGetPayload<{}>) => this.mapToEntity(r));
  }

  async save(notification: NotificationProps): Promise<NotificationProps> {
    const record = await this.prisma.client.notification.create({
      data: {
        id: notification.id,
        userId: notification.userId,
        title: notification.title,
        body: notification.body,
        channel: notification.channel,
        isRead: notification.isRead,
        metadata: notification.metadata || {},
      },
    });
    return this.mapToEntity(record);
  }

  async markAsRead(id: string): Promise<void> {
    await this.prisma.client.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.prisma.client.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}
