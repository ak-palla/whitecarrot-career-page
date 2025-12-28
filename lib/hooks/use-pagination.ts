/**
 * Shared pagination hook
 * Provides pagination logic for consistent UX across components
 */

import { useState, useMemo, useCallback } from 'react';

export interface UsePaginationOptions {
  /**
   * Total number of items to paginate
   */
  totalItems: number;
  /**
   * Number of items per page
   * @default 20
   */
  itemsPerPage?: number;
  /**
   * Initial page number (1-indexed)
   * @default 1
   */
  initialPage?: number;
}

export interface UsePaginationReturn {
  /**
   * Current page number (1-indexed)
   */
  currentPage: number;
  /**
   * Total number of pages
   */
  totalPages: number;
  /**
   * Starting index for current page (0-indexed)
   */
  startIndex: number;
  /**
   * Ending index for current page (0-indexed, exclusive)
   */
  endIndex: number;
  /**
   * Function to change the current page
   */
  setCurrentPage: (page: number) => void;
  /**
   * Function to go to the next page
   */
  goToNextPage: () => void;
  /**
   * Function to go to the previous page
   */
  goToPreviousPage: () => void;
  /**
   * Function to go to the first page
   */
  goToFirstPage: () => void;
  /**
   * Function to go to the last page
   */
  goToLastPage: () => void;
  /**
   * Whether there is a next page
   */
  hasNextPage: boolean;
  /**
   * Whether there is a previous page
   */
  hasPreviousPage: boolean;
}

/**
 * Hook for pagination functionality
 * 
 * @example
 * ```tsx
 * const {
 *   currentPage,
 *   totalPages,
 *   startIndex,
 *   endIndex,
 *   setCurrentPage,
 *   hasNextPage,
 *   hasPreviousPage
 * } = usePagination({
 *   totalItems: 100,
 *   itemsPerPage: 20
 * });
 * 
 * const paginatedItems = items.slice(startIndex, endIndex);
 * ```
 */
export function usePagination(
  options: UsePaginationOptions
): UsePaginationReturn {
  const { totalItems, itemsPerPage = 20, initialPage = 1 } = options;
  
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalItems / itemsPerPage)),
    [totalItems, itemsPerPage]
  );

  const startIndex = useMemo(
    () => (currentPage - 1) * itemsPerPage,
    [currentPage, itemsPerPage]
  );

  const endIndex = useMemo(
    () => startIndex + itemsPerPage,
    [startIndex, itemsPerPage]
  );

  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  const goToNextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [hasNextPage]);

  const goToPreviousPage = useCallback(() => {
    if (hasPreviousPage) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [hasPreviousPage]);

  const goToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const goToLastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);

  const handleSetCurrentPage = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  }, [totalPages]);

  return {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    setCurrentPage: handleSetCurrentPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    hasNextPage,
    hasPreviousPage,
  };
}

