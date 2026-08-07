import { useQuery } from '@tanstack/react-query';
import { documentApiService } from '../services/document.service';

export const useDocument = (id: string | null) => {
  const query = useQuery({
    queryKey: ['document', id],
    queryFn: () => (id ? documentApiService.getDocumentById(id) : Promise.reject('No ID')),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

  return {
    document: query.data?.document,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
