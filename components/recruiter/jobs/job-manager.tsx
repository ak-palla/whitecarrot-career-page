'use client';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { getJobs, createJob, updateJob, deleteJob, bulkUpdateJobsPublished, bulkDeleteJobs } from '@/app/actions/jobs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Plus, MoreHorizontal, Pencil, Trash2, Upload, Search, X } from 'lucide-react';
import { JobFormDialog } from './job-form-dialog';
import { CSVImportDialog } from './csv-import-dialog';
import { Pagination } from '@/components/ui/pagination';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


export function JobManager({ companyId }: { companyId: string }) {
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [csvImportOpen, setCsvImportOpen] = useState(false);
    const [editingJob, setEditingJob] = useState<any>(null);
    const [togglingJobId, setTogglingJobId] = useState<string | null>(null);
    const [deletingJobId, setDeletingJobId] = useState<string | null>(null);
    const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(new Set());
    const [bulkActionLoading, setBulkActionLoading] = useState(false);
    const selectAllCheckboxRef = useRef<HTMLButtonElement>(null);

    // Filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('all');
    const [selectedJobType, setSelectedJobType] = useState('all');
    const [selectedTeam, setSelectedTeam] = useState('all');
    const [selectedPublishedStatus, setSelectedPublishedStatus] = useState('all');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

    // Pagination state
    const itemsPerPage = 20;
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        loadJobs();
    }, [companyId]);

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchQuery, selectedLocation, selectedJobType, selectedTeam, selectedPublishedStatus]);

    // Clear selection when filters change
    useEffect(() => {
        setSelectedJobIds(new Set());
    }, [debouncedSearchQuery, selectedLocation, selectedJobType, selectedTeam, selectedPublishedStatus]);

    async function loadJobs() {
        setLoading(true);
        const data = await getJobs(companyId);
        setJobs(data || []);
        setLoading(false);
    }

    async function handleCreate(data: any) {
        await createJob(companyId, data);
        await loadJobs();
    }

    async function handleUpdate(data: any) {
        if (!editingJob) return;
        await updateJob(editingJob.id, data);
        await loadJobs();
        setEditingJob(null);
    }

    async function togglePublish(job: any) {
        const newPublishedState = !job.published;
        
        // Optimistically update the UI
        setJobs(prevJobs => 
            prevJobs.map(j => 
                j.id === job.id ? { ...j, published: newPublishedState } : j
            )
        );
        
        setTogglingJobId(job.id);
        
        try {
            const result = await updateJob(job.id, { published: newPublishedState });
            
            if (result?.error) {
                // Revert on error
                setJobs(prevJobs => 
                    prevJobs.map(j => 
                        j.id === job.id ? { ...j, published: !newPublishedState } : j
                    )
                );
            } else {
                // Refresh to ensure we have the latest data
                await loadJobs();
            }
        } catch (error) {
            // Revert on error
            setJobs(prevJobs => 
                prevJobs.map(j => 
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

    // Extract unique filter values
    const filterOptions = useMemo(() => {
        const locations = new Set<string>();
        const jobTypes = new Set<string>();
        const teams = new Set<string>();

        jobs.forEach((job) => {
            if (job.location) locations.add(job.location);
            if (job.job_type) jobTypes.add(job.job_type);
            if (job.team) teams.add(job.team);
        });

        return {
            locations: Array.from(locations).sort(),
            jobTypes: Array.from(jobTypes).sort(),
            teams: Array.from(teams).sort(),
        };
    }, [jobs]);

    // Filter jobs based on all active filters
    const filteredJobs = useMemo(() => {
        return jobs.filter((job) => {
            // Text search (title and description)
            if (debouncedSearchQuery) {
                const searchLower = debouncedSearchQuery.toLowerCase();
                const matchesTitle = job.title?.toLowerCase().includes(searchLower);
                const matchesDescription = job.description?.toLowerCase().includes(searchLower);
                if (!matchesTitle && !matchesDescription) return false;
            }

            // Location filter (skip if 'all')
            if (selectedLocation && selectedLocation !== 'all' && job.location !== selectedLocation) return false;

            // Job type filter (skip if 'all')
            if (selectedJobType && selectedJobType !== 'all' && job.job_type !== selectedJobType) return false;

            // Team filter (skip if 'all')
            if (selectedTeam && selectedTeam !== 'all' && job.team !== selectedTeam) return false;

            // Published status filter
            if (selectedPublishedStatus !== 'all') {
                const isPublished = job.published === true;
                if (selectedPublishedStatus === 'published' && !isPublished) return false;
                if (selectedPublishedStatus === 'draft' && isPublished) return false;
            }

            return true;
        });
    }, [jobs, debouncedSearchQuery, selectedLocation, selectedJobType, selectedTeam, selectedPublishedStatus]);

    // Calculate pagination
    const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedJobs = useMemo(() => {
        return filteredJobs.slice(startIndex, endIndex);
    }, [filteredJobs, startIndex, endIndex]);

    // Handle page change
    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
        // Scroll to top of job list
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    // Check if any filters are active
    const hasActiveFilters = debouncedSearchQuery || 
        (selectedLocation !== 'all') || 
        (selectedJobType !== 'all') || 
        (selectedTeam !== 'all') || 
        (selectedPublishedStatus !== 'all');

    // Clear all filters
    const clearFilters = useCallback(() => {
        setSearchQuery('');
        setSelectedLocation('all');
        setSelectedJobType('all');
        setSelectedTeam('all');
        setSelectedPublishedStatus('all');
    }, []);

    // Format job type for display
    const formatJobType = (jobType: string) => {
        return jobType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    // Selection helper functions
    const toggleJobSelection = useCallback((jobId: string) => {
        setSelectedJobIds(prev => {
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
        const allIds = new Set(paginatedJobs.map(job => job.id));
        setSelectedJobIds(allIds);
    }, [paginatedJobs]);

    const deselectAllJobs = useCallback(() => {
        setSelectedJobIds(new Set());
    }, []);

    const isJobSelected = useCallback((jobId: string) => {
        return selectedJobIds.has(jobId);
    }, [selectedJobIds]);

    const isAllSelected = useMemo(() => {
        if (paginatedJobs.length === 0) return false;
        return paginatedJobs.every(job => selectedJobIds.has(job.id));
    }, [paginatedJobs, selectedJobIds]);

    const isSomeSelected = useMemo(() => {
        const selectedCount = paginatedJobs.filter(job => selectedJobIds.has(job.id)).length;
        return selectedCount > 0 && selectedCount < paginatedJobs.length;
    }, [paginatedJobs, selectedJobIds]);

    // Handle indeterminate state for select all checkbox
    useEffect(() => {
        if (selectAllCheckboxRef.current) {
            // Radix Checkbox uses a button element, we need to set data-state
            const button = selectAllCheckboxRef.current;
            if (isSomeSelected) {
                button.setAttribute('data-state', 'indeterminate');
                // Also set aria-checked to mixed
                button.setAttribute('aria-checked', 'mixed');
            } else {
                button.removeAttribute('data-state');
                button.removeAttribute('aria-checked');
            }
        }
    }, [isSomeSelected, isAllSelected]);

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
        } catch (error: any) {
            alert(`Error: ${error.message || 'Failed to publish jobs'}`);
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
        } catch (error: any) {
            alert(`Error: ${error.message || 'Failed to unpublish jobs'}`);
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
        } catch (error: any) {
            alert(`Error: ${error.message || 'Failed to delete jobs'}`);
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
                        onClick={() => { setEditingJob(null); setDialogOpen(true); }}
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
                    {/* Filter UI */}
                    <Card className="p-4">
                        <div className="space-y-4">
                            {/* Select All Checkbox */}
                            {paginatedJobs.length > 0 && (
                                <div className="flex items-center space-x-2 pb-2 border-b">
                                    <Checkbox
                                        ref={selectAllCheckboxRef}
                                        checked={isAllSelected}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                selectAllJobs();
                                            } else {
                                                deselectAllJobs();
                                            }
                                        }}
                                    />
                                    <Label className="text-sm font-medium cursor-pointer" onClick={() => {
                                        if (isAllSelected) {
                                            deselectAllJobs();
                                        } else {
                                            selectAllJobs();
                                        }
                                    }}>
                                        Select All
                                    </Label>
                                </div>
                            )}

                            {/* Search Input */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search jobs..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 pr-9"
                                    aria-label="Search jobs by title or description"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                        aria-label="Clear search"
                                    >
                                        <X className="h-4 w-4 text-muted-foreground" />
                                    </button>
                                )}
                            </div>

                            {/* Filter Dropdowns */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {/* Location Filter */}
                                {filterOptions.locations.length > 0 && (
                                    <div className="space-y-2">
                                        <Label htmlFor="location-filter">Location</Label>
                                        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                                            <SelectTrigger id="location-filter" aria-label="Filter by location">
                                                <SelectValue placeholder="All Locations" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Locations</SelectItem>
                                                {filterOptions.locations.map((location) => (
                                                    <SelectItem key={location} value={location}>
                                                        {location}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {/* Job Type Filter */}
                                {filterOptions.jobTypes.length > 0 && (
                                    <div className="space-y-2">
                                        <Label htmlFor="job-type-filter">Job Type</Label>
                                        <Select value={selectedJobType} onValueChange={setSelectedJobType}>
                                            <SelectTrigger id="job-type-filter" aria-label="Filter by job type">
                                                <SelectValue placeholder="All Types" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Types</SelectItem>
                                                {filterOptions.jobTypes.map((jobType) => (
                                                    <SelectItem key={jobType} value={jobType}>
                                                        {formatJobType(jobType)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {/* Team Filter */}
                                {filterOptions.teams.length > 0 && (
                                    <div className="space-y-2">
                                        <Label htmlFor="team-filter">Department/Team</Label>
                                        <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                                            <SelectTrigger id="team-filter" aria-label="Filter by team">
                                                <SelectValue placeholder="All Teams" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Teams</SelectItem>
                                                {filterOptions.teams.map((team) => (
                                                    <SelectItem key={team} value={team}>
                                                        {team}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {/* Published Status Filter */}
                                <div className="space-y-2">
                                    <Label htmlFor="status-filter">Status</Label>
                                    <Select value={selectedPublishedStatus} onValueChange={setSelectedPublishedStatus}>
                                        <SelectTrigger id="status-filter" aria-label="Filter by status">
                                            <SelectValue placeholder="All Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="published">Published</SelectItem>
                                            <SelectItem value="draft">Draft</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Clear Filters Button and Result Count */}
                            {hasActiveFilters && (
                                <div className="flex items-center justify-between pt-2">
                                    <p className="text-sm text-muted-foreground">
                                        {filteredJobs.length === 0 ? (
                                            'No jobs match your filters'
                                        ) : (
                                            `${filteredJobs.length} ${filteredJobs.length === 1 ? 'job' : 'jobs'} found`
                                        )}
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={clearFilters}
                                        className="gap-2"
                                    >
                                        <X className="h-4 w-4" />
                                        Clear filters
                                    </Button>
                                </div>
                            )}

                            {/* Result count when no filters active */}
                            {!hasActiveFilters && (
                                <p className="text-sm pt-2 text-muted-foreground">
                                    {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} available
                                </p>
                            )}
                        </div>
                    </Card>

                    {/* Bulk Action Toolbar */}
                    {selectedJobIds.size > 0 && (
                        <Card className="p-4 bg-blue-50 border-blue-200">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">
                                    {selectedJobIds.size} {selectedJobIds.size === 1 ? 'job' : 'jobs'} selected
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleBulkPublish}
                                        disabled={bulkActionLoading}
                                    >
                                        {bulkActionLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Publishing...
                                            </>
                                        ) : (
                                            'Publish Selected'
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleBulkUnpublish}
                                        disabled={bulkActionLoading}
                                    >
                                        {bulkActionLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Unpublishing...
                                            </>
                                        ) : (
                                            'Unpublish Selected'
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleBulkDelete}
                                        disabled={bulkActionLoading}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        {bulkActionLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Deleting...
                                            </>
                                        ) : (
                                            <>
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete Selected
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={deselectAllJobs}
                                        disabled={bulkActionLoading}
                                    >
                                        Clear Selection
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Job Listings */}
                    {filteredJobs.length === 0 && hasActiveFilters ? (
                        <div className="text-center py-12">
                            <p className="text-lg mb-4 text-muted-foreground">
                                No jobs match your filters
                            </p>
                            <Button variant="outline" onClick={clearFilters}>
                                Clear all filters
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-3">
                                {paginatedJobs.map(job => (
                                    <div key={job.id} className={`flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm hover:border-gray-300 transition-colors ${deletingJobId === job.id ? 'opacity-50' : ''} ${isJobSelected(job.id) ? 'bg-blue-50 border-blue-500' : ''}`}>
                            <div className="flex items-center gap-3">
                                <Checkbox
                                    checked={isJobSelected(job.id)}
                                    onCheckedChange={() => toggleJobSelection(job.id)}
                                    disabled={bulkActionLoading || deletingJobId === job.id}
                                />
                                {deletingJobId === job.id && (
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                )}
                                <div>
                                    <h3 className="font-medium text-base">{job.title}</h3>
                                    <div className="flex gap-2 text-sm text-gray-500 mt-1 items-center flex-wrap">
                                        {job.location && <span>{job.location}</span>}
                                        {job.location && job.job_type && <span className="w-1 h-1 bg-gray-300 rounded-full"></span>}
                                        {job.job_type && <span className="capitalize">{job.job_type.replace('-', ' ')}</span>}
                                        {job.team && (
                                            <>
                                                {(job.location || job.job_type) && <span className="w-1 h-1 bg-gray-300 rounded-full"></span>}
                                                <span>{job.team}</span>
                                            </>
                                        )}
                                        {job.work_policy && (
                                            <>
                                                {(job.location || job.job_type || job.team) && <span className="w-1 h-1 bg-gray-300 rounded-full"></span>}
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
                                        onCheckedChange={() => togglePublish(job)}
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
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => { setEditingJob(job); setDialogOpen(true); }}>
                                            <Pencil className="mr-2 h-4 w-4" /> Edit Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                            className="text-red-600 focus:text-red-600" 
                                            onClick={() => handleDelete(job.id)}
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
                                        Showing {startIndex + 1}-{Math.min(endIndex, filteredJobs.length)} of {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'}
                                    </p>
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={handlePageChange}
                                    />
                                </div>
                            )}
                        </>
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
    )
}
