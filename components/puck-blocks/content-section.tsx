import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SectionWrapper } from '@/lib/section-layout/section-wrapper';
import { SECTION_TYPOGRAPHY } from '@/lib/section-layout/constants';

export interface ContentSectionProps {
  title: string;
  content: string;
  sectionType?: 'about' | 'culture' | 'benefits' | 'team' | 'values' | 'custom';
}

export function ContentSection({ title, content }: ContentSectionProps) {
  return (
    <SectionWrapper contentMaxWidth="3xl" verticalPadding="md">
      <Card>
        <CardHeader>
          <CardTitle className={`${SECTION_TYPOGRAPHY.heading.base} text-black`}>
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Separator className="mb-4" />
          <div
            className="text-black prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: content || '' }}
          />
        </CardContent>
      </Card>
    </SectionWrapper>
  );
}
