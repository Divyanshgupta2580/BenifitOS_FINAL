import { useQuery } from '@tanstack/react-query';
import { recommendationApiService, SchemeRecommendationItem } from '../services/recommendation.service';

export const RECOMMENDATIONS_QUERY_KEY = ['recommendations'];

export const useRecommendations = () => {
  const query = useQuery({
    queryKey: RECOMMENDATIONS_QUERY_KEY,
    queryFn: () => recommendationApiService.getRecommendations(),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  return {
    recommendations: query.data?.recommendations || [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
