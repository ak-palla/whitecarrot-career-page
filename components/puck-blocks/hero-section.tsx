'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { SectionWrapper } from '@/lib/section-layout/section-wrapper';
import { SECTION_PADDING } from '@/lib/section-layout/constants';
import { ArrowRight } from 'lucide-react';

export interface HeroSectionProps {
  title: string;
  subtitle?: string;
  backgroundImageUrl?: string;
  cultureVideoUrl?: string;
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  alignment?: 'left' | 'center' | 'right';
  size?: 'compact' | 'tall';
  backgroundStyle?: 'solid' | 'image' | 'gradient';
  primaryCtaVariant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive';
  primaryCtaSize?: 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg';
}

export function HeroSection({
  title,
  subtitle,
  backgroundImageUrl,
  cultureVideoUrl,
  primaryCtaLabel,
  primaryCtaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
  alignment = 'center',
  size = 'tall',
  backgroundStyle = 'solid',
  primaryCtaVariant = 'secondary',
  primaryCtaSize = 'default',
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
    <SectionWrapper contentMaxWidth="full" verticalPadding={size === 'tall' ? 'lg' : 'md'}>
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
      <div className={`relative z-10 mx-auto flex max-w-3xl flex-col gap-6 ${alignmentClasses[alignment]}`}>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-balance" style={{ color: 'var(--text-on-primary)' }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-lg md:text-xl leading-relaxed text-balance" style={{ color: 'var(--text-on-primary)', opacity: 0.9 }}>
            {subtitle}
          </p>
        )}
        {(primaryCtaLabel && primaryCtaHref) || (secondaryCtaLabel && secondaryCtaHref) ? (
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            {primaryCtaLabel && primaryCtaHref && (
              <Button
                asChild
                variant={primaryCtaVariant}
                size={primaryCtaSize}
                className="rounded-full gap-2"
                style={{
                  backgroundColor: primaryCtaVariant === 'secondary' ? 'var(--secondary)' : undefined,
                  color: primaryCtaVariant === 'secondary' ? 'var(--primary)' : undefined,
                }}
              >
                <a href={primaryCtaHref}>
                  {primaryCtaLabel}
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            )}
            {secondaryCtaLabel && secondaryCtaHref && (
              <Button
                asChild
                variant="outline"
                size={primaryCtaSize}
                className="rounded-full"
                style={{
                  borderColor: 'var(--secondary)',
                  color: 'var(--text-on-primary)',
                }}
              >
                <a href={secondaryCtaHref}>
                  {secondaryCtaLabel}
                </a>
              </Button>
            )}
          </div>
        ) : null}
      </div>
      {cultureVideoUrl && (
        <div className="relative z-10 mx-auto mt-8 max-w-4xl">
          <div className="aspect-video rounded-lg overflow-hidden bg-black">
            {cultureVideoUrl.includes('youtube.com') || cultureVideoUrl.includes('youtu.be') ? (
              <iframe
                src={cultureVideoUrl.includes('youtu.be') 
                  ? `https://www.youtube.com/embed/${cultureVideoUrl.split('/').pop()}`
                  : cultureVideoUrl.replace('watch?v=', 'embed/').split('&')[0]}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Culture Video"
              />
            ) : cultureVideoUrl.includes('vimeo.com') ? (
              <iframe
                src={`https://player.vimeo.com/video/${cultureVideoUrl.split('/').pop()}`}
                className="w-full h-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title="Culture Video"
              />
            ) : (
              <video
                src={cultureVideoUrl}
                controls
                className="w-full h-full"
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </div>
      )}
    </header>
    </SectionWrapper>
  );
}


