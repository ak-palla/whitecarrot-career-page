import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { SectionWrapper } from '@/lib/section-layout/section-wrapper';
import { SECTION_TYPOGRAPHY } from '@/lib/section-layout/constants';
import { Target, Users, Zap, Globe, Heart, Briefcase, Award, Lightbulb, Rocket, Shield } from 'lucide-react';

export interface ValueCard {
  icon?: string;
  title: string;
  description: string;
  iconColor?: string;
}

export interface AboutSectionProps {
  heading: string;
  body?: string;
  values?: ValueCard[];
  layout?: 'full' | 'twoColumn' | 'cards';
  background?: 'plain' | 'card';
}

// Map icon names to icon components
const iconMap: Record<string, any> = {
  Target,
  Users,
  Zap,
  Globe,
  Heart,
  Briefcase,
  Award,
  Lightbulb,
  Rocket,
  Shield,
};

export function AboutSection({ heading, body, values, layout = 'full', background = 'plain' }: AboutSectionProps) {
  // Cards layout - show value cards with icons
  if (layout === 'cards' && values && values.length > 0) {
    return (
      <SectionWrapper contentMaxWidth="full" verticalPadding="md">
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-balance" style={{ color: SECTION_TYPOGRAPHY.heading.color }}>
            {heading}
          </h2>
          {body && (
            <p className="text-lg max-w-2xl leading-relaxed" style={{ color: SECTION_TYPOGRAPHY.body.color }}>
              {body}
            </p>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => {
            const IconComponent = value.icon ? iconMap[value.icon] : null;
            return (
              <Card key={index} className="border-2 hover:border-primary transition-all hover:shadow-lg hover:scale-[1.02]">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    {IconComponent && (
                      <div
                        className="h-12 w-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: 'var(--primary-soft)' }}
                      >
                        <IconComponent
                          className="h-6 w-6"
                          style={{ color: value.iconColor || 'var(--primary)' }}
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg" style={{ color: SECTION_TYPOGRAPHY.heading.color }}>
                        {value.title}
                      </h3>
                      <p className="text-sm leading-relaxed" style={{ color: SECTION_TYPOGRAPHY.body.color }}>
                        {value.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </SectionWrapper>
    );
  }

  // Original text-based layouts
  const content = (
    <>
      <h2 className={`${SECTION_TYPOGRAPHY.heading.base} ${SECTION_TYPOGRAPHY.heading.spacing}`} style={{ color: SECTION_TYPOGRAPHY.heading.color }}>
        {heading}
      </h2>
      {body && (
        <div
          className={SECTION_TYPOGRAPHY.body.spacing}
          style={{ color: SECTION_TYPOGRAPHY.body.color }}
          dangerouslySetInnerHTML={{ __html: body }}
        />
      )}
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
            {body && (
              <div
                style={{ color: SECTION_TYPOGRAPHY.body.color }}
                dangerouslySetInnerHTML={{ __html: body }}
              />
            )}
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
