import React from 'react';

export interface TeamSectionProps {
  heading: string;
  description?: string;
}

export function TeamSection({ heading, description }: TeamSectionProps) {
  return (
    <section className="prose prose-lg max-w-none">
      <h2 className="mb-4 text-3xl font-bold text-gray-900">{heading}</h2>
      {description && <p className="text-gray-700">{description}</p>}
    </section>
  );
}


