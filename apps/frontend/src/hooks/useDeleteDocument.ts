import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentApiService } from '../services/document.service';
import { DOCUMENTS_QUERY_KEY } from './useDocuments';

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => documentApiService.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_QUERY_KEY });
    },
  });

  return {
    deleteDocument: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    isError: mutation.isError,
  };
};
