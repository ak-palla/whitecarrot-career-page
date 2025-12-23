import React from 'react';

export interface ContentSectionProps {
  title: string;
  content: string;
  sectionType?: 'about' | 'culture' | 'benefits' | 'team' | 'values' | 'custom';
}

export function ContentSection({ title, content }: ContentSectionProps) {
  return (
    <section className="prose prose-lg max-w-none">
      <h2 className="text-3xl font-bold mb-6 text-gray-900 border-b pb-4">
        {title}
      </h2>
      <div dangerouslySetInnerHTML={{ __html: content || '' }} />
    </section>
  );
}
