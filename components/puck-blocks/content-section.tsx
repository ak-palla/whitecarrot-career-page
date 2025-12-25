import React from 'react';
import { SectionWrapper } from '@/lib/section-layout/section-wrapper';

export interface ContentSectionProps {
  title: string;
  content: string;
  sectionType?: 'about' | 'culture' | 'benefits' | 'team' | 'values' | 'custom';
  align?: 'left' | 'center';
}

const getSectionLabel = (sectionType?: string) => {
  const labels: Record<string, string> = {
    about: 'About Us',
    culture: 'Culture',
    benefits: 'Benefits',
    team: 'Our Team',
    values: 'Our Values',
  };
  return labels[sectionType || ''] || 'Content';
};

export function ContentSection({ title, content, sectionType, align = 'center' }: ContentSectionProps) {
  const alignmentClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center',
  };

  const textAlignmentClasses = {
    left: 'text-left',
    center: 'text-center mx-auto',
  };

  return (
    <SectionWrapper contentMaxWidth="3xl" verticalPadding="lg">
      <div className={`flex flex-col space-y-4 mb-16 ${alignmentClasses[align]}`}>
        <div className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
          {getSectionLabel(sectionType)}
        </div>
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-balance text-black">
          {title}
        </h2>
        {content && (
          <div
            className={`text-lg max-w-2xl leading-relaxed text-muted-foreground prose prose-lg max-w-none ${textAlignmentClasses[align]}`}
            dangerouslySetInnerHTML={{ __html: content || '' }}
          />
        )}
      </div>
    </SectionWrapper>
  );
}
