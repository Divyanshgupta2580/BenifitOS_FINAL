import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { governmentApiService, GovernmentServiceItem } from '../services/government.service';

export const GOVERNMENT_SERVICES_QUERY_KEY = ['governmentServices'];

export const useGovernmentServices = () => {
  const queryClient = useQueryClient();

  const { data: services = [], isLoading, isError, refetch } = useQuery<GovernmentServiceItem[]>({
    queryKey: GOVERNMENT_SERVICES_QUERY_KEY,
    queryFn: () => governmentApiService.getIntegrationStatus(),
    staleTime: 5 * 60 * 1000,
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
