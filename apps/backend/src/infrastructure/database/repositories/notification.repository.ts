import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  INotificationRepository,
  NotificationProps,
  ChannelType,
  NotificationType,
  NotificationSeverity,
} from '../../../domain/notification/notification-repository.interface';
import { Prisma } from '@prisma/client';

@Injectable()
export class NotificationRepositoryImpl implements INotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToEntity(data: Prisma.NotificationGetPayload<{}>): NotificationProps {
    return {
      id: data.id,
      userId: data.userId,
      type: (data.type as NotificationType) || NotificationType.SYSTEM,
      title: data.title,
      body: data.body,
      severity: (data.severity as NotificationSeverity) || NotificationSeverity.INFO,
      channel: data.channel as ChannelType,
      isRead: data.isRead,
      metadata: (data.metadata as Record<string, unknown>) || null,
      dedupKey: (data as any).dedupKey || null,
      dismissedAt: (data as any).dismissedAt || null,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  async findById(id: string): Promise<NotificationProps | null> {
    const record = await this.prisma.client.notification.findUnique({ where: { id } });
    return record ? this.mapToEntity(record) : null;
  }

  async findByUserId(userId: string): Promise<NotificationProps[]> {
    const records = await this.prisma.client.notification.findMany({
      where: { userId, dismissedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return records.map((r: Prisma.NotificationGetPayload<{}>) => this.mapToEntity(r));
  }

  async countUnread(userId: string): Promise<number> {
    return await this.prisma.client.notification.count({
      where: { userId, isRead: false, dismissedAt: null },
    });
  }

  async save(notification: NotificationProps): Promise<NotificationProps> {
    const record = await this.prisma.client.notification.create({
      data: {
        id: notification.id,
        userId: notification.userId,
        type: notification.type || 'SYSTEM',
        title: notification.title,
        body: notification.body,
        severity: notification.severity || 'INFO',
        channel: notification.channel || 'IN_APP',
        isRead: notification.isRead || false,
        metadata: (notification.metadata as any) || {},
        dedupKey: notification.dedupKey || null,
        dismissedAt: notification.dismissedAt || null,
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
      where: { userId, isRead: false, dismissedAt: null },
      data: { isRead: true },
    });
  }

  async dismissAll(userId: string): Promise<number> {
    const result = await this.prisma.client.notification.updateMany({
      where: { userId, dismissedAt: null },
      data: { dismissedAt: new Date() },
    });
    return result.count;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.client.notification.delete({
      where: { id },
    });
  }

  async findByDedupKey(userId: string, dedupKey: string): Promise<NotificationProps | null> {
    const record = await this.prisma.client.notification.findFirst({
      where: {
        userId,
        dedupKey,
      },
      orderBy: { createdAt: 'desc' },
    });
    return record ? this.mapToEntity(record) : null;
  }

  async findRecentSimilar(
    userId: string,
    type: NotificationType,
    title: string,
    withinMinutes: number,
  ): Promise<NotificationProps | null> {
    const since = new Date(Date.now() - withinMinutes * 60 * 1000);
    const record = await this.prisma.client.notification.findFirst({
      where: {
        userId,
        type,
        title,
        createdAt: { gte: since },
      },
      orderBy: { createdAt: 'desc' },
    });
    return record ? this.mapToEntity(record) : null;
  }
}
