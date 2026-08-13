import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppNavigator } from './navigation/AppNavigator';
import { useThemeStore } from './store/theme.store';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

export default function App() {
  const { initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <QueryClientProvider client={queryClient}>
      <AppNavigator />
    </QueryClientProvider>
  );
}
