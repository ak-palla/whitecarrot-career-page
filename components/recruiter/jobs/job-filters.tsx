'use client';

/**
 * Job Filters Component
 * Provides filtering UI for job listings
 */

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { formatJobType } from '@/lib/utils/job-helpers';

interface JobFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedLocation: string;
  onLocationChange: (value: string) => void;
  selectedJobType: string;
  onJobTypeChange: (value: string) => void;
  selectedTeam: string;
  onTeamChange: (value: string) => void;
  selectedPublishedStatus: string;
  onPublishedStatusChange: (value: string) => void;
  filterOptions: {
    locations: string[];
    jobTypes: string[];
    teams: string[];
  };
  hasActiveFilters: boolean;
  filteredJobsCount: number;
  onClearFilters: () => void;
}

export function JobFilters({
  searchQuery,
  onSearchChange,
  selectedLocation,
  onLocationChange,
  selectedJobType,
  onJobTypeChange,
  selectedTeam,
  onTeamChange,
  selectedPublishedStatus,
  onPublishedStatusChange,
  filterOptions,
  hasActiveFilters,
  filteredJobsCount,
  onClearFilters,
}: JobFiltersProps) {
  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
              <Select value={selectedLocation} onValueChange={onLocationChange}>
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
              <Select value={selectedJobType} onValueChange={onJobTypeChange}>
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
              <Select value={selectedTeam} onValueChange={onTeamChange}>
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
            <Select value={selectedPublishedStatus} onValueChange={onPublishedStatusChange}>
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
        {hasActiveFilters ? (
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-muted-foreground">
              {filteredJobsCount === 0 ? (
                'No jobs match your filters'
              ) : (
                `${filteredJobsCount} ${filteredJobsCount === 1 ? 'job' : 'jobs'} found`
              )}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Clear filters
            </Button>
          </div>
        ) : (
          <p className="text-sm pt-2 text-muted-foreground">
            {filteredJobsCount} {filteredJobsCount === 1 ? 'job' : 'jobs'} available
          </p>
        )}
      </div>
    </Card>
  );
}

