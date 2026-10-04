import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback } from 'react';
import { notificationApiService, NotificationItem } from '../services/notification.service';
import { useAuthStore } from '../store/auth.store';
import { socketClient } from '../services/websocket-client';

export const NOTIFICATIONS_QUERY_KEY = 'notifications';
export const UNREAD_COUNT_QUERY_KEY = 'notifications-unread-count';

export function useNotifications() {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();
  const userId = user?.id;

  // 1. Fetch all notifications for user
  const notificationsQuery = useQuery({
    queryKey: [NOTIFICATIONS_QUERY_KEY, userId],
    queryFn: () => notificationApiService.getNotifications(),
    enabled: !!isAuthenticated && !!userId,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });

  // 2. Fetch unread count for user
  const unreadCountQuery = useQuery({
    queryKey: [UNREAD_COUNT_QUERY_KEY, userId],
    queryFn: () => notificationApiService.getUnreadCount(),
    enabled: !!isAuthenticated && !!userId,
    staleTime: 15 * 1000,
  });

  // 3. Mark single notification as read
  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationApiService.markAsRead(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY, userId] });
      await queryClient.cancelQueries({ queryKey: [UNREAD_COUNT_QUERY_KEY, userId] });

      const prevData = queryClient.getQueryData<any>([NOTIFICATIONS_QUERY_KEY, userId]);
      const prevUnread = queryClient.getQueryData<any>([UNREAD_COUNT_QUERY_KEY, userId]);

      if (prevData?.notifications) {
        queryClient.setQueryData([NOTIFICATIONS_QUERY_KEY, userId], {
          ...prevData,
          notifications: prevData.notifications.map((n: NotificationItem) =>
            n.id === id ? { ...n, isRead: true } : n,
          ),
        });
      }

      if (prevUnread && typeof prevUnread.unreadCount === 'number' && prevUnread.unreadCount > 0) {
        queryClient.setQueryData([UNREAD_COUNT_QUERY_KEY, userId], {
          unreadCount: Math.max(0, prevUnread.unreadCount - 1),
        });
      }

      return { prevData, prevUnread };
    },
    onError: (_err, _id, context) => {
      if (context?.prevData) {
        queryClient.setQueryData([NOTIFICATIONS_QUERY_KEY, userId], context.prevData);
      }
      if (context?.prevUnread) {
        queryClient.setQueryData([UNREAD_COUNT_QUERY_KEY, userId], context.prevUnread);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY, userId] });
      queryClient.invalidateQueries({ queryKey: [UNREAD_COUNT_QUERY_KEY, userId] });
    },
  });

  // 4. Mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationApiService.markAllAsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY, userId] });
      await queryClient.cancelQueries({ queryKey: [UNREAD_COUNT_QUERY_KEY, userId] });

      const prevData = queryClient.getQueryData<any>([NOTIFICATIONS_QUERY_KEY, userId]);
      const prevUnread = queryClient.getQueryData<any>([UNREAD_COUNT_QUERY_KEY, userId]);

      if (prevData?.notifications) {
        queryClient.setQueryData([NOTIFICATIONS_QUERY_KEY, userId], {
          ...prevData,
          unreadCount: 0,
          notifications: prevData.notifications.map((n: NotificationItem) => ({ ...n, isRead: true })),
        });
      }

      queryClient.setQueryData([UNREAD_COUNT_QUERY_KEY, userId], { unreadCount: 0 });

      return { prevData, prevUnread };
    },
    onError: (_err, _vars, context) => {
      if (context?.prevData) {
        queryClient.setQueryData([NOTIFICATIONS_QUERY_KEY, userId], context.prevData);
      }
      if (context?.prevUnread) {
        queryClient.setQueryData([UNREAD_COUNT_QUERY_KEY, userId], context.prevUnread);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY, userId] });
      queryClient.invalidateQueries({ queryKey: [UNREAD_COUNT_QUERY_KEY, userId] });
    },
  });

  // 5. Clear all notifications
  const clearAllNotificationsMutation = useMutation({
    mutationFn: () => notificationApiService.clearAllNotifications(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY, userId] });
      await queryClient.cancelQueries({ queryKey: [UNREAD_COUNT_QUERY_KEY, userId] });

      const prevData = queryClient.getQueryData<any>([NOTIFICATIONS_QUERY_KEY, userId]);
      const prevUnread = queryClient.getQueryData<any>([UNREAD_COUNT_QUERY_KEY, userId]);

      queryClient.setQueryData([NOTIFICATIONS_QUERY_KEY, userId], {
        count: 0,
        unreadCount: 0,
        notifications: [],
      });
      queryClient.setQueryData([UNREAD_COUNT_QUERY_KEY, userId], { unreadCount: 0 });

      return { prevData, prevUnread };
    },
    onError: (_err, _vars, context) => {
      if (context?.prevData) {
        queryClient.setQueryData([NOTIFICATIONS_QUERY_KEY, userId], context.prevData);
      }
      if (context?.prevUnread) {
        queryClient.setQueryData([UNREAD_COUNT_QUERY_KEY, userId], context.prevUnread);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY, userId] });
      queryClient.invalidateQueries({ queryKey: [UNREAD_COUNT_QUERY_KEY, userId] });
    },
  });

  // 6. Delete single notification
  const deleteNotificationMutation = useMutation({
    mutationFn: (id: string) => notificationApiService.deleteNotification(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY, userId] });
      const prevData = queryClient.getQueryData<any>([NOTIFICATIONS_QUERY_KEY, userId]);

      if (prevData?.notifications) {
        const deletedItem = prevData.notifications.find((n: NotificationItem) => n.id === id);
        queryClient.setQueryData([NOTIFICATIONS_QUERY_KEY, userId], {
          ...prevData,
          count: Math.max(0, (prevData.count || 1) - 1),
          unreadCount: deletedItem && !deletedItem.isRead
            ? Math.max(0, (prevData.unreadCount || 1) - 1)
            : prevData.unreadCount,
          notifications: prevData.notifications.filter((n: NotificationItem) => n.id !== id),
        });
      }

      return { prevData };
    },
    onError: (_err, _id, context) => {
      if (context?.prevData) {
        queryClient.setQueryData([NOTIFICATIONS_QUERY_KEY, userId], context.prevData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY, userId] });
      queryClient.invalidateQueries({ queryKey: [UNREAD_COUNT_QUERY_KEY, userId] });
    },
  });

  // 7. Real-time WebSocket Event Subscription
  const handleRealtimeNotification = useCallback(
    (newNotif: NotificationItem) => {
      if (!newNotif || (newNotif.userId && newNotif.userId !== userId)) return;

      queryClient.setQueryData([NOTIFICATIONS_QUERY_KEY, userId], (old: any) => {
        if (!old || !old.notifications) {
          return { count: 1, unreadCount: 1, notifications: [newNotif] };
        }
        // Avoid duplicate entry if already present
        const exists = old.notifications.some((n: NotificationItem) => n.id === newNotif.id);
        if (exists) return old;

        return {
          ...old,
          count: (old.count || 0) + 1,
          unreadCount: (old.unreadCount || 0) + 1,
          notifications: [newNotif, ...old.notifications],
        };
      });

      queryClient.setQueryData([UNREAD_COUNT_QUERY_KEY, userId], (old: any) => ({
        unreadCount: ((old?.unreadCount || 0) + 1),
      }));
    },
    [queryClient, userId],
  );

  useEffect(() => {
    if (!isAuthenticated || !userId) return;

    const unbind1 = socketClient.on('events.notification_received', handleRealtimeNotification);
    const unbind2 = socketClient.on('notification:new', handleRealtimeNotification);

    return () => {
      if (typeof unbind1 === 'function') unbind1();
      if (typeof unbind2 === 'function') unbind2();
    };
  }, [isAuthenticated, userId, handleRealtimeNotification]);

  const notifications = notificationsQuery.data?.notifications || [];
  const unreadCount =
    typeof unreadCountQuery.data?.unreadCount === 'number'
      ? unreadCountQuery.data.unreadCount
      : notifications.filter((n) => !n.isRead).length;

  return {
    notifications,
    unreadCount,
    isLoading: notificationsQuery.isLoading,
    isError: notificationsQuery.isError,
    error: notificationsQuery.error,
    refetch: notificationsQuery.refetch,
    markAsRead: markAsReadMutation.mutateAsync,
    isMarkingRead: markAsReadMutation.isPending,
    markAllAsRead: markAllAsReadMutation.mutateAsync,
    isMarkingAllRead: markAllAsReadMutation.isPending,
    clearAllNotifications: clearAllNotificationsMutation.mutateAsync,
    isClearingAll: clearAllNotificationsMutation.isPending,
    deleteNotification: deleteNotificationMutation.mutateAsync,
    isDeleting: deleteNotificationMutation.isPending,
  };
}
