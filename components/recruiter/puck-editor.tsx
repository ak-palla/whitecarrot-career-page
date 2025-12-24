'use client';

import { Puck, type Data } from '@measured/puck';
import '@measured/puck/puck.css';
import { useState, useCallback, useEffect } from 'react';
import { careersPageConfig, type PuckData } from '@/lib/puck/config';
import { savePuckDraft, publishPuckPage } from '@/app/actions/career-pages';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Eye, Save, Loader2, Share2, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { normalizePuckData } from '@/lib/puck/utils';
import { applyTemplate } from '@/lib/puck/templates';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function PuckEditor({ 
  careerPage, 
  companySlug 
}: { 
  careerPage: any; 
  companySlug: string;
}) {
  const [data, setData] = useState<any>(() => {
    try {
      const draftData = careerPage?.draft_puck_data;

      // If no data, return empty Puck format (ARRAY-based)
      if (!draftData || typeof draftData !== 'object') {
        const emptyData = { content: [], root: { props: {} } };
        console.log('PuckEditor: No draft data, using empty format', emptyData);
        return emptyData;
      }

      // Normalize and ensure array format
      const normalized = normalizePuckData(draftData as any);
      console.log('PuckEditor: Normalized data', normalized);
      return normalized;
    } catch (error) {
      console.error('Error initializing Puck data:', error, careerPage?.draft_puck_data);
      return { content: [], root: { props: {} } };
    }
  });
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [linkCopied, setLinkCopied] = useState(false);

  const hasContent = Array.isArray(data.content) && data.content.length > 0;

  const handleChange = useCallback((newData: Data<any>) => {
    setData(newData);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await savePuckDraft(careerPage.id, data, companySlug);
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

  const handleTemplateSelect = (templateId: string) => {
    if (hasContent) {
      setSelectedTemplate(templateId);
      setTemplateDialogOpen(true);
    } else {
      applyTemplateDirectly(templateId);
    }
  };

  const applyTemplateDirectly = (templateId: string) => {
    try {
      if (templateId === 'blank') {
        setData({ content: [], root: { props: {} } });
        setTemplateDialogOpen(false);
        setSelectedTemplate('');
        toast.success('Blank page loaded');
      } else {
        const templateData = applyTemplate(templateId);
        setData(templateData);
        setTemplateDialogOpen(false);
        setSelectedTemplate('');
        toast.success('Template applied');
      }
    } catch (error) {
      toast.error('Failed to apply template');
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

  // Auto-save on changes (debounced) - disabled for now to avoid conflicts
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     if (hasContent && !saving && !publishing) {
  //       handleSave();
  //     }
  //   }, 2000);

  //   return () => clearTimeout(timer);
  // }, [data]);

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="border-b bg-card p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Page Builder</h2>
          <Select value="" onValueChange={handleTemplateSelect}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Choose Template" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="modern-minimal">Prebuilt Template</SelectItem>
              <SelectItem value="blank">Blank Page</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Draft
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <Link href={`/${companySlug}/preview`} target="_blank">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
          >
            {linkCopied ? <Check className="h-4 w-4 mr-2" /> : <Share2 className="h-4 w-4 mr-2" />}
            {linkCopied ? 'Copied!' : 'Share'}
          </Button>
          <Button
            onClick={handlePublish}
            disabled={publishing}
            size="sm"
          >
            {publishing ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : 'Publish'}
          </Button>
        </div>
      </div>

      {/* Puck Editor */}
      <div className="flex-1 overflow-hidden">
        {data && typeof data === 'object' && Array.isArray(data.content) ? (
          <Puck
            config={careersPageConfig}
            data={data}
            onChange={handleChange}
            onPublish={handlePublish}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-muted-foreground">Loading editor...</p>
            </div>
          </div>
        )}
      </div>

      {/* Template Confirmation Dialog */}
      <AlertDialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace Current Content?</AlertDialogTitle>
            <AlertDialogDescription>
              Applying a template will replace your current page content. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setTemplateDialogOpen(false);
              setSelectedTemplate('');
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (selectedTemplate) {
                applyTemplateDirectly(selectedTemplate);
              }
            }}>
              Replace Content
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

