'use client';

import type { CSSProperties } from 'react';
import { useState } from 'react';
import { Puck } from '@measured/puck';
import { careersPageConfig, PuckData } from '@/lib/puck/config';
import '@measured/puck/puck.css';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface PuckEditorProps {
  careerPage: any;
  companySlug: string;
  onSave?: (data: PuckData) => Promise<void>;
  onPublish?: (data: PuckData) => Promise<void>;
}

export function PuckEditor({ careerPage, companySlug, onSave, onPublish }: PuckEditorProps) {
  const [data, setData] = useState<PuckData>(
    careerPage.draft_puck_data || { content: [], root: { props: {} } }
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showStarter, setShowStarter] = useState(
    !careerPage.draft_puck_data ||
      !careerPage.draft_puck_data.content ||
      careerPage.draft_puck_data.content.length === 0
  );

  // Apply theme styles
  const theme = careerPage?.theme || {};
  const themeStyle = {
    '--primary': theme.primaryColor || '#000000',
    '--secondary': theme.secondaryColor || '#ffffff',
  } as CSSProperties;

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

  const applyRecommendedLayout = () => {
    const recommended: PuckData = {
      root: { props: {} },
      content: [
        {
          type: 'HeroSection',
          props: {
            title: `${careerPage.company_name || 'Your company'} careers`,
            subtitle: 'Tell candidates why they should join your team.',
            primaryCtaLabel: 'View open roles',
            primaryCtaHref: '#jobs',
          },
        },
        {
          type: 'AboutSection',
          props: {
            heading: 'About the company',
            body: 'Share your mission, vision, and what makes your team unique.',
          },
        },
        {
          type: 'BenefitsSection',
          props: {
            heading: 'Benefits & perks',
            benefits: [
              { title: 'Competitive salary', description: 'Pay at or above market for great talent.' },
              { title: 'Flexible work', description: 'Remote-friendly with flexible hours.' },
            ],
          },
        },
        {
          type: 'JobsSection',
          props: {
            heading: 'Open positions',
            layout: 'cards',
            emptyStateMessage: 'No open positions at the moment. Check back soon!',
          },
        },
      ],
    };
    setData(recommended);
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

      {showStarter && (!data.content || data.content.length === 0) && (
        <div className="absolute inset-x-4 top-20 z-40 mx-auto max-w-xl rounded-lg border bg-background/95 p-4 shadow-lg">
          <h3 className="text-sm font-semibold">Choose how to start</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Start from a recommended layout or a blank page. You can customize every section later.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" onClick={applyRecommendedLayout}>
              Use recommended layout
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setData({ root: { props: {} }, content: [] });
                setHasUnsavedChanges(true);
                setShowStarter(false);
              }}
            >
              Start from blank page
            </Button>
          </div>
        </div>
      )}

      <Puck
        config={careersPageConfig}
        data={data}
        onPublish={async (newData: PuckData) => {
          // Treat Puck's built-in "Publish" as "Save draft"
          setData(newData);
          await handleSave(newData);
        }}
        onChange={(newData: PuckData) => {
          setData(newData);
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
    </div>
  );
}
