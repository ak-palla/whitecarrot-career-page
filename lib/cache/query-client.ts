/**
 * React Query client configuration
 * Provides caching, background refetching, and stale-while-revalidate behavior
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: how long data is considered fresh
      // Data won't be refetched until this time has passed
      staleTime: 1000 * 60 * 5, // 5 minutes
      
      // Cache time: how long unused data stays in cache
      // After this time, data is garbage collected
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      
      // Retry failed requests
      retry: 1,
      
      // Refetch on window focus (disabled for better performance)
      refetchOnWindowFocus: false,
      
      // Don't refetch on reconnect by default (can be overridden per query)
      refetchOnReconnect: false,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
});

