import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
          {layout === 'team' && (
            <>
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--heading-color)' }}>
                  {heading}
                </h2>
              </div>
              {Object.entries(groupBy(jobsArray, (job) => job.team || 'Other')).map(([team, teamJobs]) => (
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
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--heading-color)' }}>
                  {heading}
                </h2>
              </div>
              {Object.entries(groupBy(jobsArray, (job) => job.location || 'Other')).map(([location, locationJobs]) => (
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
              <div className="mb-6 text-center">
                <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--heading-color)' }}>
                  {heading}
                </h2>
              </div>
              {layout === 'cards' ? (
                <JobCards jobs={jobsArray} density={density} buttonVariant={buttonVariant} badgeVariant={badgeVariant} />
              ) : (
                <JobList jobs={jobsArray} density={density} buttonVariant={buttonVariant} badgeVariant={badgeVariant} />
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


