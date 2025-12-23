import React from 'react';

export interface JobsSectionProps {
  heading: string;
  layout: 'list' | 'cards' | 'team' | 'location';
  emptyStateMessage: string;
  // jobs will be injected at render time via PuckRenderer context/props
  jobs?: any;
}

export function JobsSection({ heading, layout, emptyStateMessage, jobs }: JobsSectionProps) {
  const jobsArray: any[] = Array.isArray(jobs) ? jobs : [];

  if (!jobsArray || jobsArray.length === 0) {
    return (
      <section id="jobs" className="scroll-mt-20">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold mb-2">{heading}</h2>
          <p className="text-gray-600">{emptyStateMessage}</p>
        </div>
      </section>
    );
  }

  if (layout === 'team') {
    const grouped = groupBy(jobsArray, (job) => job.team || 'Other');
    return (
      <section id="jobs" className="scroll-mt-20 space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">{heading}</h2>
        </div>
        {Object.entries(grouped).map(([team, teamJobs]) => (
          <div key={team} className="space-y-4">
            <h3 className="text-xl font-semibold">{team}</h3>
            <JobList jobs={teamJobs} />
          </div>
        ))}
      </section>
    );
  }

  if (layout === 'location') {
    const grouped = groupBy(jobsArray, (job) => job.location || 'Other');
    return (
      <section id="jobs" className="scroll-mt-20 space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">{heading}</h2>
        </div>
        {Object.entries(grouped).map(([location, locationJobs]) => (
          <div key={location} className="space-y-4">
            <h3 className="text-xl font-semibold">{location}</h3>
            <JobList jobs={locationJobs} />
          </div>
        ))}
      </section>
    );
  }

  return (
    <section id="jobs" className="scroll-mt-20">
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-bold mb-2">{heading}</h2>
      </div>
      {layout === 'cards' ? <JobCards jobs={jobsArray} /> : <JobList jobs={jobsArray} />}
    </section>
  );
}

function JobList({ jobs }: { jobs: any[] }) {
  return (
    <div className="space-y-3">
      {jobs.map((job) => (
        <div key={job.id} className="flex items-center justify-between rounded-lg border bg-white px-4 py-3 text-sm">
          <div>
            <p className="font-medium text-gray-900">{job.title}</p>
            <p className="text-xs text-gray-500">
              {job.location} • {job.job_type?.replace('-', ' ')}
            </p>
          </div>
          <span className="text-xs font-medium text-[var(--primary)]">View details</span>
        </div>
      ))}
    </div>
  );
}

function JobCards({ jobs }: { jobs: any[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {jobs.map((job) => (
        <article key={job.id} className="relative rounded-xl border bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900">{job.title}</h3>
          <p className="mt-1 text-xs text-gray-500">
            {job.location} • {job.job_type?.replace('-', ' ')}
          </p>
          <div className="mt-4 flex justify-end">
            <span className="text-xs font-medium text-[var(--primary)]">View details</span>
          </div>
        </article>
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


