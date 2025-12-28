'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getApplications, updateApplicationStatus, type ApplicationWithJob } from '@/app/actions/applications';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, FileText, Linkedin, Mail, Calendar, Search, X } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { ApplicationListSkeleton } from '@/components/skeletons/application-list-skeleton';

interface ApplicationStatus {
    value: string;
    label: string;
    color: string;
    bgColor: string;
}

const APPLICATION_STATUSES: ApplicationStatus[] = [
    { value: 'new', label: 'New', color: 'text-blue-700', bgColor: 'bg-blue-100' },
    { value: 'reviewed', label: 'Reviewed', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
    { value: 'rejected', label: 'Rejected', color: 'text-red-700', bgColor: 'bg-red-100' },
    { value: 'accepted', label: 'Accepted', color: 'text-green-700', bgColor: 'bg-green-100' },
    { value: 'interviewed', label: 'Interviewed', color: 'text-purple-700', bgColor: 'bg-purple-100' },
];

export function ApplicationsList({ company }: { company: any }) {
    const [applications, setApplications] = useState<ApplicationWithJob[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedJob, setSelectedJob] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

    // Pagination state
    const itemsPerPage = 20;
    const [currentPage, setCurrentPage] = useState(1);

    // Status update state
    const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

    // Debounce search query - reduced to 200ms for better responsiveness
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 200);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchQuery, selectedJob, selectedStatus]);

    const loadApplications = useCallback(async () => {
        setLoading(true);
        
        const filters: any = {};
        
        if (selectedJob !== 'all') {
            filters.jobId = selectedJob;
        }
        
        if (selectedStatus !== 'all') {
            filters.status = selectedStatus;
        }
        
        if (debouncedSearchQuery) {
            filters.searchQuery = debouncedSearchQuery;
        }

        const data = await getApplications(company.id, filters);
        setApplications(data || []);
        setLoading(false);
    }, [company.id, selectedJob, selectedStatus, debouncedSearchQuery]);

    // Load applications on mount and when filters change
    useEffect(() => {
        loadApplications();
    }, [loadApplications]);

    async function handleStatusUpdate(applicationId: string, newStatus: string) {
        setUpdatingStatusId(applicationId);
        
        // Optimistically update the UI
        setApplications(prevApps =>
            prevApps.map(app =>
                app.id === applicationId ? { ...app, status: newStatus } : app
            )
        );

        try {
            const result = await updateApplicationStatus(applicationId, newStatus);
            
            if (result?.error) {
                // Revert on error
                await loadApplications();
            }
        } catch (error) {
            // Revert on error
            await loadApplications();
        } finally {
            setUpdatingStatusId(null);
        }
    }

    // Extract unique filter values
    const filterOptions = useMemo(() => {
        const jobs = new Map<string, string>(); // jobId -> jobTitle

        applications.forEach((app) => {
            if (app.job && !jobs.has(app.job.id)) {
                jobs.set(app.job.id, app.job.title);
            }
        });

        return {
            jobs: Array.from(jobs.entries()).map(([id, title]) => ({ id, title })),
        };
    }, [applications]);

    // Filter applications (already filtered by server, but we keep this for consistency)
    const filteredApplications = useMemo(() => {
        return applications;
    }, [applications]);

    // Calculate pagination
    const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedApplications = useMemo(() => {
        return filteredApplications.slice(startIndex, endIndex);
    }, [filteredApplications, startIndex, endIndex]);

    // Handle page change
    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
        // Scroll to top of list
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    // Check if any filters are active
    const hasActiveFilters = debouncedSearchQuery || 
        (selectedJob !== 'all') || 
        (selectedStatus !== 'all');

    // Clear all filters
    const clearFilters = useCallback(() => {
        setSearchQuery('');
        setSelectedJob('all');
        setSelectedStatus('all');
    }, []);

    // Get status info
    const getStatusInfo = (status: string): ApplicationStatus => {
        return APPLICATION_STATUSES.find(s => s.value === status) || APPLICATION_STATUSES[0];
    };

    // Get resume URL
    const getResumeUrl = (path: string) => {
        // If path itself is a full URL (legacy or external), return it
        if (path.startsWith('http')) return path;

        // Otherwise generate public URL from storage
        const supabase = createClient();
        const { data } = supabase.storage.from('resumes').getPublicUrl(path);
        return data.publicUrl;
    };

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div>
                    <h2 className="text-lg font-semibold">Applications</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        {filteredApplications.length} {filteredApplications.length === 1 ? 'application' : 'applications'}
                    </p>
                </div>
            </div>

            {loading ? (
                <ApplicationListSkeleton count={5} />
            ) : applications.length === 0 && !hasActiveFilters ? (
                <div className="text-center p-12 bg-gray-50 rounded-lg border border-dashed text-muted-foreground">
                    <p>No applications yet. Applications will appear here when candidates apply.</p>
                </div>
            ) : (
                <>
                    {/* Filter UI */}
                    <Card className="p-3 md:p-4">
                        <div className="space-y-3 md:space-y-4">
                            {/* Search Input */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 pr-9 text-sm md:text-base"
                                    aria-label="Search applications by name or email"
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                {/* Job Filter */}
                                {filterOptions.jobs.length > 0 && (
                                    <div className="space-y-2">
                                        <Label htmlFor="job-filter">Job</Label>
                                        <Select value={selectedJob} onValueChange={setSelectedJob}>
                                            <SelectTrigger id="job-filter" aria-label="Filter by job">
                                                <SelectValue placeholder="All Jobs" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Jobs</SelectItem>
                                                {filterOptions.jobs.map((job) => (
                                                    <SelectItem key={job.id} value={job.id}>
                                                        {job.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {/* Status Filter */}
                                <div className="space-y-2">
                                    <Label htmlFor="status-filter">Status</Label>
                                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                        <SelectTrigger id="status-filter" aria-label="Filter by status">
                                            <SelectValue placeholder="All Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            {APPLICATION_STATUSES.map((status) => (
                                                <SelectItem key={status.value} value={status.value}>
                                                    {status.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Clear Filters Button and Result Count */}
                            {hasActiveFilters && (
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2">
                                    <p className="text-sm text-muted-foreground">
                                        {filteredApplications.length === 0 ? (
                                            'No applications match your filters'
                                        ) : (
                                            `${filteredApplications.length} ${filteredApplications.length === 1 ? 'application' : 'applications'} found`
                                        )}
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={clearFilters}
                                        className="gap-2 w-full sm:w-auto"
                                    >
                                        <X className="h-4 w-4" />
                                        Clear filters
                                    </Button>
                                </div>
                            )}

                            {/* Result count when no filters active */}
                            {!hasActiveFilters && (
                                <p className="text-sm pt-2 text-muted-foreground">
                                    {filteredApplications.length} {filteredApplications.length === 1 ? 'application' : 'applications'} available
                                </p>
                            )}
                        </div>
                    </Card>

                    {/* Applications List */}
                    {filteredApplications.length === 0 && hasActiveFilters ? (
                        <div className="text-center py-12">
                            <p className="text-lg mb-4 text-muted-foreground">
                                No applications match your filters
                            </p>
                            <Button variant="outline" onClick={clearFilters}>
                                Clear all filters
                            </Button>
                                    </div>
                                ) : (
                        <>
                            <div className="space-y-3">
                                {paginatedApplications.map((app) => {
                                    const statusInfo = getStatusInfo(app.status);
                                    const isUpdating = updatingStatusId === app.id;

                                    return (
                                        <div
                                            key={app.id}
                                            className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 md:p-4 bg-white border rounded-lg shadow-sm hover:border-gray-300 transition-colors ${isUpdating ? 'opacity-50' : ''}`}
                                        >
                                            <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                                {isUpdating && (
                                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0 mt-1 sm:mt-0" />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                                        <h3 className="font-medium text-sm sm:text-base truncate">
                                                            {app.first_name} {app.last_name}
                                                        </h3>
                                                        <Badge
                                                            className={`text-[10px] h-5 px-1.5 shrink-0 ${statusInfo.bgColor} ${statusInfo.color} hover:${statusInfo.bgColor} border-none`}
                                                        >
                                                            {statusInfo.label}
                                                        </Badge>
                                                    </div>
                                                    <div className="space-y-1.5 sm:space-y-0">
                                                        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-foreground font-medium">
                                                            <span className="truncate">{app.job?.title}</span>
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs sm:text-sm text-muted-foreground">
                                                            <a
                                                                href={`mailto:${app.email}`}
                                                                className="flex items-center gap-1 hover:text-foreground transition-colors truncate max-w-full"
                                                                title={app.email}
                                                            >
                                                                <Mail className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                                                                <span className="truncate">{app.email}</span>
                                                            </a>
                                                            {app.linkedin_url && (
                                                                <>
                                                                    <span className="hidden sm:inline w-1 h-1 bg-gray-300 rounded-full shrink-0"></span>
                                                                    <a
                                                                        href={app.linkedin_url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center gap-1 hover:text-blue-600 transition-colors shrink-0"
                                                                    >
                                                                        <Linkedin className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                                                        <span className="hidden sm:inline">LinkedIn</span>
                                                                    </a>
                                                                </>
                                                            )}
                                                            <span className="hidden sm:inline w-1 h-1 bg-gray-300 rounded-full shrink-0"></span>
                                                            <span className="flex items-center gap-1 shrink-0">
                                                                <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                                                <span className="hidden sm:inline">{new Date(app.created_at).toLocaleDateString()}</span>
                                                                <span className="sm:hidden">{new Date(app.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-2">
                                                <Select
                                                    value={app.status}
                                                    onValueChange={(value) => handleStatusUpdate(app.id, value)}
                                                    disabled={isUpdating}
                                                >
                                                    <SelectTrigger className="flex-1 sm:w-[140px] h-8 text-xs">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {APPLICATION_STATUSES.map((status) => (
                                                            <SelectItem key={status.value} value={status.value}>
                                                                {status.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    asChild
                                                    className="flex-1 sm:flex-initial gap-2"
                                                >
                                                    <a
                                                        href={getResumeUrl(app.resume_url)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <FileText className="h-4 w-4" />
                                                        Resume
                                                    </a>
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-4 md:mt-6 flex flex-col items-center gap-3 md:gap-4">
                                    <p className="text-xs sm:text-sm text-muted-foreground text-center px-2">
                                        Showing {startIndex + 1}-{Math.min(endIndex, filteredApplications.length)} of {filteredApplications.length} {filteredApplications.length === 1 ? 'application' : 'applications'}
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
        </div>
    );
}
