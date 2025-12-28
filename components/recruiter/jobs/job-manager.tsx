'use client';

/**
 * Job Manager Component
 * Main component for managing job postings
 * Refactored to use split components for better maintainability
 */

import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createJob, updateJob, deleteJob, bulkUpdateJobsPublished, bulkDeleteJobs } from '@/app/actions/jobs';
import { useJobs, jobsQueryKey } from '@/lib/hooks/use-jobs';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Upload } from 'lucide-react';
import { JobFormDialog } from './job-form-dialog';
import { CSVImportDialog } from './csv-import-dialog';
import { JobFilters } from './job-filters';
import { BulkActions } from './bulk-actions';
import { JobList } from './job-list';
import { JobListSkeleton } from '@/components/skeletons/job-list-skeleton';
import { useJobFilters } from './hooks/use-job-filters';
import type { Job, CreateJobInput, UpdateJobInput } from '@/lib/types';

interface JobManagerProps {
  companyId: string;
}

export function JobManager({ companyId }: JobManagerProps) {
  const queryClient = useQueryClient();
  const { data: jobs = [], isLoading: loading } = useJobs(companyId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [togglingJobId, setTogglingJobId] = useState<string | null>(null);
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);
  const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(new Set());

  // Use the custom hook for filters
  const {
    searchQuery,
    selectedLocation,
    selectedJobType,
    selectedTeam,
    selectedPublishedStatus,
    filterOptions,
    filteredJobs,
    hasActiveFilters: hasActiveFiltersValue,
    setSearchQuery,
    setSelectedLocation,
    setSelectedJobType,
    setSelectedTeam,
    setSelectedPublishedStatus,
    clearFilters,
  } = useJobFilters({ jobs });

  // Clear selection when filters change
  useEffect(() => {
    setSelectedJobIds(new Set());
  }, [selectedLocation, selectedJobType, selectedTeam, selectedPublishedStatus]);

  // Mutations with React Query
  const createMutation = useMutation({
    mutationFn: (data: CreateJobInput) => createJob(companyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobsQueryKey(companyId) });
      setDialogOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ jobId, data }: { jobId: string; data: UpdateJobInput }) =>
      updateJob(jobId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobsQueryKey(companyId) });
      setEditingJob(null);
      setDialogOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (jobId: string) => deleteJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobsQueryKey(companyId) });
    },
  });

  const togglePublishMutation = useMutation({
    mutationFn: ({ jobId, published }: { jobId: string; published: boolean }) =>
      updateJob(jobId, { published }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobsQueryKey(companyId) });
    },
  });

  const bulkPublishMutation = useMutation({
    mutationFn: (jobIds: string[]) => bulkUpdateJobsPublished(jobIds, true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobsQueryKey(companyId) });
      setSelectedJobIds(new Set());
    },
  });

  const bulkUnpublishMutation = useMutation({
    mutationFn: (jobIds: string[]) => bulkUpdateJobsPublished(jobIds, false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobsQueryKey(companyId) });
      setSelectedJobIds(new Set());
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (jobIds: string[]) => bulkDeleteJobs(jobIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobsQueryKey(companyId) });
      setSelectedJobIds(new Set());
    },
  });

  async function handleCreate(data: CreateJobInput) {
    createMutation.mutate(data);
  }

  async function handleUpdate(data: UpdateJobInput) {
    if (!editingJob) return;
    updateMutation.mutate({ jobId: editingJob.id, data });
  }

  async function togglePublish(job: Job) {
    setTogglingJobId(job.id);
    togglePublishMutation.mutate(
      { jobId: job.id, published: !job.published },
      {
        onSettled: () => {
          setTogglingJobId(null);
        },
      }
    );
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this job? This cannot be undone.')) return;
    setDeletingJobId(id);
    deleteMutation.mutate(id, {
      onSettled: () => {
        setDeletingJobId(null);
      },
    });
  }

  // Helper to invalidate and refetch jobs
  const refetchJobs = async () => {
    // Invalidate cache first, then force immediate refetch
    queryClient.invalidateQueries({ queryKey: jobsQueryKey(companyId) });
    
    // Force immediate refetch
    await queryClient.refetchQueries({ 
      queryKey: jobsQueryKey(companyId),
      type: 'active'
    });
  };

  // Selection helper functions
  const toggleJobSelection = useCallback((jobId: string) => {
    setSelectedJobIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  }, []);

  const selectAllJobs = useCallback((jobIds: string[]) => {
    // Select only the provided job IDs (should be from current page)
    setSelectedJobIds((prev) => {
      const newSet = new Set(prev);
      jobIds.forEach(id => newSet.add(id));
      return newSet;
    });
  }, []);

  const deselectAllJobs = useCallback(() => {
    setSelectedJobIds(new Set());
  }, []);

  // Bulk action handlers
  async function handleBulkPublish() {
    if (selectedJobIds.size === 0) return;
    bulkPublishMutation.mutate(Array.from(selectedJobIds), {
      onError: (error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : 'Failed to publish jobs';
        alert(`Error: ${errorMessage}`);
      },
    });
  }

  async function handleBulkUnpublish() {
    if (selectedJobIds.size === 0) return;
    bulkUnpublishMutation.mutate(Array.from(selectedJobIds), {
      onError: (error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : 'Failed to unpublish jobs';
        alert(`Error: ${errorMessage}`);
      },
    });
  }

  async function handleBulkDelete() {
    if (selectedJobIds.size === 0) return;
    
    if (!confirm(`Delete ${selectedJobIds.size} job(s)? This cannot be undone.`)) return;
    
    bulkDeleteMutation.mutate(Array.from(selectedJobIds), {
      onError: (error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete jobs';
        alert(`Error: ${errorMessage}`);
      },
    });
  }

  const bulkActionLoading =
    bulkPublishMutation.isPending ||
    bulkUnpublishMutation.isPending ||
    bulkDeleteMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Job Postings</h2>
        <div className="flex gap-2">
          <Button
            onClick={() => setCsvImportOpen(true)}
            variant="outline"
            className="text-black"
          >
            <Upload className="mr-2 h-4 w-4" /> Import CSV
          </Button>
          <Button
            onClick={() => {
              setEditingJob(null);
              setDialogOpen(true);
            }}
            className="bg-create-company hover:bg-create-company text-black"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Job
          </Button>
        </div>
      </div>

      {loading ? (
        <JobListSkeleton count={5} />
      ) : jobs.length === 0 ? (
        <div className="text-center p-12 bg-gray-50 rounded-lg border border-dashed text-muted-foreground">
          <p>No jobs posted yet. Create your first listing.</p>
        </div>
      ) : (
        <>
          <JobFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedLocation={selectedLocation}
            onLocationChange={setSelectedLocation}
            selectedJobType={selectedJobType}
            onJobTypeChange={setSelectedJobType}
            selectedTeam={selectedTeam}
            onTeamChange={setSelectedTeam}
            selectedPublishedStatus={selectedPublishedStatus}
            onPublishedStatusChange={setSelectedPublishedStatus}
            filterOptions={filterOptions}
            hasActiveFilters={hasActiveFiltersValue}
            filteredJobsCount={filteredJobs.length}
            onClearFilters={clearFilters}
          />

          <BulkActions
            selectedCount={selectedJobIds.size}
            bulkActionLoading={bulkActionLoading}
            onBulkPublish={handleBulkPublish}
            onBulkUnpublish={handleBulkUnpublish}
            onBulkDelete={handleBulkDelete}
            onClearSelection={deselectAllJobs}
          />

          {filteredJobs.length === 0 && hasActiveFiltersValue ? (
            <div className="text-center py-12">
              <p className="text-lg mb-4 text-muted-foreground">
                No jobs match your filters
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear all filters
              </Button>
            </div>
          ) : (
            <JobList
              jobs={filteredJobs}
              loading={loading}
              togglingJobId={togglingJobId}
              deletingJobId={deletingJobId}
              selectedJobIds={selectedJobIds}
              bulkActionLoading={bulkActionLoading}
              onTogglePublish={togglePublish}
              onEdit={(job) => {
                setEditingJob(job);
                setDialogOpen(true);
              }}
              onDelete={handleDelete}
              onToggleSelection={toggleJobSelection}
              onSelectAll={selectAllJobs}
              onDeselectAll={deselectAllJobs}
            />
          )}
        </>
      )}

      <JobFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={editingJob ? handleUpdate : handleCreate}
        initialData={editingJob}
        key={editingJob ? editingJob.id : 'new'}
      />

      <CSVImportDialog
        open={csvImportOpen}
        onOpenChange={setCsvImportOpen}
        companyId={companyId}
        onImportComplete={refetchJobs}
      />
    </div>
  );
}
