import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { citizenApiService, UpdateDemographicsDto } from '../services/citizen.service';

export const CITIZEN_PROFILE_QUERY_KEY = ['citizenProfile'];

export const useCitizenProfile = () => {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: CITIZEN_PROFILE_QUERY_KEY,
    queryFn: () => citizenApiService.getProfile(),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  const updateProfileMutation = useMutation({
    mutationFn: (dto: UpdateDemographicsDto) => citizenApiService.updateProfile(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CITIZEN_PROFILE_QUERY_KEY });
    },
  });

  return {
    profile: profileQuery.data?.profile,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    error: profileQuery.error,
    refetch: profileQuery.refetch,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdating: updateProfileMutation.isPending,
  };
};
