import { useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationApiService } from '../services/application.service';
import { APPLICATIONS_QUERY_KEY } from './useApplications';

export const useCreateApplication = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: { schemeId: string; formData?: Record<string, any>; attachedDocumentIds?: string[] }) =>
      applicationApiService.createApplication(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPLICATIONS_QUERY_KEY });
    },
  });

  return {
    createApplication: mutation.mutateAsync,
    isCreating: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
};
