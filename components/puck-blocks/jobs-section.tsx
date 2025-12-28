'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Search, MapPin, Clock } from 'lucide-react';
import { SectionWrapper } from '@/lib/section-layout/section-wrapper';
import { JobApplicationModal } from '@/components/candidate/job-application-modal';
import { Pagination } from '@/components/ui/pagination';
import { JobListSkeleton } from '@/components/skeletons/job-list-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

// Memoized filter component to reduce re-renders
const JobsFilter = React.memo(function JobsFilter({
  searchQuery,
  onSearchChange,
  selectedLocation,
  onLocationChange,
  selectedJobType,
  onJobTypeChange,
  selectedTeam,
  onTeamChange,
  filterOptions,
  hasActiveFilters,
  filteredJobsCount,
  onClearFilters,
  formatJobType,
}: {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedLocation: string;
  onLocationChange: (value: string) => void;
  selectedJobType: string;
  onJobTypeChange: (value: string) => void;
  selectedTeam: string;
  onTeamChange: (value: string) => void;
  filterOptions: { locations: string[]; jobTypes: string[]; teams: string[] };
  hasActiveFilters: boolean;
  filteredJobsCount: number;
  onClearFilters: () => void;
  formatJobType: (jobType: string) => string;
}) {
  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black opacity-50" />
          <Input
            type="text"
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-9"
            aria-label="Search jobs by title or description"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
              aria-label="Clear search"
            >
              <X className="h-4 w-4 text-black opacity-50" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filterOptions.locations.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="location-filter" className="text-black">Location</Label>
              <Select value={selectedLocation} onValueChange={onLocationChange}>
                <SelectTrigger id="location-filter" aria-label="Filter by location">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {filterOptions.locations.map((location) => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {filterOptions.jobTypes.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="job-type-filter" className="text-black">Job Type</Label>
              <Select value={selectedJobType} onValueChange={onJobTypeChange}>
                <SelectTrigger id="job-type-filter" aria-label="Filter by job type">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {filterOptions.jobTypes.map((jobType) => (
                    <SelectItem key={jobType} value={jobType}>{formatJobType(jobType)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {filterOptions.teams.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="team-filter" className="text-black">Department/Team</Label>
              <Select value={selectedTeam} onValueChange={onTeamChange}>
                <SelectTrigger id="team-filter" aria-label="Filter by team">
                  <SelectValue placeholder="All Teams" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  {filterOptions.teams.map((team) => (
                    <SelectItem key={team} value={team}>{team}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters ? (
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-black">
              {filteredJobsCount === 0
                ? 'No jobs match your filters'
                : `${filteredJobsCount} ${filteredJobsCount === 1 ? 'job' : 'jobs'} found`}
            </p>
            <Button variant="outline" size="sm" onClick={onClearFilters} className="gap-2">
              <X className="h-4 w-4" />
              Clear filters
            </Button>
          </div>
        ) : (
          <p className="text-sm pt-2 text-black">
            {filteredJobsCount} {filteredJobsCount === 1 ? 'job' : 'jobs'} available
          </p>
        )}
      </div>
    </Card>
  );
});

export interface JobsSectionProps {
  heading: string;
  layout: 'list' | 'cards' | 'team' | 'location';
  emptyStateMessage: string;
  density?: 'comfortable' | 'compact';
  background?: 'plain' | 'card';
  buttonVariant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive';
  badgeVariant?: 'default' | 'secondary' | 'outline' | 'destructive';
  align?: 'left' | 'center';
  // jobs will be injected at render time via PuckRenderer context/props
  jobs?: any;
  loading?: boolean;
  serverSidePagination?: {
    currentPage: number;
    totalPages: number;
    totalJobs: number;
  };
}

export function JobsSection({
  heading,
  layout,
  emptyStateMessage,
  jobs,
  density = 'comfortable',
  background = 'plain',
  buttonVariant = 'ghost',
  badgeVariant = 'secondary',
  align = 'center',
  loading = false,
  serverSidePagination,
}: JobsSectionProps) {
  const alignmentClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center',
  };

  const textAlignmentClasses = {
    left: 'text-left',
    center: 'text-center mx-auto',
  };
  const jobsArray: any[] = Array.isArray(jobs) ? jobs : [];
  const router = useRouter();
  const searchParams = useSearchParams();
  const isUpdatingUrlRef = useRef(false);

  // Initialize filter state from URL params or defaults
  // Use 'all' instead of empty string for Select components
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '');
  const [selectedLocation, setSelectedLocation] = useState(() => {
    const location = searchParams.get('location');
    return location || 'all';
  });
  const [selectedJobType, setSelectedJobType] = useState(() => {
    const type = searchParams.get('type');
    return type || 'all';
  });
  const [selectedTeam, setSelectedTeam] = useState(() => {
    const team = searchParams.get('team');
    return team || 'all';
  });
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  
  // Pagination state - use server-side if provided, otherwise client-side
  const itemsPerPage = 20;
  const isServerSidePagination = !!serverSidePagination;
  const [currentPage, setCurrentPage] = useState(() => {
    if (isServerSidePagination) {
      return serverSidePagination!.currentPage;
    }
    const page = searchParams.get('page');
    return page ? parseInt(page, 10) : 1;
  });

  // Debounce search query - reduced to 200ms for better responsiveness
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Extract unique filter values - optimized calculation
  const filterOptions = useMemo(() => {
    const locations = new Set<string>();
    const jobTypes = new Set<string>();
    const teams = new Set<string>();

    for (const job of jobsArray) {
      if (job.location) locations.add(job.location);
      if (job.job_type) jobTypes.add(job.job_type);
      if (job.team) teams.add(job.team);
    }

    return {
      locations: Array.from(locations).sort(),
      jobTypes: Array.from(jobTypes).sort(),
      teams: Array.from(teams).sort(),
    };
  }, [jobsArray]);

  // Pre-compile search term once
  const searchLower = useMemo(() => 
    debouncedSearchQuery ? debouncedSearchQuery.toLowerCase() : null,
    [debouncedSearchQuery]
  );

  // Filter jobs based on all active filters - optimized single-pass with early exits
  const filteredJobs = useMemo(() => {
    if (!searchLower && selectedLocation === 'all' && selectedJobType === 'all' && selectedTeam === 'all') {
      return jobsArray; // No filters active, return all jobs
    }

    const filtered: typeof jobsArray = [];
    
    for (const job of jobsArray) {
      // Early exit: Text search (most expensive, check first if active)
      if (searchLower) {
        const titleLower = job.title?.toLowerCase();
        const descLower = job.description?.toLowerCase();
        if (!titleLower?.includes(searchLower) && !descLower?.includes(searchLower)) {
          continue; // Skip this job
        }
      }

      // Early exit: Location filter
      if (selectedLocation !== 'all' && job.location !== selectedLocation) {
        continue;
      }

      // Early exit: Job type filter
      if (selectedJobType !== 'all' && job.job_type !== selectedJobType) {
        continue;
      }

      // Early exit: Team filter
      if (selectedTeam !== 'all' && job.team !== selectedTeam) {
        continue;
      }

      // All filters passed
      filtered.push(job);
    }

    return filtered;
  }, [jobsArray, searchLower, selectedLocation, selectedJobType, selectedTeam]);

  // Reset to page 1 when filters change (only for client-side pagination)
  useEffect(() => {
    if (!isServerSidePagination) {
      setCurrentPage(1);
    }
  }, [debouncedSearchQuery, selectedLocation, selectedJobType, selectedTeam, isServerSidePagination]);

  // Calculate pagination
  // For server-side pagination, use provided values; otherwise calculate from filtered jobs
  const totalItems = useMemo(() => {
    if (isServerSidePagination) {
      return serverSidePagination!.totalJobs;
    }
    if (layout === 'team' || layout === 'location') {
      const grouped = layout === 'team' 
        ? groupBy(filteredJobs, (job) => job.team || 'Other')
        : groupBy(filteredJobs, (job) => job.location || 'Other');
      return Object.keys(grouped).length;
    }
    return filteredJobs.length;
  }, [filteredJobs, layout, isServerSidePagination, serverSidePagination]);

  const totalPages = isServerSidePagination 
    ? serverSidePagination!.totalPages 
    : Math.ceil(totalItems / itemsPerPage);
  
  // For server-side pagination, jobs are already paginated, so just filter them
  // For client-side pagination, slice the filtered jobs
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedJobs = useMemo(() => {
    if (isServerSidePagination) {
      // Server-side: jobs are already paginated, just apply client-side filters
      return filteredJobs;
    }
    // Client-side: slice the filtered jobs
    return filteredJobs.slice(startIndex, endIndex);
  }, [filteredJobs, startIndex, endIndex, isServerSidePagination]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    if (isServerSidePagination) {
      // Server-side: navigate to new page via URL
      const newParams = new URLSearchParams(searchParams.toString());
      if (page > 1) {
        newParams.set('page', page.toString());
      } else {
        newParams.delete('page');
      }
      const queryString = newParams.toString();
      router.push(queryString ? `?${queryString}` : window.location.pathname);
      // Scroll to top of jobs section
      const jobsSection = document.getElementById('jobs');
      if (jobsSection) {
        jobsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      // Client-side: just update state
      setCurrentPage(page);
      // Scroll to top of jobs section
      const jobsSection = document.getElementById('jobs');
      if (jobsSection) {
        jobsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [isServerSidePagination, router, searchParams]);

  // Update URL when filters change - simplified and optimized
  useEffect(() => {
    if (isUpdatingUrlRef.current) return;

    // Build new params
    const newParams = new URLSearchParams();
    if (debouncedSearchQuery) newParams.set('search', debouncedSearchQuery);
    if (selectedLocation !== 'all') newParams.set('location', selectedLocation);
    if (selectedJobType !== 'all') newParams.set('type', selectedJobType);
    if (selectedTeam !== 'all') newParams.set('team', selectedTeam);
    // Only update page param for client-side pagination
    if (!isServerSidePagination && currentPage > 1) {
      newParams.set('page', currentPage.toString());
    } else if (isServerSidePagination && serverSidePagination!.currentPage > 1) {
      newParams.set('page', serverSidePagination!.currentPage.toString());
    }

    // Compare with current URL params from searchParams hook
    const currentSearch = searchParams.get('search') || '';
    const currentLocation = searchParams.get('location') || '';
    const currentType = searchParams.get('type') || '';
    const currentTeam = searchParams.get('team') || '';
    const currentPageParam = searchParams.get('page') || '1';

    const newSearch = debouncedSearchQuery || '';
    const newLocation = selectedLocation !== 'all' ? selectedLocation : '';
    const newType = selectedJobType !== 'all' ? selectedJobType : '';
    const newTeam = selectedTeam !== 'all' ? selectedTeam : '';
    const newPage = currentPage > 1 ? currentPage.toString() : '1';

    // Only update if params actually changed
    if (
      currentSearch !== newSearch ||
      currentLocation !== newLocation ||
      currentType !== newType ||
      currentTeam !== newTeam ||
      currentPageParam !== newPage
    ) {
      isUpdatingUrlRef.current = true;
      const queryString = newParams.toString();
      router.replace(queryString ? `?${queryString}` : window.location.pathname, { scroll: false });

      // Reset flag after URL update completes
      setTimeout(() => {
        isUpdatingUrlRef.current = false;
      }, 50);
    }
  }, [debouncedSearchQuery, selectedLocation, selectedJobType, selectedTeam, currentPage, router, searchParams, isServerSidePagination, serverSidePagination]);

  // Check if any filters are active
  const hasActiveFilters = Boolean(debouncedSearchQuery) || (selectedLocation !== 'all') || (selectedJobType !== 'all') || (selectedTeam !== 'all');

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedLocation('all');
    setSelectedJobType('all');
    setSelectedTeam('all');
  }, []);

  // Format job type for display
  const formatJobType = (jobType: string) => {
    return jobType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Show skeleton when loading
  if (loading) {
    const maxWidth = layout === 'cards' ? 'full' : '3xl';
    const skeletonContent = (
      <div className="space-y-6">
        <div className={`flex flex-col space-y-4 mb-16 ${alignmentClasses[align]}`}>
          <div className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
            Open Positions
          </div>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-balance text-black">
            {heading}
          </h2>
        </div>
        {layout === 'cards' ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="h-full">
                <CardHeader>
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <Skeleton className="h-9 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <JobListSkeleton count={5} />
        )}
      </div>
    );

    if (background === 'card') {
      return (
        <SectionWrapper contentMaxWidth={maxWidth} verticalPadding="lg">
          <section id="jobs" className="scroll-mt-20">
            <Card>
              <CardContent className="pt-6">
                {skeletonContent}
              </CardContent>
            </Card>
          </section>
        </SectionWrapper>
      );
    }

    return (
      <SectionWrapper contentMaxWidth={maxWidth} verticalPadding="lg">
        <section id="jobs" className="scroll-mt-20">
          {skeletonContent}
        </section>
      </SectionWrapper>
    );
  }

  const sectionContent = (
    <>
      {(!jobsArray || jobsArray.length === 0) ? (
        <div className={`flex flex-col space-y-4 mb-16 ${alignmentClasses[align]}`}>
          <div className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
            Open Positions
          </div>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-balance text-black">
            {heading}
          </h2>
          <p className={`text-lg max-w-2xl leading-relaxed text-muted-foreground ${textAlignmentClasses[align]}`}>
            {emptyStateMessage}
          </p>
        </div>
      ) : (
        <>
          <div className={`flex flex-col space-y-4 mb-16 ${alignmentClasses[align]}`}>
            <div className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
              Open Positions
            </div>
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-balance text-black">
              {heading}
            </h2>
          </div>

          {/* Filter UI */}
          {jobsArray.length > 0 && (
            <div className="mb-6">
              <JobsFilter
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedLocation={selectedLocation}
                onLocationChange={setSelectedLocation}
                selectedJobType={selectedJobType}
                onJobTypeChange={setSelectedJobType}
                selectedTeam={selectedTeam}
                onTeamChange={setSelectedTeam}
                filterOptions={filterOptions}
                hasActiveFilters={hasActiveFilters}
                filteredJobsCount={filteredJobs.length}
                onClearFilters={clearFilters}
                formatJobType={formatJobType}
              />
            </div>
          )}

          {/* Job Listings */}
          {filteredJobs.length === 0 && hasActiveFilters ? (
            <div className="text-center py-12">
              <p className="text-lg mb-4 text-black">No jobs match your filters</p>
              <Button variant="outline" onClick={clearFilters}>Clear all filters</Button>
            </div>
          ) : (
            <>
              {layout === 'team' && (() => {
                const grouped = groupBy(filteredJobs, (job) => job.team || 'Other');
                const groups = Object.entries(grouped);
                const paginatedGroups = groups.slice(startIndex, endIndex);
                return paginatedGroups.map(([team, teamJobs]) => (
                  <div key={team} className="space-y-4 mb-8">
                    <h3 className="text-xl font-semibold text-black">{team}</h3>
                    <JobList jobs={teamJobs} density={density} buttonVariant={buttonVariant} badgeVariant={badgeVariant} />
                  </div>
                ));
              })()}
              {layout === 'location' && (() => {
                const grouped = groupBy(filteredJobs, (job) => job.location || 'Other');
                const groups = Object.entries(grouped);
                const paginatedGroups = groups.slice(startIndex, endIndex);
                return paginatedGroups.map(([location, locationJobs]) => (
                  <div key={location} className="space-y-4 mb-8">
                    <h3 className="text-xl font-semibold text-black">{location}</h3>
                    <JobList jobs={locationJobs} density={density} buttonVariant={buttonVariant} badgeVariant={badgeVariant} />
                  </div>
                ));
              })()}
              {layout === 'cards' && (
                <JobCards jobs={paginatedJobs} density={density} buttonVariant={buttonVariant} badgeVariant={badgeVariant} />
              )}
              {layout === 'list' && (
                <JobList jobs={paginatedJobs} density={density} buttonVariant={buttonVariant} badgeVariant={badgeVariant} />
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex flex-col items-center gap-4">
                  <p className="text-sm text-muted-foreground">
                    {isServerSidePagination ? (
                      <>Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} {totalItems === 1 ? 'job' : 'jobs'}</>
                    ) : layout === 'team' || layout === 'location' ? (
                      <>Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} {totalItems === 1 ? 'group' : 'groups'}</>
                    ) : (
                      <>Showing {startIndex + 1}-{Math.min(endIndex, filteredJobs.length)} of {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'}</>
                    )}
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
    </>
  );

  const maxWidth = layout === 'cards' ? 'full' : '3xl';

  if (background === 'card') {
    return (
      <SectionWrapper contentMaxWidth={maxWidth} verticalPadding="lg">
        <section id="jobs" className="scroll-mt-20">
          <Card>
            <CardContent className="pt-6">
              {sectionContent}
            </CardContent>
          </Card>
        </section>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper contentMaxWidth={maxWidth} verticalPadding="lg">
      <section id="jobs" className="scroll-mt-20">
        {sectionContent}
      </section>
    </SectionWrapper>
  );
}

// Pre-compute job type formatting for performance
const formatJobTypeDisplay = (jobType: string): string => {
  return jobType.replace('-', ' ');
};

const JobList = React.memo(function JobList({
  jobs,
  density = 'comfortable',
  buttonVariant = 'ghost',
  badgeVariant = 'secondary',
}: {
  jobs: any[];
  density?: 'comfortable' | 'compact';
  buttonVariant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive';
  badgeVariant?: 'default' | 'secondary' | 'outline' | 'destructive';
}) {
  const densityClass = density === 'compact' ? 'p-3' : 'p-4';
  
  return (
    <div className="space-y-3">
      {jobs.map((job) => (
        <Card key={job.id} className={`${densityClass} hover:border-primary transition-colors`}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-base font-medium mb-2 text-black">{job.title}</CardTitle>
              <div className="flex gap-3 flex-wrap items-center text-sm text-black">
                {job.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {job.location}
                  </span>
                )}
                {job.job_type && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatJobTypeDisplay(job.job_type)}
                  </span>
                )}
              </div>
            </div>
            <JobApplicationModal job={job} trigger={
              <Button variant={buttonVariant} size="sm">Apply Now</Button>
            } />
          </div>
        </Card>
      ))}
    </div>
  );
});

const JobCards = React.memo(function JobCards({
  jobs,
  density = 'comfortable',
  buttonVariant = 'ghost',
  badgeVariant = 'secondary',
}: {
  jobs: any[];
  density?: 'comfortable' | 'compact';
  buttonVariant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive';
  badgeVariant?: 'default' | 'secondary' | 'outline' | 'destructive';
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {jobs.map((job) => (
        <Card key={job.id} className="hover:border-primary transition-colors h-full flex flex-col">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <CardTitle className="text-xl text-black">{job.title}</CardTitle>
                <div className="flex flex-wrap items-center gap-3 text-sm text-black">
                  {job.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {job.location}
                    </span>
                  )}
                  {job.job_type && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatJobTypeDisplay(job.job_type)}
                    </span>
                  )}
                </div>
              </div>
              {job.team && <Badge variant={badgeVariant}>{job.team}</Badge>}
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            {job.description && (
              <p className="text-sm mb-4 leading-relaxed text-black line-clamp-3">{job.description}</p>
            )}
            <JobApplicationModal job={job} trigger={
              <Button variant={buttonVariant} className="w-full mt-auto">Apply Now</Button>
            } />
          </CardContent>
        </Card>
      ))}
    </div>
  );
});

// Memoized groupBy function for better performance
const groupBy = <T, K extends string | number>(items: T[], getKey: (item: T) => K): Record<K, T[]> => {
  return items.reduce((acc, item) => {
    const key = getKey(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<K, T[]>);
};
