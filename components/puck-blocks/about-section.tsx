import React from 'react';

export interface AboutSectionProps {
  heading: string;
  body: string;
}

export function AboutSection({ heading, body }: AboutSectionProps) {
  return (
    <section className="prose prose-lg max-w-none">
      <h2 className="mb-4 text-3xl font-bold text-gray-900">{heading}</h2>
      <div className="text-gray-700" dangerouslySetInnerHTML={{ __html: body || '' }} />
    </section>
  );
}


