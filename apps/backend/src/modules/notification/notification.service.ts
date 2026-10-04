import { Injectable, Inject, Optional, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import {
  INotificationRepository,
  NotificationProps,
  ChannelType,
  NotificationType,
  NotificationSeverity,
} from '../../domain/notification/notification-repository.interface';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { randomUUID } from 'crypto';

export interface CreateNotificationDto {
  userId: string;
  type?: NotificationType;
  title: string;
  body: string;
  severity?: NotificationSeverity;
  channel?: ChannelType;
  metadata?: Record<string, any>;
  dedupKey?: string;
  deduplicateMinutes?: number;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @Inject('INotificationRepository') private readonly notificationRepo: INotificationRepository,
    @Optional() private readonly realtimeGateway?: RealtimeGateway,
  ) {}

  async createNotification(dto: CreateNotificationDto): Promise<NotificationProps> {
    const type = dto.type || NotificationType.SYSTEM;
    const severity = dto.severity || NotificationSeverity.INFO;
    const channel = dto.channel || ChannelType.IN_APP;

    // Deterministic dedupKey check (e.g. userId + schemeId + type + schemeVersion)
    if (dto.dedupKey) {
      const existing = await this.notificationRepo.findByDedupKey(dto.userId, dto.dedupKey);
      if (existing) {
        this.logger.debug(`Skipping duplicate notification with dedupKey '${dto.dedupKey}' for user ${dto.userId}`);
        return existing;
      }
    }

    // Time-based deduplication check to prevent spamming identical notifications
    if (dto.deduplicateMinutes && dto.deduplicateMinutes > 0) {
      const recent = await this.notificationRepo.findRecentSimilar(
        dto.userId,
        type,
        dto.title,
        dto.deduplicateMinutes,
      );
      if (recent) {
        this.logger.debug(`Skipping duplicate notification '${dto.title}' for user ${dto.userId}`);
        return recent;
      }
    }

    const notification: NotificationProps = {
      id: randomUUID(),
      userId: dto.userId,
      type,
      title: dto.title,
      body: dto.body,
      severity,
      channel,
      isRead: false,
      metadata: dto.metadata || null,
      dedupKey: dto.dedupKey || null,
      dismissedAt: null,
      createdAt: new Date(),
    };

    const saved = await this.notificationRepo.save(notification);

    // Emit via WebSocket in real time to user's private room
    try {
      if (this.realtimeGateway) {
        this.realtimeGateway.emitNotification(dto.userId, {
          id: saved.id,
          userId: saved.userId,
          type: saved.type,
          title: saved.title,
          body: saved.body,
          severity: saved.severity,
          isRead: saved.isRead,
          metadata: saved.metadata,
          createdAt: saved.createdAt,
        });
      }
    } catch (err: any) {
      this.logger.warn(`Failed to emit realtime notification: ${err?.message}`);
    }

    return saved;
  }

  // Backwards-compatible sendNotification
  async sendNotification(
    userId: string,
    title: string,
    body: string,
    channel = ChannelType.IN_APP,
    type = NotificationType.SYSTEM,
    severity = NotificationSeverity.INFO,
    metadata?: Record<string, any>,
    dedupKey?: string,
  ): Promise<NotificationProps> {
    return await this.createNotification({
      userId,
      title,
      body,
      channel,
      type,
      severity,
      metadata,
      dedupKey,
    });
  }

  async getUserNotifications(userId: string): Promise<NotificationProps[]> {
    return await this.notificationRepo.findByUserId(userId);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await this.notificationRepo.countUnread(userId);
  }

  async markAsRead(userId: string, id: string): Promise<void> {
    const notification = await this.notificationRepo.findById(id);
    if (!notification) {
      throw new NotFoundException(`Notification with ID '${id}' not found.`);
    }
    if (notification.userId !== userId) {
      throw new ForbiddenException('Access denied: You do not own this notification.');
    }
    await this.notificationRepo.markAsRead(id);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepo.markAllAsRead(userId);
  }

  async clearAllNotifications(userId: string): Promise<{ clearedCount: number }> {
    const clearedCount = await this.notificationRepo.dismissAll(userId);
    return { clearedCount };
  }

  async deleteNotification(userId: string, id: string): Promise<void> {
    const notification = await this.notificationRepo.findById(id);
    if (!notification) {
      throw new NotFoundException(`Notification with ID '${id}' not found.`);
    }
    if (notification.userId !== userId) {
      throw new ForbiddenException('Access denied: You do not own this notification.');
    }
    await this.notificationRepo.delete(id);
  }
}
