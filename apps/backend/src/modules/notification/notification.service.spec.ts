import { NotificationService } from './notification.service';
import {
  INotificationRepository,
  NotificationProps,
  NotificationType,
  NotificationSeverity,
  ChannelType,
} from '../../domain/notification/notification-repository.interface';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('NotificationService - Production Audit & Invariants', () => {
  let service: NotificationService;
  let mockRepo: jest.Mocked<INotificationRepository>;
  let mockRealtimeGateway: any;
  let notificationsStore: Map<string, NotificationProps>;

  const userA = 'user-uuid-1111';
  const userB = 'user-uuid-2222';

  beforeEach(() => {
    notificationsStore = new Map();

    mockRepo = {
      save: jest.fn().mockImplementation(async (n: NotificationProps) => {
        notificationsStore.set(n.id, { ...n });
        return n;
      }),
      findById: jest.fn().mockImplementation(async (id: string) => {
        return notificationsStore.get(id) || null;
      }),
      findByUserId: jest.fn().mockImplementation(async (userId: string) => {
        return Array.from(notificationsStore.values()).filter((n) => n.userId === userId);
      }),
      countUnread: jest.fn().mockImplementation(async (userId: string) => {
        return Array.from(notificationsStore.values()).filter((n) => n.userId === userId && !n.isRead).length;
      }),
      markAsRead: jest.fn().mockImplementation(async (id: string) => {
        const item = notificationsStore.get(id);
        if (item) item.isRead = true;
      }),
      markAllAsRead: jest.fn().mockImplementation(async (userId: string) => {
        notificationsStore.forEach((n) => {
          if (n.userId === userId) n.isRead = true;
        });
      }),
      delete: jest.fn().mockImplementation(async (id: string) => {
        notificationsStore.delete(id);
      }),
      findRecentSimilar: jest.fn().mockImplementation(async (userId, type, title, minutes) => {
        const cutoff = new Date(Date.now() - minutes * 60 * 1000);
        return (
          Array.from(notificationsStore.values()).find(
            (n) => n.userId === userId && n.type === type && n.title === title && n.createdAt >= cutoff,
          ) || null
        );
      }),
    };

    mockRealtimeGateway = {
      emitNotification: jest.fn(),
    };

    service = new NotificationService(mockRepo, mockRealtimeGateway);
  });

  describe('createNotification', () => {
    it('creates notification and dispatches WebSocket event to user private room', async () => {
      const created = await service.createNotification({
        userId: userA,
        type: NotificationType.SCHEME_ELIGIBILITY,
        title: "You're eligible for PM Kisan",
        body: 'Upload Aadhaar and land records to continue.',
        severity: NotificationSeverity.SUCCESS,
        metadata: { schemeId: 'sch-pm-kisan' },
      });

      expect(created.id).toBeDefined();
      expect(created.userId).toBe(userA);
      expect(created.type).toBe(NotificationType.SCHEME_ELIGIBILITY);
      expect(created.severity).toBe(NotificationSeverity.SUCCESS);
      expect(created.isRead).toBe(false);

      expect(mockRepo.save).toHaveBeenCalledTimes(1);
      expect(mockRealtimeGateway.emitNotification).toHaveBeenCalledWith(
        userA,
        expect.objectContaining({
          id: created.id,
          title: "You're eligible for PM Kisan",
          severity: NotificationSeverity.SUCCESS,
        }),
      );
    });

    it('deduplicates identical notifications within deduplicateMinutes window', async () => {
      // First dispatch
      const notif1 = await service.createNotification({
        userId: userA,
        type: NotificationType.DOCUMENT_REQUIRED,
        title: 'Income Certificate Required',
        body: 'Please upload income certificate.',
        deduplicateMinutes: 60,
      });

      // Second identical dispatch within 60 min
      const notif2 = await service.createNotification({
        userId: userA,
        type: NotificationType.DOCUMENT_REQUIRED,
        title: 'Income Certificate Required',
        body: 'Please upload income certificate.',
        deduplicateMinutes: 60,
      });

      expect(notif1.id).toBe(notif2.id);
      expect(mockRepo.save).toHaveBeenCalledTimes(1);
      expect(mockRealtimeGateway.emitNotification).toHaveBeenCalledTimes(1);
    });
  });

  describe('IDOR & Data Isolation Invariants', () => {
    it('prevents Citizen B from marking Citizen A notification as read', async () => {
      const notif = await service.createNotification({
        userId: userA,
        title: 'Private alert for A',
        body: 'Secret data',
      });

      await expect(service.markAsRead(userB, notif.id)).rejects.toThrow(ForbiddenException);
    });

    it('prevents Citizen B from deleting Citizen A notification', async () => {
      const notif = await service.createNotification({
        userId: userA,
        title: 'Private alert for A',
        body: 'Secret data',
      });

      await expect(service.deleteNotification(userB, notif.id)).rejects.toThrow(ForbiddenException);
      expect(notificationsStore.has(notif.id)).toBe(true);
    });

    it('throws NotFoundException when attempting to access non-existent notification', async () => {
      await expect(service.markAsRead(userA, 'non-existent-id')).rejects.toThrow(NotFoundException);
      await expect(service.deleteNotification(userA, 'non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('Read and Bulk Actions', () => {
    it('marks single notification as read when requested by owner', async () => {
      const notif = await service.createNotification({
        userId: userA,
        title: 'Alert 1',
        body: 'Content',
      });

      expect(notif.isRead).toBe(false);
      await service.markAsRead(userA, notif.id);
      const updated = await mockRepo.findById(notif.id);
      expect(updated?.isRead).toBe(true);
    });

    it('marks all notifications as read for target user only', async () => {
      await service.createNotification({ userId: userA, title: 'Alert A1', body: '...' });
      await service.createNotification({ userId: userA, title: 'Alert A2', body: '...' });
      await service.createNotification({ userId: userB, title: 'Alert B1', body: '...' });

      expect(await service.getUnreadCount(userA)).toBe(2);
      expect(await service.getUnreadCount(userB)).toBe(1);

      await service.markAllAsRead(userA);

      expect(await service.getUnreadCount(userA)).toBe(0);
      expect(await service.getUnreadCount(userB)).toBe(1); // User B untouched
    });
  });
});
