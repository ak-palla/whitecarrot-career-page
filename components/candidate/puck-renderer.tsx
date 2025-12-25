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
  companyName?: string;
}

export function PuckRenderer({ data, theme, jobs, bannerUrl, logoUrl, companyName }: PuckRendererProps) {
  // If no Puck data, return empty
  if (!data || !data.content || data.content.length === 0) {
    return null;
  }

  // Apply theme styles using palette helper
  const palette = generatePalette(theme || {});
  const themeStyle = paletteToCSSVariables(palette);

  // Inject banner_url and logo_url into the first HeroSection if it exists
  const processedData = { ...data };
  if (processedData.content && processedData.content.length > 0) {
    const firstComponent = processedData.content[0];
    if (firstComponent && firstComponent.type === 'HeroSection') {
      // Update props with banner and logo from Theme Customizer
      const updatedProps = { ...firstComponent.props };
      
      // If bannerUrl is provided, use it (from Theme Customizer takes precedence)
      if (bannerUrl) {
        updatedProps.backgroundImageUrl = bannerUrl;
        updatedProps.backgroundStyle = 'image'; // Set to image style to show the banner
      }
      
      // If logoUrl is provided, add it to the hero section
      if (logoUrl) {
        updatedProps.logoUrl = logoUrl;
        updatedProps.logoAlt = `${companyName || 'Company'} Logo`;
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
    <div style={themeStyle} className="space-y-16">
      <Render config={runtimeConfig} data={processedData} />
    </div>
  );
}
