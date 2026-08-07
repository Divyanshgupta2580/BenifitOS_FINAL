import { useQuery } from '@tanstack/react-query';
import { applicationApiService } from '../services/application.service';

export const APPLICATIONS_QUERY_KEY = ['applications'];

export const useApplications = () => {
  const query = useQuery({
    queryKey: APPLICATIONS_QUERY_KEY,
    queryFn: () => applicationApiService.getApplications(),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  return {
    applications: query.data?.applications || [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
