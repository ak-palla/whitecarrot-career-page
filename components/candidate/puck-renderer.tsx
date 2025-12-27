'use client';

import React from 'react';
import { Render, type Config } from '@measured/puck';
import { careersPageConfig, PuckData, type PuckProps } from '@/lib/puck/config';
import { JobsSection } from '@/components/puck-blocks/jobs-section';
import { HeroSection } from '@/components/puck-blocks/hero-section';
import { generatePalette, paletteToCSSVariables } from '@/lib/theme/palette';

interface PuckRendererProps {
  data: PuckData | null;
  theme?: any;
  jobs?: any[];
  bannerUrl?: string;
  logoUrl?: string;
  videoUrl?: string;
  companyName?: string;
}

export function PuckRenderer({ data, theme, jobs, bannerUrl, logoUrl, videoUrl, companyName }: PuckRendererProps) {
  // If no Puck data, return empty
  if (!data || !data.content || data.content.length === 0) {
    return null;
  }

  // Apply theme styles using palette helper
  const palette = generatePalette(theme || {});
  const themeStyle = paletteToCSSVariables(palette);

  // Ensure FooterSection is always at the end
  const processedData = { ...data };
  if (processedData.content && Array.isArray(processedData.content)) {
    // Find existing FooterSection if it exists
    const footerItems = processedData.content.filter((item: any) => item.type === 'FooterSection');
    const existingFooter = footerItems.length > 0 ? footerItems[0] : null;

    // Remove all FooterSections (in case there are duplicates or it's in wrong position)
    const filteredContent = processedData.content.filter((item: any) => item.type !== 'FooterSection');

    // Always add FooterSection at the end with a stable ID
    const footerId = existingFooter?.id || 'footer-section-default';
    filteredContent.push({
      type: 'FooterSection',
      id: footerId,
      props: existingFooter?.props || {},
    });

    processedData.content = filteredContent;
  }

  // Inject banner_url and logo_url into the first HeroSection if it exists
  if (processedData.content && processedData.content.length > 0) {
    const firstComponent = processedData.content[0];
    if (firstComponent && firstComponent.type === 'HeroSection') {
      // Update props with banner and logo from Theme Customizer
      const updatedProps = { ...firstComponent.props };

      // Theme Customizer banner always takes precedence
      if (bannerUrl) {
        updatedProps.backgroundImageUrl = bannerUrl;
        updatedProps.backgroundStyle = 'image'; // Set to image style to show the banner
      } else {
        // If bannerUrl is removed, clear the banner image
        // Clear backgroundImageUrl to prevent showing stale banner
        updatedProps.backgroundImageUrl = undefined;
        // Reset backgroundStyle to solid if it was set to 'image' (likely from previous theme banner)
        // This ensures removing the banner actually removes it from display
        if (updatedProps.backgroundStyle === 'image') {
          updatedProps.backgroundStyle = 'solid';
        }
      }

      if (logoUrl) {
        updatedProps.logoUrl = logoUrl;
        updatedProps.logoAlt = `${companyName || 'Company'} Logo`;
      }

      // If videoUrl is provided, add it to the hero section (as culture video)
      if (videoUrl) {
        updatedProps.cultureVideoUrl = videoUrl;
      }

      processedData.content[0] = {
        ...firstComponent,
        props: updatedProps,
      };
    }
  }

  const runtimeConfig: Config<PuckProps> = {
    ...careersPageConfig,
    components: {
      ...careersPageConfig.components,
      JobsSection: {
        ...careersPageConfig.components.JobsSection,
        render: (props: any) => <JobsSection {...props} jobs={jobs || []} />,
      },
      HeroSection: {
        ...careersPageConfig.components.HeroSection,
        render: (props: any) => <HeroSection {...props} />,
      },
    },
  };

  return (
    <div style={themeStyle} className="flex flex-col min-h-screen">
      <div className="flex-1 space-y-16">
        <Render config={runtimeConfig} data={processedData} />
      </div>
    </div>
  );
}
