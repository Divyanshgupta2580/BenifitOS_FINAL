import { useQuery } from '@tanstack/react-query';
import { documentApiService } from '../services/document.service';

export const DOCUMENTS_QUERY_KEY = ['documents'];

export const useDocuments = () => {
  const query = useQuery({
    queryKey: DOCUMENTS_QUERY_KEY,
    queryFn: () => documentApiService.getDocuments(),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  return {
    documents: query.data?.documents || [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
