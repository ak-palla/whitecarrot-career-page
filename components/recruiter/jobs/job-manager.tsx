'use client';

/**
 * Job Manager Component
 * Main component for managing job postings
 * Refactored to use split components for better maintainability
 */

import { useState, useEffect, useCallback } from 'react';
import { getJobs, createJob, updateJob, deleteJob, bulkUpdateJobsPublished, bulkDeleteJobs } from '@/app/actions/jobs';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Upload } from 'lucide-react';
import { JobFormDialog } from './job-form-dialog';
import { CSVImportDialog } from './csv-import-dialog';
import { JobFilters } from './job-filters';
import { BulkActions } from './bulk-actions';
import { JobList } from './job-list';
import { useJobFilters } from './hooks/use-job-filters';
import type { Job, CreateJobInput, UpdateJobInput } from '@/lib/types';

interface JobManagerProps {
  companyId: string;
}

export function JobManager({ companyId }: JobManagerProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [togglingJobId, setTogglingJobId] = useState<string | null>(null);
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);
  const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

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

  // Reset to page 1 when filters change
  useEffect(() => {
    // This will be handled by the pagination hook in JobList
  }, [selectedLocation, selectedJobType, selectedTeam, selectedPublishedStatus]);

  // Clear selection when filters change
  useEffect(() => {
    setSelectedJobIds(new Set());
  }, [selectedLocation, selectedJobType, selectedTeam, selectedPublishedStatus]);

  useEffect(() => {
    loadJobs();
  }, [companyId]);

  async function loadJobs() {
    setLoading(true);
    const data = await getJobs(companyId);
    setJobs(data || []);
    setLoading(false);
  }

  async function handleCreate(data: CreateJobInput) {
    await createJob(companyId, data);
    await loadJobs();
  }

  async function handleUpdate(data: UpdateJobInput) {
    if (!editingJob) return;
    await updateJob(editingJob.id, data);
    await loadJobs();
    setEditingJob(null);
  }

  async function togglePublish(job: Job) {
    const newPublishedState = !job.published;
    
    // Optimistically update the UI
    setJobs((prevJobs) =>
      prevJobs.map((j) =>
        j.id === job.id ? { ...j, published: newPublishedState } : j
      )
    );
    
    setTogglingJobId(job.id);
    
    try {
      const result = await updateJob(job.id, { published: newPublishedState });
      
      if (result?.error) {
        // Revert on error
        setJobs((prevJobs) =>
          prevJobs.map((j) =>
            j.id === job.id ? { ...j, published: !newPublishedState } : j
          )
        );
      } else {
        // Refresh to ensure we have the latest data
        await loadJobs();
      }
    } catch (error) {
      // Revert on error
      setJobs((prevJobs) =>
        prevJobs.map((j) =>
          j.id === job.id ? { ...j, published: !newPublishedState } : j
        )
      );
    } finally {
      setTogglingJobId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this job? This cannot be undone.')) return;
    setDeletingJobId(id);
    try {
      await deleteJob(id);
      await loadJobs();
    } finally {
      setDeletingJobId(null);
    }
  }

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

  const selectAllJobs = useCallback(() => {
    const allIds = new Set(filteredJobs.map((job) => job.id));
    setSelectedJobIds(allIds);
  }, [filteredJobs]);

  const deselectAllJobs = useCallback(() => {
    setSelectedJobIds(new Set());
  }, []);

  // Bulk action handlers
  async function handleBulkPublish() {
    if (selectedJobIds.size === 0) return;
    
    setBulkActionLoading(true);
    try {
      const result = await bulkUpdateJobsPublished(Array.from(selectedJobIds), true);
      if (result?.error) {
        alert(`Error: ${result.error}`);
      } else {
        setSelectedJobIds(new Set());
        await loadJobs();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to publish jobs';
      alert(`Error: ${errorMessage}`);
    } finally {
      setBulkActionLoading(false);
    }
  }

  async function handleBulkUnpublish() {
    if (selectedJobIds.size === 0) return;
    
    setBulkActionLoading(true);
    try {
      const result = await bulkUpdateJobsPublished(Array.from(selectedJobIds), false);
      if (result?.error) {
        alert(`Error: ${result.error}`);
      } else {
        setSelectedJobIds(new Set());
        await loadJobs();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to unpublish jobs';
      alert(`Error: ${errorMessage}`);
    } finally {
      setBulkActionLoading(false);
    }
  }

  async function handleBulkDelete() {
    if (selectedJobIds.size === 0) return;
    
    if (!confirm(`Delete ${selectedJobIds.size} job(s)? This cannot be undone.`)) return;
    
    setBulkActionLoading(true);
    try {
      const result = await bulkDeleteJobs(Array.from(selectedJobIds));
      if (result?.error) {
        alert(`Error: ${result.error}`);
      } else {
        setSelectedJobIds(new Set());
        await loadJobs();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete jobs';
      alert(`Error: ${errorMessage}`);
    } finally {
      setBulkActionLoading(false);
    }
  }

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
        <div className="flex justify-center p-8">
          <Loader2 className="animate-spin text-muted-foreground" />
        </div>
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
        onImportComplete={loadJobs}
      />
    </div>
  );
}
