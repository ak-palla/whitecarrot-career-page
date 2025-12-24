'use client';

import type { CSSProperties } from 'react';
import { useState, useEffect, useMemo } from 'react';
import { Puck } from '@measured/puck';
import { careersPageConfig, PuckData } from '@/lib/puck/config';
import '@measured/puck/puck.css';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { generatePalette, paletteToCSSVariables } from '@/lib/theme/palette';
import { TemplateSelector } from './template-selector';
import { applyTemplate } from '@/lib/puck/templates';

interface PuckEditorProps {
  careerPage: any;
  companySlug: string;
  onSave?: (data: PuckData) => Promise<void>;
  onPublish?: (data: PuckData) => Promise<void>;
  themeOverride?: any;
}

export function PuckEditor({ careerPage, companySlug, onSave, onPublish, themeOverride }: PuckEditorProps) {
  // Ensure data is always properly initialized
  const getInitialData = (): PuckData => {
    if (careerPage?.draft_puck_data) {
      const draft = careerPage.draft_puck_data;
      return {
        content: Array.isArray(draft.content) ? draft.content : [],
        root: draft.root || { props: {} },
      };
    }
    return { content: [], root: { props: {} } };
  };

  const [data, setData] = useState<PuckData>(getInitialData());
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showStarter, setShowStarter] = useState(
    !careerPage?.draft_puck_data ||
      !careerPage.draft_puck_data?.content ||
      !Array.isArray(careerPage.draft_puck_data.content) ||
      careerPage.draft_puck_data.content.length === 0
  );

  // Apply theme styles using palette helper - use themeOverride if provided
  const theme = themeOverride || careerPage?.theme || {};
  const palette = generatePalette(theme);
  const themeStyle = paletteToCSSVariables(palette);

  // Helper to normalize Puck data structure
  const normalizePuckData = (puckData: PuckData | null | undefined): PuckData => {
    if (!puckData) {
      return { content: [], root: { props: {} } };
    }
    
    return {
      root: puckData.root || { props: {} },
      content: Array.isArray(puckData.content) 
        ? puckData.content.filter((item: any) => 
            item && 
            typeof item === 'object' && 
            item.type && 
            item.props &&
            typeof item.type === 'string'
          )
        : [],
    };
  };

  const handleSave = async (newData: PuckData) => {
    if (!onSave) return;

    setIsSaving(true);
    try {
      await onSave(newData);
      setHasUnsavedChanges(false);
      toast.success('Draft saved successfully');
    } catch (error) {
      console.error('Failed to save:', error);
      toast.error('Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    try {
      const companyName = careerPage?.company_name || 'Your company';
      const templateData = applyTemplate(templateId, companyName);
      
      // Ensure the data structure is correct for Puck
      const normalizedData: PuckData = {
        root: templateData.root || { props: {} },
        content: Array.isArray(templateData.content) ? templateData.content : [],
      };
      
      // Validate content items structure
      normalizedData.content = normalizedData.content.map((item: any) => {
        if (!item || typeof item !== 'object') {
          return null;
        }
        return {
          type: item.type || 'ContentSection',
          props: item.props || {},
        };
      }).filter(Boolean); // Remove any null items
      
      // Update data
      setData(normalizedData);
      setHasUnsavedChanges(true);
      setShowStarter(false);
      
      toast.success(`Template "${templateId}" applied successfully`);
    } catch (error) {
      console.error('Failed to apply template:', error);
      toast.error('Failed to apply template');
    }
  };

  const handleBlankPage = () => {
    setData({ root: { props: {} }, content: [] });
    setHasUnsavedChanges(true);
    setShowStarter(false);
  };

  const handlePublish = async () => {
    if (!onPublish) return;

    setIsPublishing(true);
    try {
      await onPublish(data);
      setHasUnsavedChanges(false);
      toast.success('Page published successfully');
    } catch (error) {
      console.error('Failed to publish:', error);
      toast.error('Failed to publish page');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div style={themeStyle} className="relative">
      {hasUnsavedChanges && (
        <div className="absolute left-0 right-0 top-0 z-50 bg-amber-100 py-2 text-center text-sm text-amber-800">
          You have unsaved changes
        </div>
      )}

      {showStarter && (!data?.content || !Array.isArray(data.content) || data.content.length === 0) && (
        <div className="absolute inset-x-4 top-20 z-40 mx-auto max-w-6xl rounded-lg border bg-background/95 p-6 shadow-lg max-h-[80vh] overflow-y-auto">
          <TemplateSelector
            onSelectTemplate={handleTemplateSelect}
            onSelectBlank={handleBlankPage}
          />
        </div>
      )}

      {data && (
        <Puck
          config={careersPageConfig}
          data={normalizePuckData(data)}
        onPublish={async (newData: PuckData) => {
          // Validate and normalize data before saving
          const normalized = normalizePuckData(newData);
          setData(normalized);
          await handleSave(normalized);
        }}
        onChange={(newData: PuckData) => {
          // Validate and normalize data structure to prevent errors when deleting
          const normalized = normalizePuckData(newData);
          setData(normalized);
          setHasUnsavedChanges(true);
        }}
        overrides={{
          header: ({ children, actions }) => (
            <div className="flex items-center justify-between border-b bg-white p-4">
              <div className="flex items-center gap-4">{children}</div>
              <div className="flex gap-2">
                {/* Replace Puck's default publish action with explicit Save/Publish buttons */}
                <Button
                  onClick={async () => {
                    await handleSave(data);
                  }}
                  disabled={isSaving || isPublishing}
                  variant="outline"
                >
                  {isSaving ? 'Saving…' : 'Save draft'}
                </Button>
                <Button onClick={handlePublish} disabled={isPublishing || isSaving} variant="default">
                  {isPublishing ? 'Publishing...' : 'Publish to Live'}
                </Button>
              </div>
            </div>
          ),
        }}
        />
      )}
    </div>
  );
}
