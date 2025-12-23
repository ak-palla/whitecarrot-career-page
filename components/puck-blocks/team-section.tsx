import React from 'react';

export interface TeamSectionProps {
  heading: string;
  description?: string;
  background?: 'plain' | 'accentStrip';
  align?: 'left' | 'center';
}

export function TeamSection({ heading, description, background = 'plain', align = 'left' }: TeamSectionProps) {
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
  };

  const sectionClasses = background === 'accentStrip'
    ? 'rounded-xl p-6 md:p-8'
    : '';

  const sectionStyle = background === 'accentStrip'
    ? {
        backgroundColor: 'var(--primary-soft)',
      }
    : {};

  return (
    <section className={`prose prose-lg max-w-none ${sectionClasses} ${alignmentClasses[align]}`} style={sectionStyle}>
      <h2 className="mb-4 text-3xl font-bold" style={{ color: 'var(--heading-color)' }}>
        {heading}
      </h2>
      {description && (
        <p style={{ color: 'var(--text-color)' }}>
          {description}
        </p>
      )}
    </section>
  );
}


