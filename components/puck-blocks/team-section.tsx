import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SectionWrapper } from '@/lib/section-layout/section-wrapper';
import { SECTION_TYPOGRAPHY } from '@/lib/section-layout/constants';

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

  const content = (
    <>
      <h2 className={`${SECTION_TYPOGRAPHY.heading.base} ${SECTION_TYPOGRAPHY.heading.spacing}`} style={{ color: SECTION_TYPOGRAPHY.heading.color }}>
        {heading}
      </h2>
      {description && (
        <>
          <Separator className="mb-4" />
          <p style={{ color: SECTION_TYPOGRAPHY.body.color }}>
            {description}
          </p>
        </>
      )}
    </>
  );

  if (background === 'accentStrip') {
    return (
      <SectionWrapper contentMaxWidth="3xl" verticalPadding="md" className={alignmentClasses[align]}>
        <Card className="border-0 w-full" style={{ backgroundColor: 'var(--primary-soft)' }}>
          <CardHeader>
            <CardTitle className={SECTION_TYPOGRAPHY.heading.base} style={{ color: SECTION_TYPOGRAPHY.heading.color }}>
              {heading}
            </CardTitle>
          </CardHeader>
          {description && (
            <CardContent>
              <p style={{ color: SECTION_TYPOGRAPHY.body.color }}>
                {description}
              </p>
            </CardContent>
          )}
        </Card>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper contentMaxWidth="3xl" verticalPadding="md" className={`prose prose-lg max-w-none ${alignmentClasses[align]}`}>
      {content}
    </SectionWrapper>
  );
}


