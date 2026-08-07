import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ocrApiService } from '../services/ocr.service';

export const useProcessOcr = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (documentId: string) => ocrApiService.processDocument(documentId),
    onSuccess: (data, documentId) => {
      queryClient.setQueryData(['ocrResult', documentId], data);
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  return {
    processOcr: mutation.mutateAsync,
    isProcessing: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
};
