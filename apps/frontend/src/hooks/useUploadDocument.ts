import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentApiService } from '../services/document.service';
import { DOCUMENTS_QUERY_KEY } from './useDocuments';

export const useUploadDocument = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (formData: FormData) => documentApiService.uploadDocument(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_QUERY_KEY });
    },
  });

  return {
    uploadDocument: mutation.mutateAsync,
    isUploading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
};
