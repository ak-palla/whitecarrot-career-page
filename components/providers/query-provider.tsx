'use client';

/**
 * React Query provider component
 * Wraps the app with QueryClientProvider for client-side caching
 */

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/cache/query-client';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Create a new QueryClient instance for each provider instance
  // This ensures we don't share state between requests in SSR
  const [client] = useState(() => queryClient);

  return (
    <QueryClientProvider client={client}>
      {children}
    </QueryClientProvider>
  );
}

