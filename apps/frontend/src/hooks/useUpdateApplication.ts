import { useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationApiService } from '../services/application.service';
import { APPLICATIONS_QUERY_KEY } from './useApplications';

export const useUpdateApplication = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status?: string; formData?: Record<string, any>; attachedDocumentIds?: string[] } }) =>
      applicationApiService.updateApplication(id, data),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: APPLICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['application', variables.id] });
    },
  });

  return {
    updateApplication: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    isError: mutation.isError,
  };
};
