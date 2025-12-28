/**
 * Shared debounced search hook
 * Provides debounced search functionality for consistent UX across components
 */

import { useState, useEffect } from 'react';

export interface UseDebouncedSearchOptions {
  /**
   * Debounce delay in milliseconds
   * @default 300
   */
  delay?: number;
  /**
   * Initial search query value
   * @default ''
   */
  initialValue?: string;
}

export interface UseDebouncedSearchReturn {
  /**
   * Current search query (immediate updates)
   */
  searchQuery: string;
  /**
   * Debounced search query (updates after delay)
   */
  debouncedSearchQuery: string;
  /**
   * Function to update the search query
   */
  setSearchQuery: (value: string) => void;
  /**
   * Function to clear the search query
   */
  clearSearch: () => void;
}

/**
 * Hook for debounced search functionality
 * 
 * @example
 * ```tsx
 * const { searchQuery, debouncedSearchQuery, setSearchQuery, clearSearch } = useDebouncedSearch({
 *   delay: 300,
 *   initialValue: ''
 * });
 * ```
 */
export function useDebouncedSearch(
  options: UseDebouncedSearchOptions = {}
): UseDebouncedSearchReturn {
  const { delay = 300, initialValue = '' } = options;
  
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(initialValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, delay);

    return () => clearTimeout(timer);
  }, [searchQuery, delay]);

  const clearSearch = () => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
  };

  return {
    searchQuery,
    debouncedSearchQuery,
    setSearchQuery,
    clearSearch,
  };
}

