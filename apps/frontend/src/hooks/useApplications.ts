import { useQuery } from '@tanstack/react-query';
import { applicationApiService } from '../services/application.service';
import { useAuthStore } from '../store/auth.store';

export const APPLICATIONS_QUERY_KEY = ['applications'];

export const useApplications = () => {
  const { user } = useAuthStore();

  const query = useQuery({
    queryKey: ['applications', user?.id],
    queryFn: () => applicationApiService.getApplications(),
    enabled: !!user?.id,
  });

  return {
    applications: query.data?.applications || [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
