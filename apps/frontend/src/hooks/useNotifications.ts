import { useQuery } from '@tanstack/react-query';
import { notificationApiService } from '../services/notification.service';
import { useAuthStore } from '../store/auth.store';

export const useNotifications = () => {
  const { user } = useAuthStore();

  const query = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => notificationApiService.getNotifications(),
    enabled: !!user?.id,
  });

  return {
    notifications: query.data?.notifications || [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
