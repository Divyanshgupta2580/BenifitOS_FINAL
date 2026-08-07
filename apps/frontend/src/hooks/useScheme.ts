import { useQuery } from '@tanstack/react-query';
import { welfareApiService } from '../services/welfare.service';

export const useScheme = (id: string | null) => {
  const query = useQuery({
    queryKey: ['scheme', id],
    queryFn: () => (id ? welfareApiService.getSchemeById(id) : Promise.reject('No ID')),
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });

  return {
    scheme: query.data?.scheme,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
