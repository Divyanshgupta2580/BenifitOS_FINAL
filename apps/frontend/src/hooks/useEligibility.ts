import { useQuery } from '@tanstack/react-query';
import { recommendationApiService } from '../services/recommendation.service';

export const useEligibility = (schemeId: string | null) => {
  const query = useQuery({
    queryKey: ['eligibility', schemeId],
    queryFn: async () => {
      const response = await recommendationApiService.getRecommendations();
      const match = response.recommendations.find((r) => r.schemeId === schemeId);
      return match || null;
    },
    enabled: !!schemeId,
    staleTime: 1000 * 60 * 5,
  });

  return {
    eligibilityMatch: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
