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
import { SECTION_TYPOGRAPHY } from '@/lib/section-layout/constants';

export interface JobsSectionProps {
  heading: string;
  layout: 'list' | 'cards' | 'team' | 'location';
  emptyStateMessage: string;
  density?: 'comfortable' | 'compact';
  background?: 'plain' | 'card';
  buttonVariant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive';
  badgeVariant?: 'default' | 'secondary' | 'outline' | 'destructive';
  // jobs will be injected at render time via PuckRenderer context/props
  jobs?: any;
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
}: JobsSectionProps) {
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

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Extract unique filter values
  const filterOptions = useMemo(() => {
    const locations = new Set<string>();
    const jobTypes = new Set<string>();
    const teams = new Set<string>();

    jobsArray.forEach((job) => {
      if (job.location) locations.add(job.location);
      if (job.job_type) jobTypes.add(job.job_type);
      if (job.team) teams.add(job.team);
    });

    return {
      locations: Array.from(locations).sort(),
      jobTypes: Array.from(jobTypes).sort(),
      teams: Array.from(teams).sort(),
    };
  }, [jobsArray]);

  // Filter jobs based on all active filters
  const filteredJobs = useMemo(() => {
    return jobsArray.filter((job) => {
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

      return true;
    });
  }, [jobsArray, debouncedSearchQuery, selectedLocation, selectedJobType, selectedTeam]);

  // Update URL when filters change (only if different from current URL)
  useEffect(() => {
    // Prevent infinite loop by checking if we're already updating
    if (isUpdatingUrlRef.current) return;

    // Build new params
    const newParams = new URLSearchParams();
    if (debouncedSearchQuery) newParams.set('search', debouncedSearchQuery);
    if (selectedLocation && selectedLocation !== 'all') newParams.set('location', selectedLocation);
    if (selectedJobType && selectedJobType !== 'all') newParams.set('type', selectedJobType);
    if (selectedTeam && selectedTeam !== 'all') newParams.set('team', selectedTeam);

    // Compare with current URL params using window.location to avoid re-render loops
    const currentParams = new URLSearchParams(window.location.search);
    const currentSearch = currentParams.get('search') || '';
    const currentLocation = currentParams.get('location') || '';
    const currentType = currentParams.get('type') || '';
    const currentTeam = currentParams.get('team') || '';

    const newSearch = newParams.get('search') || '';
    const newLocation = newParams.get('location') || '';
    const newType = newParams.get('type') || '';
    const newTeam = newParams.get('team') || '';

    // Only update if params actually changed
    if (
      currentSearch !== newSearch ||
      currentLocation !== newLocation ||
      currentType !== newType ||
      currentTeam !== newTeam
    ) {
      isUpdatingUrlRef.current = true;
      const queryString = newParams.toString();
      const newUrl = queryString ? `?${queryString}` : window.location.pathname;
      router.replace(newUrl, { scroll: false });

      // Reset flag after a short delay to allow URL to update
      setTimeout(() => {
        isUpdatingUrlRef.current = false;
      }, 100);
    }
  }, [debouncedSearchQuery, selectedLocation, selectedJobType, selectedTeam, router]);

  // Check if any filters are active
  const hasActiveFilters = debouncedSearchQuery || (selectedLocation !== 'all') || (selectedJobType !== 'all') || (selectedTeam !== 'all');

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

  const sectionContent = (
    <>
      {(!jobsArray || jobsArray.length === 0) ? (
        <div className="text-center mb-6">
          <h2 className={`${SECTION_TYPOGRAPHY.heading.base} mb-2 text-black`}>
            {heading}
          </h2>
          <p className="text-black">{emptyStateMessage}</p>
        </div>
      ) : (
        <>
          <div className="mb-6 text-center">
            <h2 className={`${SECTION_TYPOGRAPHY.heading.base} mb-2 text-black`}>
              {heading}
            </h2>
          </div>

          {/* Filter UI */}
          {jobsArray.length > 0 && (
            <div className="mb-6">
              <Card className="p-4">
                <div className="space-y-4">
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black opacity-50" />
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
                        <X className="h-4 w-4 text-black opacity-50" />
                      </button>
                    )}
                  </div>

                  {/* Filter Dropdowns */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Location Filter */}
                    {filterOptions.locations.length > 0 && (
                      <div className="space-y-2">
                        <Label htmlFor="location-filter" className="text-black">
                          Location
                        </Label>
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
                        <Label htmlFor="job-type-filter" className="text-black">
                          Job Type
                        </Label>
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
                        <Label htmlFor="team-filter" className="text-black">
                          Department/Team
                        </Label>
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
                  </div>

                  {/* Clear Filters Button */}
                  {hasActiveFilters && (
                    <div className="flex items-center justify-between pt-2">
                      <p className="text-sm text-black">
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
                    <p className="text-sm pt-2 text-black">
                      {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} available
                    </p>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* Job Listings */}
          {filteredJobs.length === 0 && hasActiveFilters ? (
            <div className="text-center py-12">
              <p className="text-lg mb-4 text-black">
                No jobs match your filters
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear all filters
              </Button>
            </div>
          ) : (
            <>
              {layout === 'team' && (
                <>
                  {Object.entries(groupBy(filteredJobs, (job) => job.team || 'Other')).map(([team, teamJobs]) => (
                    <div key={team} className="space-y-4 mb-8">
                      <h3 className="text-xl font-semibold text-black">
                        {team}
                      </h3>
                      <JobList jobs={teamJobs} density={density} buttonVariant={buttonVariant} badgeVariant={badgeVariant} />
                    </div>
                  ))}
                </>
              )}
              {layout === 'location' && (
                <>
                  {Object.entries(groupBy(filteredJobs, (job) => job.location || 'Other')).map(([location, locationJobs]) => (
                    <div key={location} className="space-y-4 mb-8">
                      <h3 className="text-xl font-semibold text-black">
                        {location}
                      </h3>
                      <JobList jobs={locationJobs} density={density} buttonVariant={buttonVariant} badgeVariant={badgeVariant} />
                    </div>
                  ))}
                </>
              )}
              {layout !== 'team' && layout !== 'location' && (
                <>
                  {layout === 'cards' ? (
                    <JobCards jobs={filteredJobs} density={density} buttonVariant={buttonVariant} badgeVariant={badgeVariant} />
                  ) : (
                    <JobList jobs={filteredJobs} density={density} buttonVariant={buttonVariant} badgeVariant={badgeVariant} />
                  )}
                </>
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
      <SectionWrapper contentMaxWidth={maxWidth} verticalPadding="md">
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
    <SectionWrapper contentMaxWidth={maxWidth} verticalPadding="md">
      <section id="jobs" className="scroll-mt-20">
        {sectionContent}
      </section>
    </SectionWrapper>
  );
}

function JobList({
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
    <div className="space-y-3">
      {jobs.map((job) => (
        <Card key={job.id} className={`${density === 'compact' ? 'p-3' : 'p-4'} hover:border-primary transition-colors`}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-base font-medium mb-2 text-black">
                {job.title}
              </CardTitle>
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
                    {job.job_type.replace('-', ' ')}
                  </span>
                )}
              </div>
            </div>
            <Button variant={buttonVariant} size="sm" asChild>
              <a href={`#job-${job.id}`}>View details</a>
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

function JobCards({
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
                <CardTitle className="text-xl text-black">
                  {job.title}
                </CardTitle>
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
                      {job.job_type.replace('-', ' ')}
                    </span>
                  )}
                </div>
              </div>
              {job.team && (
                <Badge variant={badgeVariant}>{job.team}</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            {job.description && (
              <p className="text-sm mb-4 leading-relaxed text-black line-clamp-3">
                {job.description}
              </p>
            )}
            <Button variant={buttonVariant} className="w-full mt-auto" asChild>
              <a href={`#job-${job.id}`}>Apply Now</a>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function groupBy<T, K extends string | number>(items: T[], getKey: (item: T) => K): Record<K, T[]> {
  return items.reduce((acc, item) => {
    const key = getKey(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<K, T[]>);
}
