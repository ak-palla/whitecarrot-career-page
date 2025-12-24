import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { SectionWrapper } from '@/lib/section-layout/section-wrapper';
import { SECTION_TYPOGRAPHY } from '@/lib/section-layout/constants';

export interface AboutSectionProps {
  heading: string;
  body: string;
  layout?: 'full' | 'twoColumn';
  background?: 'plain' | 'card';
}

export function AboutSection({ heading, body, layout = 'full', background = 'plain' }: AboutSectionProps) {
  const content = (
    <>
      <h2 className={`${SECTION_TYPOGRAPHY.heading.base} ${SECTION_TYPOGRAPHY.heading.spacing}`} style={{ color: SECTION_TYPOGRAPHY.heading.color }}>
        {heading}
      </h2>
      <div
        className={SECTION_TYPOGRAPHY.body.spacing}
        style={{ color: SECTION_TYPOGRAPHY.body.color }}
        dangerouslySetInnerHTML={{ __html: body || '' }}
      />
    </>
  );

  if (background === 'card') {
    return (
      <SectionWrapper contentMaxWidth="3xl" verticalPadding="md">
        <Card>
          <CardHeader>
            <CardTitle className={SECTION_TYPOGRAPHY.heading.base} style={{ color: SECTION_TYPOGRAPHY.heading.color }}>
              {heading}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              style={{ color: SECTION_TYPOGRAPHY.body.color }}
              dangerouslySetInnerHTML={{ __html: body || '' }}
            />
          </CardContent>
        </Card>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper contentMaxWidth="3xl" verticalPadding="md">
      <div className="prose prose-lg max-w-none">
        {content}
      </div>
    </SectionWrapper>
  );
}
