'use client';

import React from 'react';

export interface HeroSectionProps {
  title: string;
  subtitle?: string;
  backgroundImageUrl?: string;
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  alignment?: 'left' | 'center' | 'right';
  size?: 'compact' | 'tall';
  backgroundStyle?: 'solid' | 'image' | 'gradient';
}

export function HeroSection({
  title,
  subtitle,
  backgroundImageUrl,
  primaryCtaLabel,
  primaryCtaHref,
  alignment = 'center',
  size = 'tall',
  backgroundStyle = 'solid',
}: HeroSectionProps) {
  const alignmentClasses = {
    left: 'items-start text-left',
    center: 'items-center text-center',
    right: 'items-end text-right',
  };

  const sizeClasses = {
    compact: 'py-12 md:py-16',
    tall: 'py-16 md:py-20',
  };

  const getBackgroundStyle = () => {
    if (backgroundStyle === 'gradient') {
      return {
        background: `linear-gradient(135deg, var(--primary) 0%, var(--primary-strong) 100%)`,
      };
    }
    return {
      backgroundColor: 'var(--primary)',
    };
  };

  return (
    <header
      className={`relative overflow-hidden rounded-3xl px-6 md:px-10 ${sizeClasses[size]}`}
      style={getBackgroundStyle()}
    >
      {backgroundImageUrl && backgroundStyle === 'image' && (
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{ backgroundImage: `url(${backgroundImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
      )}
      <div className={`relative z-10 mx-auto flex max-w-3xl flex-col gap-4 ${alignmentClasses[alignment]}`}>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl" style={{ color: 'var(--text-on-primary)' }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm md:text-base" style={{ color: 'var(--text-on-primary)', opacity: 0.9 }}>
            {subtitle}
          </p>
        )}
        {primaryCtaLabel && primaryCtaHref && (
          <a
            href={primaryCtaHref}
            className="mt-4 inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-medium shadow-sm transition hover:opacity-90"
            style={{
              backgroundColor: 'var(--secondary)',
              color: 'var(--primary)',
            }}
          >
            {primaryCtaLabel}
          </a>
        )}
      </div>
    </header>
  );
}


