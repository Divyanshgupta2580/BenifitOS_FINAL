import { useQuery } from '@tanstack/react-query';
import { recommendationApiService } from '../services/recommendation.service';

export const useRecommendationComparison = (ids: string[]) => {
  const query = useQuery({
    queryKey: ['recommendationComparison', ids.join(',')],
    queryFn: () => (ids.length > 0 ? recommendationApiService.compareRecommendations(ids) : Promise.resolve([])),
    enabled: ids.length > 0,
    staleTime: 1000 * 60 * 5,
  });

  return {
    comparedRecommendations: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
