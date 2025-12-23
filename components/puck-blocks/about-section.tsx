import React from 'react';

export interface AboutSectionProps {
  heading: string;
  body: string;
  layout?: 'full' | 'twoColumn';
  background?: 'plain' | 'card';
}

export function AboutSection({ heading, body, layout = 'full', background = 'plain' }: AboutSectionProps) {
  const sectionClasses = background === 'card' 
    ? 'rounded-xl p-6 md:p-8 shadow-sm'
    : '';

  const sectionStyle = background === 'card' 
    ? {
        backgroundColor: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
      }
    : {};

  return (
    <section className={`prose prose-lg max-w-none ${sectionClasses}`} style={sectionStyle}>
      <h2 className="mb-4 text-3xl font-bold" style={{ color: 'var(--heading-color)' }}>
        {heading}
      </h2>
      <div
        style={{ color: 'var(--text-color)' }}
        dangerouslySetInnerHTML={{ __html: body || '' }}
      />
    </section>
  );
}


