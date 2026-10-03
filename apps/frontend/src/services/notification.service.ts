import { apiClient } from './api-client';

export type NotificationType =
  | 'SCHEME_ELIGIBILITY'
  | 'DOCUMENT_REQUIRED'
  | 'DOCUMENT_VERIFIED'
  | 'DOCUMENT_REJECTED'
  | 'APPLICATION_SUBMITTED'
  | 'APPLICATION_STATUS_CHANGED'
  | 'PROFILE_INCOMPLETE'
  | 'AI_GUIDANCE'
  | 'SYSTEM';

export type NotificationSeverity = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';

export interface NotificationItem {
  id: string;
  userId?: string;
  type: NotificationType;
  title: string;
  body: string;
  severity: NotificationSeverity;
  channel?: 'IN_APP' | 'SMS' | 'EMAIL' | 'WHATSAPP';
  isRead: boolean;
  metadata?: Record<string, any> | null;
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationsResponse {
  count: number;
  unreadCount: number;
  notifications: NotificationItem[];
}

export interface UnreadCountResponse {
  unreadCount: number;
}

export const notificationApiService = {
  async getNotifications(): Promise<NotificationsResponse> {
    return await apiClient.get<any, NotificationsResponse>('/notifications');
  },

  async getUnreadCount(): Promise<UnreadCountResponse> {
    return await apiClient.get<any, UnreadCountResponse>('/notifications/unread-count');
  },

  async markAsRead(id: string): Promise<{ message: string }> {
    return await apiClient.patch<any, { message: string }>(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<{ message: string }> {
    return await apiClient.patch<any, { message: string }>('/notifications/read-all');
  },

  async deleteNotification(id: string): Promise<void> {
    await apiClient.delete<any, void>(`/notifications/${id}`);
  },
};
