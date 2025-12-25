import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SectionWrapper } from '@/lib/section-layout/section-wrapper';
import { Heart, Briefcase, GraduationCap, Home, Coffee, Plane, Shield, Award, Users, Zap, DollarSign, Sparkles } from 'lucide-react';

export interface BenefitItem {
  title: string;
  description?: string;
  icon?: string;
  iconColor?: string;
}

export interface BenefitsSectionProps {
  heading: string;
  benefits: BenefitItem[];
  styleVariant?: 'cards' | 'panels' | 'list';
  align?: 'left' | 'center';
}

// Map icon names to icon components
const iconMap: Record<string, any> = {
  Heart,
  Briefcase,
  GraduationCap,
  Home,
  Coffee,
  Plane,
  Shield,
  Award,
  Users,
  Zap,
  DollarSign,
  Sparkles,
};

export function BenefitsSection({ heading, benefits, styleVariant = 'cards', align = 'left' }: BenefitsSectionProps) {
  const alignmentClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center',
  };

  const textAlignmentClasses = {
    left: 'text-left',
    center: 'text-center mx-auto',
  };

  const isPanels = styleVariant === 'panels';
  const isList = styleVariant === 'list';

  if (isList) {
    return (
      <SectionWrapper contentMaxWidth="3xl" verticalPadding="lg">
        <div className={`flex flex-col space-y-4 mb-16 ${alignmentClasses[align]}`}>
          <div className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
            Benefits
          </div>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-balance text-black">
            {heading}
          </h2>
        </div>
        <div className="space-y-3">
          {benefits?.map((benefit, index) => (
            <div key={index}>
              <div className="flex items-start gap-4 pb-3">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-black">
                    {benefit.title}
                  </h3>
                  {benefit.description && (
                    <p className="mt-1 text-sm text-black">
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
    <SectionWrapper contentMaxWidth="full" verticalPadding="lg">
      <div className={`flex flex-col space-y-4 mb-16 ${alignmentClasses[align]}`}>
        <div className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
          Benefits
        </div>
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-balance text-black">
          {heading}
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {benefits?.map((benefit, index) => {
          const IconComponent = benefit.icon ? iconMap[benefit.icon] : null;

          if (isPanels) {
            return (
              <Card
                key={index}
                className="border-0"
                style={{
                  backgroundColor: 'var(--primary-soft)',
                }}
              >
                <CardHeader>
                  <div className="flex items-center gap-4">
                    {IconComponent && (
                      <div
                        className="h-10 w-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: 'var(--background)' }}
                      >
                        <IconComponent
                          className="h-5 w-5"
                          style={{ color: benefit.iconColor || 'var(--primary)' }}
                        />
                      </div>
                    )}
                    <CardTitle className="text-xl text-black">
                      {benefit.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                {benefit.description && (
                  <CardContent>
                    <p className="text-sm leading-relaxed text-black">
                      {benefit.description}
                    </p>
                  </CardContent>
                )}
              </Card>
            );
          }

          return (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center gap-4">
                  {IconComponent && (
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: 'var(--muted)' }}
                    >
                      <IconComponent
                        className="h-5 w-5"
                        style={{ color: benefit.iconColor || 'var(--primary)' }}
                      />
                    </div>
                  )}
                  <CardTitle className="text-xl text-black">
                    {benefit.title}
                  </CardTitle>
                </div>
              </CardHeader>
              {benefit.description && (
                <CardContent>
                  <p className="text-sm leading-relaxed text-black">
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


