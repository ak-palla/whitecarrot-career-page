import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export interface ContentSectionProps {
  title: string;
  content: string;
  sectionType?: 'about' | 'culture' | 'benefits' | 'team' | 'values' | 'custom';
}

export function ContentSection({ title, content }: ContentSectionProps) {
  return (
    <section className="prose prose-lg max-w-none px-4 md:px-6 lg:px-[60px] py-8 md:py-12 lg:py-[50px]">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold" style={{ color: 'var(--heading-color)' }}>
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Separator className="mb-4" />
          <div
            style={{ color: 'var(--text-color)' }}
            dangerouslySetInnerHTML={{ __html: content || '' }}
          />
        </CardContent>
      </Card>
    </section>
  );
}
