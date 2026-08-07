import { useQuery } from '@tanstack/react-query';
import { welfareApiService } from '../services/welfare.service';

export interface UseSchemesParams {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const useSchemes = (params?: UseSchemesParams) => {
  const queryKey = ['schemes', params?.category || 'ALL', params?.search || '', params?.page || 1];

  const query = useQuery({
    queryKey,
    queryFn: () => welfareApiService.getSchemes(params),
    staleTime: 1000 * 60 * 10, // 10 minutes cache
  });

  return {
    schemes: query.data?.schemes || [],
    total: query.data?.total || 0,
    page: query.data?.page || 1,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
