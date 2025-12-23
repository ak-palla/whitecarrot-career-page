'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Search } from 'lucide-react';

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
          <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--heading-color)' }}>
            {heading}
          </h2>
          <p style={{ color: 'var(--text-color)' }}>{emptyStateMessage}</p>
        </div>
      ) : (
        <>
          <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--heading-color)' }}>
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
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'var(--text-color)', opacity: 0.5 }} />
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
                        <X className="h-4 w-4" style={{ color: 'var(--text-color)', opacity: 0.5 }} />
                      </button>
                    )}
                  </div>

                  {/* Filter Dropdowns */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Location Filter */}
                    {filterOptions.locations.length > 0 && (
                      <div className="space-y-2">
                        <Label htmlFor="location-filter" style={{ color: 'var(--heading-color)' }}>
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
                        <Label htmlFor="job-type-filter" style={{ color: 'var(--heading-color)' }}>
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
                        <Label htmlFor="team-filter" style={{ color: 'var(--heading-color)' }}>
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
                      <p className="text-sm" style={{ color: 'var(--text-color)' }}>
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
                    <p className="text-sm pt-2" style={{ color: 'var(--text-color)' }}>
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
              <p className="text-lg mb-4" style={{ color: 'var(--text-color)' }}>
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
            <h3 className="text-xl font-semibold" style={{ color: 'var(--heading-color)' }}>
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
            <h3 className="text-xl font-semibold" style={{ color: 'var(--heading-color)' }}>
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

  if (background === 'card') {
    return (
      <section id="jobs" className="scroll-mt-20 px-4 md:px-6 lg:px-[60px] py-8 md:py-12 lg:py-[50px]">
        <Card>
          <CardContent className="pt-6">
            {sectionContent}
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section id="jobs" className="scroll-mt-20 px-4 md:px-6 lg:px-[60px] py-8 md:py-12 lg:py-[50px]">
      {sectionContent}
    </section>
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
        <Card key={job.id} className={density === 'compact' ? 'p-3' : 'p-4'}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-base font-medium mb-1" style={{ color: 'var(--heading-color)' }}>
              {job.title}
              </CardTitle>
              <div className="flex gap-2 flex-wrap">
                {job.location && (
                  <Badge variant={badgeVariant} className="text-xs">
                    {job.location}
                  </Badge>
                )}
                {job.job_type && (
                  <Badge variant={badgeVariant} className="text-xs">
                    {job.job_type.replace('-', ' ')}
                  </Badge>
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
    <div className="grid gap-4 md:grid-cols-2">
      {jobs.map((job) => (
        <Card key={job.id} className={density === 'compact' ? 'p-4' : 'p-5'}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold" style={{ color: 'var(--heading-color)' }}>
            {job.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="flex gap-2 flex-wrap">
              {job.location && (
                <Badge variant={badgeVariant} className="text-xs">
                  {job.location}
                </Badge>
              )}
              {job.job_type && (
                <Badge variant={badgeVariant} className="text-xs">
                  {job.job_type.replace('-', ' ')}
                </Badge>
              )}
          </div>
          </CardContent>
          <CardFooter className="pt-0 justify-end">
            <Button variant={buttonVariant} size="sm" asChild>
              <a href={`#job-${job.id}`}>View details</a>
            </Button>
          </CardFooter>
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
