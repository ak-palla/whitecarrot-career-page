import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SectionWrapper } from '@/lib/section-layout/section-wrapper';
import { SECTION_TYPOGRAPHY, GRID_LAYOUTS } from '@/lib/section-layout/constants';

export interface BenefitItem {
  title: string;
  description?: string;
}

export interface BenefitsSectionProps {
  heading: string;
  benefits: BenefitItem[];
  styleVariant?: 'cards' | 'panels' | 'list';
}

export function BenefitsSection({ heading, benefits, styleVariant = 'cards' }: BenefitsSectionProps) {
  const isPanels = styleVariant === 'panels';
  const isList = styleVariant === 'list';

  if (isList) {
    return (
      <SectionWrapper contentMaxWidth="3xl" verticalPadding="md">
        <h2 className={`${SECTION_TYPOGRAPHY.heading.base} ${SECTION_TYPOGRAPHY.heading.spacing}`} style={{ color: SECTION_TYPOGRAPHY.heading.color }}>
          {heading}
        </h2>
        <div className="space-y-3">
          {benefits?.map((benefit, index) => (
            <div key={index}>
              <div className="flex items-start gap-4 pb-3">
                <div className="flex-1">
                  <h3 className="text-base font-semibold" style={{ color: SECTION_TYPOGRAPHY.heading.color }}>
                    {benefit.title}
                  </h3>
                  {benefit.description && (
                    <p className="mt-1 text-sm" style={{ color: SECTION_TYPOGRAPHY.body.color }}>
                      {benefit.description}
                    </p>
                  )}
                </div>
              </div>
              {index < benefits.length - 1 && <Separator />}
            </div>
          ))}
        </div>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper contentMaxWidth="3xl" verticalPadding="md">
      <h2 className={`${SECTION_TYPOGRAPHY.heading.base} ${SECTION_TYPOGRAPHY.heading.spacing}`} style={{ color: SECTION_TYPOGRAPHY.heading.color }}>
        {heading}
      </h2>
      <div className={GRID_LAYOUTS.twoColumn}>
        {benefits?.map((benefit, index) => {
          if (isPanels) {
            return (
              <Card
                key={index}
                className="border-0"
                style={{
                  backgroundColor: 'var(--primary-soft)',
                }}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold" style={{ color: SECTION_TYPOGRAPHY.heading.color }}>
                    {benefit.title}
                  </CardTitle>
                </CardHeader>
                {benefit.description && (
                  <CardContent className="pt-0">
                    <p className="text-sm" style={{ color: SECTION_TYPOGRAPHY.body.color }}>
                      {benefit.description}
                    </p>
                  </CardContent>
                )}
              </Card>
            );
          }

          return (
            <Card key={index}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold" style={{ color: SECTION_TYPOGRAPHY.heading.color }}>
                  {benefit.title}
                </CardTitle>
              </CardHeader>
              {benefit.description && (
                <CardContent className="pt-0">
                  <p className="text-sm" style={{ color: SECTION_TYPOGRAPHY.body.color }}>
                    {benefit.description}
                  </p>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </SectionWrapper>
  );
}


