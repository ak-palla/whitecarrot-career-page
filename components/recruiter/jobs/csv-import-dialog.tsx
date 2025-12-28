'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CSVUploader } from './csv-uploader';
import { bulkImportJobsFromCSV } from '@/app/actions/jobs';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface CSVImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  onImportComplete: () => void | Promise<void>;
}

export function CSVImportDialog({
  open,
  onOpenChange,
  companyId,
  onImportComplete,
}: CSVImportDialogProps) {
  const [uploadedFilePath, setUploadedFilePath] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    imported?: number;
    total?: number;
    error?: string;
  } | null>(null);

  const handleUploadComplete = (filePath: string, fileName: string) => {
    setUploadedFilePath(filePath);
    setUploadedFileName(fileName);
    setImportResult(null);
  };

  const handleImport = async () => {
    if (!uploadedFilePath) return;

    setImporting(true);
    setImportResult(null);

    try {
      const result = await bulkImportJobsFromCSV(companyId, uploadedFilePath);

      if (result.error) {
        setImportResult({
          success: false,
          error: result.error,
        });
        toast.error(result.error);
      } else {
        setImportResult({
          success: true,
          imported: result.imported,
          total: result.total,
        });
        toast.success(`Successfully imported ${result.imported} jobs!`);
        
        // Call callback to refresh job list
        await onImportComplete();
        
        // Close dialog after a short delay
        setTimeout(() => {
          handleClose();
        }, 2000);
      }
    } catch (error: any) {
      setImportResult({
        success: false,
        error: error.message || 'Failed to import jobs',
      });
      toast.error('Failed to import jobs');
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setUploadedFilePath(null);
    setUploadedFileName(null);
    setImportResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import Jobs from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file to bulk import jobs. The CSV should have columns: title, location, department, job_type, etc.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <CSVUploader
            onUploadComplete={handleUploadComplete}
            onError={(error) => {
              toast.error(error);
            }}
          />

          {uploadedFileName && !importResult && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Ready to import:</p>
              <p className="text-sm text-muted-foreground">{uploadedFileName}</p>
            </div>
          )}

          {importResult && (
            <div className={`p-4 rounded-lg ${
              importResult.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-start gap-3">
                {importResult.success ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  {importResult.success ? (
                    <div>
                      <p className="text-sm font-medium text-green-900">
                        Import completed successfully!
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        Imported {importResult.imported} of {importResult.total} jobs.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-red-900">
                        Import failed
                      </p>
                      <p className="text-sm text-red-700 mt-1">
                        {importResult.error}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={importing}>
            {importResult?.success ? 'Close' : 'Cancel'}
          </Button>
          {uploadedFilePath && !importResult?.success && (
            <Button onClick={handleImport} disabled={importing}>
              {importing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                'Import Jobs'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

