'use client';

import React from 'react';
import { SECTION_PADDING, CONTENT_MAX_WIDTH } from './constants';
import { Card } from '@/components/ui/card';

export interface SectionWrapperProps {
  children: React.ReactNode;
  contentMaxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full';
  verticalPadding?: 'none' | 'sm' | 'md' | 'lg';
  background?: 'plain' | 'card' | 'accent';
  className?: string;
}

/**
 * Reusable wrapper component that ensures consistent layout across all sections.
 * Applies standardized padding, max-width constraints, and centers content.
 */
export function SectionWrapper({
  children,
  contentMaxWidth = '3xl', // Default: match hero section
  verticalPadding = 'md',
  background = 'plain',
  className = '',
}: SectionWrapperProps) {
  const paddingClasses = `${SECTION_PADDING.horizontal} ${SECTION_PADDING.vertical[verticalPadding]}`;
  const maxWidthClass = CONTENT_MAX_WIDTH[contentMaxWidth];

  const content = (
    <div className={`mx-auto ${maxWidthClass}`}>
      {children}
    </div>
  );

  if (background === 'card') {
    return (
      <section className={`${paddingClasses} ${className}`}>
        <div className={`${maxWidthClass} mx-auto`}>
          <Card className="w-full">
            <div className="p-6">
              {children}
            </div>
          </Card>
        </div>
      </section>
    );
  }

  if (background === 'accent') {
    return (
      <section className={`${paddingClasses} ${className}`}>
        <div className={`${maxWidthClass} mx-auto`}>
          <Card className="border-0 w-full" style={{ backgroundColor: 'var(--primary-soft)' }}>
            <div className="p-6">
              {children}
            </div>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className={`${paddingClasses} ${className}`}>
      {content}
    </section>
  );
}

