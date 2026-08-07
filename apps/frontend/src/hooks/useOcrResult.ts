import { useQuery } from '@tanstack/react-query';
import { ocrApiService } from '../services/ocr.service';

export const useOcrResult = (documentId: string | null) => {
  const query = useQuery({
    queryKey: ['ocrResult', documentId],
    queryFn: () => (documentId ? ocrApiService.getOcrResult(documentId) : Promise.reject('No Document ID')),
    enabled: !!documentId,
    staleTime: 1000 * 60 * 10, // 10 minutes cache
  });

  return {
    ocrResult: query.data?.result,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
