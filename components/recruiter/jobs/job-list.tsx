'use client';

/**
 * Job List Component
 * Displays the list of jobs with selection, actions, and pagination
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { JobListSkeleton } from '@/components/skeletons/job-list-skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Pagination } from '@/components/ui/pagination';
import { usePagination } from '@/lib/hooks/use-pagination';
import type { Job } from '@/lib/types';
import { formatJobType } from '@/lib/utils/job-helpers';

interface JobListProps {
  jobs: Job[];
  loading?: boolean;
  togglingJobId: string | null;
  deletingJobId: string | null;
  selectedJobIds: Set<string>;
  bulkActionLoading: boolean;
  onTogglePublish: (job: Job) => void;
  onEdit: (job: Job) => void;
  onDelete: (jobId: string) => void;
  onToggleSelection: (jobId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export function JobList({
  jobs,
  loading = false,
  togglingJobId,
  deletingJobId,
  selectedJobIds,
  bulkActionLoading,
  onTogglePublish,
  onEdit,
  onDelete,
  onToggleSelection,
  onSelectAll,
  onDeselectAll,
}: JobListProps) {
  const selectAllCheckboxRef = useRef<HTMLButtonElement>(null);

  // Pagination
  const {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    setCurrentPage,
  } = usePagination({
    totalItems: jobs.length,
    itemsPerPage: 20,
  });

  const paginatedJobs = useMemo(() => {
    return jobs.slice(startIndex, endIndex);
  }, [jobs, startIndex, endIndex]);

  // Selection state
  const isAllSelected = useMemo(() => {
    if (paginatedJobs.length === 0) return false;
    return paginatedJobs.every((job) => selectedJobIds.has(job.id));
  }, [paginatedJobs, selectedJobIds]);

  const isSomeSelected = useMemo(() => {
    const selectedCount = paginatedJobs.filter((job) => selectedJobIds.has(job.id)).length;
    return selectedCount > 0 && selectedCount < paginatedJobs.length;
  }, [paginatedJobs, selectedJobIds]);

  // Handle indeterminate state for select all checkbox
  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      const button = selectAllCheckboxRef.current;
      if (isSomeSelected) {
        button.setAttribute('data-state', 'indeterminate');
        button.setAttribute('aria-checked', 'mixed');
      } else {
        button.removeAttribute('data-state');
        button.removeAttribute('aria-checked');
      }
    }
  }, [isSomeSelected, isAllSelected]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [setCurrentPage]);

  if (loading) {
    return <JobListSkeleton count={5} />;
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center p-12 bg-gray-50 rounded-lg border border-dashed text-muted-foreground">
        <p>No jobs posted yet. Create your first listing.</p>
      </div>
    );
  }

  return (
    <>
      {/* Select All Checkbox */}
      {paginatedJobs.length > 0 && (
        <div className="flex items-center space-x-2 pb-2 border-b mb-4">
          <Checkbox
            ref={selectAllCheckboxRef}
            checked={isAllSelected}
            onCheckedChange={(checked) => {
              if (checked) {
                onSelectAll();
              } else {
                onDeselectAll();
              }
            }}
          />
          <Label className="text-sm font-medium cursor-pointer" onClick={() => {
            if (isAllSelected) {
              onDeselectAll();
            } else {
              onSelectAll();
            }
          }}>
            Select All
          </Label>
        </div>
      )}

      {/* Job Listings */}
      <div className="space-y-3">
        {paginatedJobs.map((job) => (
          <div
            key={job.id}
            className={`flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm hover:border-gray-300 transition-colors ${
              deletingJobId === job.id ? 'opacity-50' : ''
            } ${
              selectedJobIds.has(job.id) ? 'bg-blue-50 border-blue-500' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <Checkbox
                checked={selectedJobIds.has(job.id)}
                onCheckedChange={() => onToggleSelection(job.id)}
                disabled={bulkActionLoading || deletingJobId === job.id}
              />
              {deletingJobId === job.id && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
              <div>
                <h3 className="font-medium text-base">{job.title}</h3>
                <div className="flex gap-2 text-sm text-gray-500 mt-1 items-center flex-wrap">
                  {job.location && <span>{job.location}</span>}
                  {job.location && job.job_type && (
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  )}
                  {job.job_type && <span className="capitalize">{formatJobType(job.job_type)}</span>}
                  {job.team && (
                    <>
                      {(job.location || job.job_type) && (
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      )}
                      <span>{job.team}</span>
                    </>
                  )}
                  {job.work_policy && (
                    <>
                      {(job.location || job.job_type || job.team) && (
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      )}
                      <span>{job.work_policy}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={job.published}
                  onCheckedChange={() => onTogglePublish(job)}
                  disabled={togglingJobId === job.id}
                />
                <span className="text-sm font-medium">
                  {togglingJobId === job.id ? (
                    <span className="flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      {job.published ? 'Publishing...' : 'Unpublishing...'}
                    </span>
                  ) : (
                    job.published ? 'Published' : 'Draft'
                  )}
                </span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => onEdit(job)}>
                    <Pencil className="mr-2 h-4 w-4" /> Edit Details
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onClick={() => onDelete(job.id)}
                    disabled={deletingJobId === job.id}
                  >
                    {deletingJobId === job.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, jobs.length)} of {jobs.length}{' '}
            {jobs.length === 1 ? 'job' : 'jobs'}
          </p>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </>
  );
}

