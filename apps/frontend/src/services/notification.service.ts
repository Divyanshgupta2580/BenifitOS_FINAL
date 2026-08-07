import { apiClient } from './api-client';

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: NotificationItem[];
}

export const notificationApiService = {
  async getNotifications(): Promise<NotificationsResponse> {
    return await apiClient.get('/notifications');
  },
};
