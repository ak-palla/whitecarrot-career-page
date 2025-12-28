'use client';

/**
 * Puck Editor Component
 * Main component for editing career pages using Puck.js
 * Refactored to use split components for better maintainability
 */

import '@measured/puck/puck.css';
import { useState, useCallback, useMemo } from 'react';
import { careersPageConfig } from '@/lib/puck/config';
import { savePuckDraft, publishPuckPage } from '@/app/actions/career-pages';
import { toast } from 'sonner';
import type { CareerPage, Job, PuckData } from '@/lib/types';
import { JobsSection } from '@/components/puck-blocks/jobs-section';
import { PuckEditorToolbar } from './puck-editor/toolbar';
import { PuckEditorCanvas } from './puck-editor/canvas';
import { usePuckData } from './puck-editor/hooks/use-puck-data';

interface PuckEditorProps {
  careerPage: CareerPage;
  companySlug: string;
  jobs?: Job[];
}

export function PuckEditor({
  careerPage,
  companySlug,
  jobs = [],
}: PuckEditorProps) {
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [errorBoundaryKey, setErrorBoundaryKey] = useState(0);

  // Use the custom hook for Puck data management
  const { data, setData, resetData } = usePuckData({
    careerPage,
  });

  // Reset handler for error boundary
  const handleEditorReset = useCallback(() => {
    resetData();
    setErrorBoundaryKey((prev) => prev + 1);
    toast.info('Editor has been reset. You may need to reload your page data.');
  }, [resetData]);

  // Memoize the config to prevent recreation on every render
  const puckConfig = useMemo(() => {
    const validComponents = Object.entries(careersPageConfig.components).reduce((acc, [key, value]) => {
      if (value && typeof value === 'object') {
        if (value.render && typeof value.render === 'function') {
          acc[key] = value;
        } else {
          console.warn(`PuckEditor: Component ${key} missing render function`);
        }
      }
      return acc;
    }, {} as Record<string, unknown>) as typeof careersPageConfig.components;

    if (!validComponents.JobsSection) {
      console.error('PuckEditor: JobsSection not found in config');
    }

    const config = {
      ...careersPageConfig,
      components: {
        ...validComponents,
        JobsSection: validComponents.JobsSection ? {
          ...validComponents.JobsSection,
          render: (props: unknown) => {
            const jobsSectionProps = props as { heading?: string; layout?: string; emptyStateMessage?: string; [key: string]: unknown };
            const layoutValue = jobsSectionProps.layout;
            const layout: 'list' | 'cards' | 'team' | 'location' = 
              (layoutValue === 'list' || layoutValue === 'cards' || layoutValue === 'team' || layoutValue === 'location')
                ? (layoutValue as 'list' | 'cards' | 'team' | 'location')
                : 'list';
            const { layout: _, ...restProps } = jobsSectionProps;
            return <JobsSection 
              heading={jobsSectionProps.heading || 'Open positions'}
              layout={layout}
              emptyStateMessage={jobsSectionProps.emptyStateMessage || 'No open positions at the moment. Check back soon!'}
              {...restProps}
              jobs={jobs || []} 
            />;
          },
        } : validComponents.JobsSection,
      },
    };

    if (!config.components || typeof config.components !== 'object') {
      console.error('PuckEditor: Invalid config structure');
      return careersPageConfig;
    }

    return config;
  }, [jobs]);

  const handleChange = useCallback((newData: Parameters<typeof setData>[0]) => {
    try {
      setData(newData);
    } catch (error) {
      console.error('Error in handleChange:', error);
      toast.error('Failed to update page structure. Please refresh and try again.');
    }
  }, [setData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await savePuckDraft(careerPage.id, data as PuckData, companySlug);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Draft saved');
      }
    } catch (error) {
      toast.error('Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      // First, save the current draft state to ensure all changes are saved
      const saveResult = await savePuckDraft(careerPage.id, data as PuckData, companySlug);
      if (saveResult.error) {
        toast.error(`Failed to save draft: ${saveResult.error}`);
        setPublishing(false);
        return;
      }

      // Then publish the saved draft
      const result = await publishPuckPage(careerPage.id, companySlug);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Page published!');
      }
    } catch (error) {
      toast.error('Failed to publish page');
    } finally {
      setPublishing(false);
    }
  };

  const handleCopyLink = async () => {
    const publicUrl = `${window.location.origin}/${companySlug}/careers`;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setLinkCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <PuckEditorToolbar
        companySlug={companySlug}
        saving={saving}
        publishing={publishing}
        linkCopied={linkCopied}
        onSave={handleSave}
        onCopyLink={handleCopyLink}
      />

      <div className="flex-1 overflow-auto">
        <PuckEditorCanvas
          config={puckConfig}
          data={data}
          onChange={handleChange}
          onPublish={handlePublish}
          errorBoundaryKey={errorBoundaryKey}
          onReset={handleEditorReset}
        />
      </div>
    </div>
  );
}
