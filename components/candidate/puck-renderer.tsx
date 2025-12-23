'use client';

import React from 'react';
import { Render, type Config } from '@measured/puck';
import { careersPageConfig, PuckData, type PuckProps } from '@/lib/puck/config';
import { JobsSection } from '@/components/puck-blocks/jobs-section';
import { generatePalette, paletteToCSSVariables } from '@/lib/theme/palette';

interface PuckRendererProps {
  data: PuckData | null;
  theme?: any;
  jobs?: any[];
}

export function PuckRenderer({ data, theme, jobs }: PuckRendererProps) {
  // If no Puck data, return empty
  if (!data || !data.content || data.content.length === 0) {
    return null;
  }

  // Apply theme styles using palette helper
  const palette = generatePalette(theme || {});
  const themeStyle = paletteToCSSVariables(palette);

  const runtimeConfig: Config<PuckProps> = {
    ...careersPageConfig,
    components: {
      ...careersPageConfig.components,
      JobsSection: {
        ...careersPageConfig.components.JobsSection,
        render: (props: any) => <JobsSection {...props} jobs={jobs || []} />,
      },
    },
  };

  return (
    <div style={themeStyle} className="space-y-16">
      <Render config={runtimeConfig} data={data} />
    </div>
  );
}
