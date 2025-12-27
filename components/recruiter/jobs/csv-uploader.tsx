'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Upload, FileText, X } from 'lucide-react';
import { toast } from 'sonner';

interface CSVUploaderProps {
  onUploadComplete: (fileUrl: string, fileName: string) => void;
  onError?: (error: string) => void;
}

export function CSVUploader({ onUploadComplete, onError }: CSVUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/csv'];
    const validExtensions = ['.csv'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      setError('Please upload a CSV file (.csv)');
      setSelectedFile(null);
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      setSelectedFile(null);
      return;
    }

    setError(null);
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Generate unique filename
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `jobs_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = fileName;

      // Upload to Supabase Storage
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('csv-uploads')
        .upload(filePath, selectedFile, {
          contentType: 'text/csv',
          upsert: false
        });

      if (uploadError) {
        throw new Error(uploadError.message || 'Failed to upload CSV file');
      }

      // Get the file URL (for private buckets, we'll use the path)
      // For now, we'll return the path and handle download server-side
      const fileUrl = filePath;
      
      toast.success('CSV file uploaded successfully!');
      onUploadComplete(fileUrl, selectedFile.name);
      setSelectedFile(null);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Upload failed. Please try again.';
      setError(errorMessage);
      onError?.(errorMessage);
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="csv-upload">Upload CSV File</Label>
        <div className="flex items-center gap-2">
          <Input
            id="csv-upload"
            type="file"
            accept=".csv,text/csv,application/vnd.ms-excel"
            onChange={handleFileSelect}
            ref={fileInputRef}
            disabled={uploading}
            className="cursor-pointer"
          />
          {selectedFile && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={uploading}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {selectedFile && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>{selectedFile.name}</span>
            <span className="text-xs">({(selectedFile.size / 1024).toFixed(2)} KB)</span>
          </div>
        )}
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Maximum file size: 10MB. Supported format: CSV (.csv)
        </p>
      </div>

      {selectedFile && (
        <Button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload CSV
            </>
          )}
        </Button>
      )}
    </div>
  );
}

