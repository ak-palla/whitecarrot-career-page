'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServerPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  className?: string;
}

export function ServerPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  className,
}: ServerPaginationProps) {
  const searchParams = useSearchParams();
  
  if (totalPages <= 1) return null;

  const getPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page > 1) {
      params.set('page', page.toString());
    } else {
      params.delete('page');
    }
    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  };

  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage <= 3) {
        for (let i = 2; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  return (
    <nav
      aria-label="Pagination"
      className={cn('flex flex-col items-center gap-4 mt-8', className)}
    >
      <p className="text-sm text-muted-foreground">
        Showing {startIndex + 1}-{endIndex} of {totalItems} {totalItems === 1 ? 'job' : 'jobs'}
      </p>
      <div className="flex items-center justify-center gap-2">
        <Link href={getPageUrl(currentPage - 1)}>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Previous</span>
          </Button>
        </Link>

        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => {
            if (page === 'ellipsis') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 text-muted-foreground"
                >
                  ...
                </span>
              );
            }

            return (
              <Link key={page} href={getPageUrl(page)}>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    'min-w-[2.5rem]',
                    currentPage === page && 'bg-primary text-primary-foreground'
                  )}
                  aria-label={`Page ${page}`}
                  aria-current={currentPage === page ? 'page' : undefined}
                >
                  {page}
                </Button>
              </Link>
            );
          })}
        </div>

        <Link href={getPageUrl(currentPage + 1)}>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            <span className="hidden sm:inline mr-1">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </nav>
  );
}

