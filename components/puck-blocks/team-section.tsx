import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

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
      <h2 className="mb-4 text-3xl font-bold" style={{ color: 'var(--heading-color)' }}>
        {heading}
      </h2>
      {description && (
        <>
          <Separator className="mb-4" />
          <p style={{ color: 'var(--text-color)' }}>
            {description}
          </p>
        </>
      )}
    </>
  );

  if (background === 'accentStrip') {
    return (
      <section className={`prose prose-lg max-w-none px-4 md:px-6 lg:px-[60px] ${alignmentClasses[align]}`}>
        <Card className="border-0" style={{ backgroundColor: 'var(--primary-soft)' }}>
          <CardHeader>
            <CardTitle className="text-3xl font-bold" style={{ color: 'var(--heading-color)' }}>
              {heading}
            </CardTitle>
          </CardHeader>
          {description && (
            <CardContent>
              <p style={{ color: 'var(--text-color)' }}>
                {description}
              </p>
            </CardContent>
          )}
        </Card>
      </section>
    );
  }

  return (
    <section className={`prose prose-lg max-w-none px-4 md:px-6 lg:px-[60px] ${alignmentClasses[align]}`}>
      {content}
    </section>
  );
}


