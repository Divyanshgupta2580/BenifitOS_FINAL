import { useQuery } from '@tanstack/react-query';
import { applicationApiService } from '../services/application.service';

export const useApplication = (id: string | null) => {
  const query = useQuery({
    queryKey: ['application', id],
    queryFn: () => (id ? applicationApiService.getApplicationById(id) : Promise.reject('No ID')),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

  return {
    application: query.data?.application,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
