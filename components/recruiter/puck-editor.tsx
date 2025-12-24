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
  // Ensure data is always properly initialized with IDs - use useMemo to prevent re-computation
  const initialData = useMemo((): PuckData => {
    if (careerPage?.draft_puck_data) {
      const draft = careerPage.draft_puck_data;
      const content = Array.isArray(draft.content)
        ? draft.content.map((item: any, index: number) => {
            // Ensure every item has a unique ID
            if (!item || typeof item !== 'object') return null;
            return {
              ...item,
              id: item.id || `initial-${index}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            };
          }).filter(Boolean)
        : [];
      return {
        content,
        root: draft.root || { props: {} },
      };
    }
    return { content: [], root: { props: {} } };
  }, []); // Empty deps - only compute once on mount

  const [data, setData] = useState<PuckData>(initialData);
  const [puckKey, setPuckKey] = useState(0); // Key to force Puck re-render when template is applied
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
    try {
      if (!puckData) {
        return { content: [], root: { props: {} } };
      }

      // Ensure root exists and is an object
      const root = puckData.root && typeof puckData.root === 'object'
        ? { props: puckData.root.props || {} }
        : { props: {} };

      // Track used IDs to prevent duplicates
      const usedIds = new Set<string>();

      // Safely filter content array and ensure each item has a unique ID
      const content = Array.isArray(puckData.content)
        ? puckData.content
            .filter((item: any) => {
              if (!item || typeof item !== 'object') {
                return false;
              }
              // Ensure item has required properties
              return (
                item.type &&
                typeof item.type === 'string' &&
                item.props &&
                typeof item.props === 'object'
              );
            })
            .map((item: any, index: number) => {
              // Ensure every item has a unique ID for Puck's internal tracking
              let itemId = item.id;

              // Generate new ID if missing, empty, or duplicate
              if (!itemId || typeof itemId !== 'string' || itemId.trim() === '' || usedIds.has(itemId)) {
                // Create a truly unique ID using timestamp and crypto-random
                itemId = `${item.type}-${index}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

                // Ensure this new ID is also unique (unlikely collision but safe)
                while (usedIds.has(itemId)) {
                  itemId = `${item.type}-${index}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                }
              }

              usedIds.add(itemId);

              return {
                ...item,
                id: itemId,
              };
            })
        : [];

      return {
        root,
        content,
      };
    } catch (error) {
      console.error('Error normalizing Puck data:', error);
      console.error('Input data:', puckData);
      // Return safe default on error
      return { content: [], root: { props: {} } };
    }
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

      const baseTimestamp = Date.now();
      const normalizedData: PuckData = {
        root: templateData.root || { props: {} },
        content: Array.isArray(templateData.content)
          ? templateData.content.map((item: any, index: number) => ({
              ...item,
              id: item.id || `template-${templateId}-${index}-${baseTimestamp}`,
            }))
          : [],
      };

      // Update all state in one batch
      setData(normalizedData);
      setHasUnsavedChanges(true);
      setShowStarter(false);
      setPuckKey(prev => prev + 1); // Force remount AFTER data is set
      toast.success(`Template applied successfully`);
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

  // Memoize normalized data to ensure stable reference and prevent unnecessary re-renders
  const normalizedPuckData = useMemo(() => normalizePuckData(data), [data]);

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

      {data && typeof data === 'object' && data.content && Array.isArray(data.content) && (
        <Puck
          key={puckKey}
          config={careersPageConfig}
          data={normalizedPuckData}
        onPublish={async (newData: PuckData) => {
          try {
            // Validate data before saving
            if (!newData) {
              console.warn('Puck onPublish received undefined data');
              return;
            }

            setData(newData);
            await handleSave(newData);
          } catch (error) {
            console.error('Error in onPublish handler:', error);
            console.error('Received data:', newData);
            toast.error('Failed to save changes');
          }
        }}
        onChange={(newData: PuckData) => {
          try {
            if (!newData) return;
            setData(newData);
            setHasUnsavedChanges(true);
          } catch (error) {
            console.error('Error in onChange handler:', error);
          }
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
