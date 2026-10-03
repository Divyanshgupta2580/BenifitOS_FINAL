import React, { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppNavigator } from './navigation/AppNavigator';
import { useThemeStore } from './store/theme.store';
import { queryClient } from './queryClient';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

export default function App() {
  const { initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppNavigator />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
