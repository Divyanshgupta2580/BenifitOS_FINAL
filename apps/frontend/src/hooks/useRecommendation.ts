import { useQuery } from '@tanstack/react-query';
import { recommendationApiService } from '../services/recommendation.service';

export const useRecommendation = (id: string | null) => {
  const query = useQuery({
    queryKey: ['recommendation', id],
    queryFn: () => (id ? recommendationApiService.getRecommendationById(id) : Promise.resolve(null)),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

  return {
    recommendation: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
