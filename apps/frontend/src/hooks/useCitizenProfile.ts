import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { citizenApiService, UpdateDemographicsDto } from '../services/citizen.service';
import { useAuthStore } from '../store/auth.store';

export const useCitizenProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const profileQuery = useQuery({
    queryKey: ['citizen-profile', user?.id],
    queryFn: () => citizenApiService.getProfile(),
    enabled: !!user?.id,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (dto: UpdateDemographicsDto) => citizenApiService.updateProfile(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['citizen-profile'] });
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
