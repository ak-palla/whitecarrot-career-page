import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export interface AboutSectionProps {
  heading: string;
  body: string;
  layout?: 'full' | 'twoColumn';
  background?: 'plain' | 'card';
}

export function AboutSection({ heading, body, layout = 'full', background = 'plain' }: AboutSectionProps) {
  const content = (
    <>
      <h2 className="mb-4 text-3xl font-bold" style={{ color: 'var(--heading-color)' }}>
        {heading}
      </h2>
      <div
        style={{ color: 'var(--text-color)' }}
        dangerouslySetInnerHTML={{ __html: body || '' }}
      />
    </>
  );

  if (background === 'card') {
    return (
      <section className="prose prose-lg max-w-none px-4 md:px-6 lg:px-[60px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold" style={{ color: 'var(--heading-color)' }}>
              {heading}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              style={{ color: 'var(--text-color)' }}
              dangerouslySetInnerHTML={{ __html: body || '' }}
            />
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="prose prose-lg max-w-none px-4 md:px-6 lg:px-[60px]">
      {content}
    </section>
  );
}


