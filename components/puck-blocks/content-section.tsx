import React from 'react';

export interface ContentSectionProps {
  title: string;
  content: string;
  sectionType?: 'about' | 'culture' | 'benefits' | 'team' | 'values' | 'custom';
}

export function ContentSection({ title, content }: ContentSectionProps) {
  return (
    <section className="prose prose-lg max-w-none">
      <h2
        className="text-3xl font-bold mb-6 border-b pb-4"
        style={{
          color: 'var(--heading-color)',
          borderColor: 'var(--card-border)',
        }}
      >
        {title}
      </h2>
      <div
        style={{ color: 'var(--text-color)' }}
        dangerouslySetInnerHTML={{ __html: content || '' }}
      />
    </section>
  );
}
