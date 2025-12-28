'use client';

/**
 * Puck Editor Toolbar
 * Contains save, preview, and share actions
 */

import { Eye, Save, Loader2, Share2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface PuckEditorToolbarProps {
  companySlug: string;
  saving: boolean;
  publishing: boolean;
  linkCopied: boolean;
  onSave: () => void;
  onCopyLink: () => void;
}

export function PuckEditorToolbar({
  companySlug,
  saving,
  publishing,
  linkCopied,
  onSave,
  onCopyLink,
}: PuckEditorToolbarProps) {
  return (
    <div className="border-b bg-card p-4 flex items-center justify-end gap-4">
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onSave}
          disabled={saving || publishing}
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
          onClick={onCopyLink}
        >
          {linkCopied ? <Check className="h-4 w-4 mr-2" /> : <Share2 className="h-4 w-4 mr-2" />}
          {linkCopied ? 'Copied!' : 'Share'}
        </Button>
      </div>
    </div>
  );
}

