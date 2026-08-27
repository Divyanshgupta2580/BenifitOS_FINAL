import { useQuery } from '@tanstack/react-query';
import { recommendationApiService, SchemeRecommendationItem } from '../services/recommendation.service';
import { useAuthStore } from '../store/auth.store';

export const useRecommendations = () => {
  const { user } = useAuthStore();

  const query = useQuery({
    queryKey: ['recommendations', user?.id],
    queryFn: () => recommendationApiService.getRecommendations(),
    enabled: !!user?.id,
  });

  return {
    recommendations: query.data?.recommendations || [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
