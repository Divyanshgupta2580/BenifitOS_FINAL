import { useQuery } from '@tanstack/react-query';
import { notificationApiService } from '../services/notification.service';

export const NOTIFICATIONS_QUERY_KEY = ['notifications'];

export const useNotifications = () => {
  const query = useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: () => notificationApiService.getNotifications(),
    staleTime: 1000 * 60 * 2,
  });

  return {
    notifications: query.data?.notifications || [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
