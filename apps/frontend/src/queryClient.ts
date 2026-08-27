import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 0, // Always consider cache stale so switching users or navigating immediately fetches latest data
      refetchOnMount: 'always',
      refetchOnWindowFocus: false,
    },
  },
});
