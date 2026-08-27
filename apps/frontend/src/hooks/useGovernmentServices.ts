import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { governmentApiService, GovernmentServiceItem } from '../services/government.service';
import { useAuthStore } from '../store/auth.store';

export const GOVERNMENT_SERVICES_QUERY_KEY = ['government-services'];

export const useGovernmentServices = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data: services = [], isLoading, isError, refetch } = useQuery<GovernmentServiceItem[]>({
    queryKey: ['government-services', user?.id],
    queryFn: () => governmentApiService.getIntegrationStatus(),
    enabled: !!user?.id,
  });

  const connectMutation = useMutation({
    mutationFn: async ({ aadhaarNumber, otp, txnId }: { aadhaarNumber?: string; otp?: string; txnId?: string }) => {
      if (otp && txnId) {
        return await governmentApiService.verifyAadhaarOtp(txnId, otp);
      }
      return await governmentApiService.requestAadhaarOtp(aadhaarNumber || '999999999999');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOVERNMENT_SERVICES_QUERY_KEY });
    },
  });

  const syncMutation = useMutation({
    mutationFn: (serviceId: string) => governmentApiService.syncService(serviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOVERNMENT_SERVICES_QUERY_KEY });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: (serviceId: string) => governmentApiService.disconnectService(serviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOVERNMENT_SERVICES_QUERY_KEY });
    },
  });

  return {
    services,
    isLoading,
    isError,
    refetch,
    connectService: connectMutation.mutateAsync,
    isConnecting: connectMutation.isPending,
    syncService: syncMutation.mutateAsync,
    isSyncing: syncMutation.isPending,
    disconnectService: disconnectMutation.mutateAsync,
    isDisconnecting: disconnectMutation.isPending,
  };
};

export const useGovernmentIntegration = useGovernmentServices;
export const useConnectGovernmentService = useGovernmentServices;
export const useDisconnectGovernmentService = useGovernmentServices;
export const useSyncGovernmentService = useGovernmentServices;
