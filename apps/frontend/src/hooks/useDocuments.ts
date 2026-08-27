import { useQuery } from '@tanstack/react-query';
import { documentApiService } from '../services/document.service';
import { useAuthStore } from '../store/auth.store';

export const DOCUMENTS_QUERY_KEY = ['documents'];

export const useDocuments = () => {
  const { user } = useAuthStore();

  const query = useQuery({
    queryKey: ['documents', user?.id],
    queryFn: () => documentApiService.getDocuments(),
    enabled: !!user?.id,
  });

  return {
    documents: query.data?.documents || [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
