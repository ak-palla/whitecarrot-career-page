'use client';

/**
 * Bulk Actions Component
 * Provides bulk action toolbar for selected jobs
 */

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2 } from 'lucide-react';

interface BulkActionsProps {
  selectedCount: number;
  bulkActionLoading: boolean;
  onBulkPublish: () => void;
  onBulkUnpublish: () => void;
  onBulkDelete: () => void;
  onClearSelection: () => void;
}

export function BulkActions({
  selectedCount,
  bulkActionLoading,
  onBulkPublish,
  onBulkUnpublish,
  onBulkDelete,
  onClearSelection,
}: BulkActionsProps) {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <Card className="p-4 bg-blue-50 border-blue-200">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">
          {selectedCount} {selectedCount === 1 ? 'job' : 'jobs'} selected
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkPublish}
            disabled={bulkActionLoading}
          >
            {bulkActionLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              'Publish Selected'
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkUnpublish}
            disabled={bulkActionLoading}
          >
            {bulkActionLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Unpublishing...
              </>
            ) : (
              'Unpublish Selected'
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkDelete}
            disabled={bulkActionLoading}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            {bulkActionLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            disabled={bulkActionLoading}
          >
            Clear Selection
          </Button>
        </div>
      </div>
    </Card>
  );
}

