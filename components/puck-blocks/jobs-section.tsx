import React from 'react';

export interface JobsSectionProps {
  heading: string;
  layout: 'list' | 'cards' | 'team' | 'location';
  emptyStateMessage: string;
  density?: 'comfortable' | 'compact';
  background?: 'plain' | 'card';
  // jobs will be injected at render time via PuckRenderer context/props
  jobs?: any;
}

export function JobsSection({ heading, layout, emptyStateMessage, jobs, density = 'comfortable', background = 'plain' }: JobsSectionProps) {
  const jobsArray: any[] = Array.isArray(jobs) ? jobs : [];

  const sectionClasses = background === 'card'
    ? 'rounded-xl p-6 md:p-8 shadow-sm'
    : '';

  const sectionStyle = background === 'card'
    ? {
        backgroundColor: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
      }
    : {};

  if (!jobsArray || jobsArray.length === 0) {
    return (
      <section id="jobs" className={`scroll-mt-20 ${sectionClasses}`} style={sectionStyle}>
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--heading-color)' }}>
            {heading}
          </h2>
          <p style={{ color: 'var(--text-color)' }}>{emptyStateMessage}</p>
        </div>
      </section>
    );
  }

  if (layout === 'team') {
    const grouped = groupBy(jobsArray, (job) => job.team || 'Other');
    return (
      <section id="jobs" className={`scroll-mt-20 space-y-8 ${sectionClasses}`} style={sectionStyle}>
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--heading-color)' }}>
            {heading}
          </h2>
        </div>
        {Object.entries(grouped).map(([team, teamJobs]) => (
          <div key={team} className="space-y-4">
            <h3 className="text-xl font-semibold" style={{ color: 'var(--heading-color)' }}>
              {team}
            </h3>
            <JobList jobs={teamJobs} density={density} />
          </div>
        ))}
      </section>
    );
  }

  if (layout === 'location') {
    const grouped = groupBy(jobsArray, (job) => job.location || 'Other');
    return (
      <section id="jobs" className={`scroll-mt-20 space-y-8 ${sectionClasses}`} style={sectionStyle}>
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--heading-color)' }}>
            {heading}
          </h2>
        </div>
        {Object.entries(grouped).map(([location, locationJobs]) => (
          <div key={location} className="space-y-4">
            <h3 className="text-xl font-semibold" style={{ color: 'var(--heading-color)' }}>
              {location}
            </h3>
            <JobList jobs={locationJobs} density={density} />
          </div>
        ))}
      </section>
    );
  }

  return (
    <section id="jobs" className={`scroll-mt-20 ${sectionClasses}`} style={sectionStyle}>
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--heading-color)' }}>
          {heading}
        </h2>
      </div>
      {layout === 'cards' ? <JobCards jobs={jobsArray} density={density} /> : <JobList jobs={jobsArray} density={density} />}
    </section>
  );
}

function JobList({ jobs, density = 'comfortable' }: { jobs: any[]; density?: 'comfortable' | 'compact' }) {
  const paddingClasses = density === 'compact' ? 'px-4 py-2' : 'px-4 py-3';
  
  return (
    <div className="space-y-3">
      {jobs.map((job) => (
        <div
          key={job.id}
          className={`flex items-center justify-between rounded-lg border ${paddingClasses} text-sm`}
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--card-border)',
          }}
        >
          <div>
            <p className="font-medium" style={{ color: 'var(--heading-color)' }}>
              {job.title}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-color)', opacity: 0.7 }}>
              {job.location} • {job.job_type?.replace('-', ' ')}
            </p>
          </div>
          <span className="text-xs font-medium" style={{ color: 'var(--primary)' }}>
            View details
          </span>
        </div>
      ))}
    </div>
  );
}

function JobCards({ jobs, density = 'comfortable' }: { jobs: any[]; density?: 'comfortable' | 'compact' }) {
  const paddingClasses = density === 'compact' ? 'p-4' : 'p-5';
  
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {jobs.map((job) => (
        <article
          key={job.id}
          className={`relative rounded-xl border ${paddingClasses} shadow-sm`}
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--card-border)',
          }}
        >
          <h3 className="text-base font-semibold" style={{ color: 'var(--heading-color)' }}>
            {job.title}
          </h3>
          <p className="mt-1 text-xs" style={{ color: 'var(--text-color)', opacity: 0.7 }}>
            {job.location} • {job.job_type?.replace('-', ' ')}
          </p>
          <div className="mt-4 flex justify-end">
            <span className="text-xs font-medium" style={{ color: 'var(--primary)' }}>
              View details
            </span>
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


