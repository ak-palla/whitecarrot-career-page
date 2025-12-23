import React from 'react';

export interface HeroSectionProps {
  title: string;
  subtitle?: string;
  backgroundImageUrl?: string;
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
}

export function HeroSection({
  title,
  subtitle,
  backgroundImageUrl,
  primaryCtaLabel,
  primaryCtaHref,
}: HeroSectionProps) {
  return (
    <header className="relative overflow-hidden rounded-3xl bg-[var(--primary)] px-6 py-16 text-center text-[var(--secondary)] md:px-10 md:py-20">
      {backgroundImageUrl && (
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{ backgroundImage: `url(${backgroundImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
      )}
      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
        {subtitle && <p className="text-sm md:text-base text-[var(--secondary)]/90">{subtitle}</p>}
        {primaryCtaLabel && primaryCtaHref && (
          <a
            href={primaryCtaHref}
            className="mt-4 inline-flex items-center justify-center rounded-full bg-[var(--secondary)] px-5 py-2 text-sm font-medium text-[var(--primary)] shadow-sm transition hover:bg-[var(--secondary)]/90"
          >
            {primaryCtaLabel}
          </a>
        )}
      </div>
    </header>
  );
}


