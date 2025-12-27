'use client';
import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

export function ImageUploader({
    label,
    bucket,
    currentImageUrl,
    onUpload
}: {
    label: string,
    bucket: string,
    currentImageUrl?: string,
    onUpload: (url: string | null) => void
}) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
    const [removing, setRemoving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFileName(file.name);
        setUploading(true);
        setError(null);

        try {
            // Basic validation
            if (file.size > 25 * 1024 * 1024) { // 25MB limit
                throw new Error('File size must be less than 25MB');
            }

            if (!file.type.startsWith('image/')) {
                throw new Error('File must be an image');
            }

            const supabase = createClient();
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file);

            if (uploadError) {
                throw new Error(uploadError.message);
            }

            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

            onUpload(publicUrl);
        } catch (err: any) {
            setError(err.message || 'Upload failed');
            setSelectedFileName(null);
            onUpload(null); // Clear any previous valid upload logic if needed, or just let error show
        } finally {
            setUploading(false);
        }
    }

    async function handleRemove() {
        setRemoving(true);
        try {
            // If there's a current image, try to delete it from storage
            if (currentImageUrl) {
                try {
                    const supabase = createClient();
                    // Extract the file path from the URL
                    // URL format: https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
                    // Or: https://[project].supabase.co/storage/v1/object/sign/[bucket]/[path]?...
                    let filePath: string | null = null;
                    
                    // Try to find the bucket name in the URL
                    const urlParts = currentImageUrl.split('/');
                    const bucketIndex = urlParts.findIndex(part => part === bucket);
                    
                    if (bucketIndex !== -1 && bucketIndex < urlParts.length - 1) {
                        // Get everything after the bucket name, but before any query params
                        const pathAfterBucket = urlParts.slice(bucketIndex + 1).join('/');
                        // Remove query parameters if present
                        filePath = pathAfterBucket.split('?')[0];
                    } else {
                        // Fallback: try to extract from public URL pattern
                        const publicIndex = urlParts.findIndex(part => part === 'public');
                        if (publicIndex !== -1 && publicIndex < urlParts.length - 2) {
                            // Bucket should be at publicIndex + 1, path starts at publicIndex + 2
                            if (urlParts[publicIndex + 1] === bucket) {
                                const pathAfterBucket = urlParts.slice(publicIndex + 2).join('/');
                                filePath = pathAfterBucket.split('?')[0];
                            }
                        }
                    }
                    
                    if (filePath) {
                        // Delete from storage
                        const { error: deleteError } = await supabase.storage
                            .from(bucket)
                            .remove([filePath]);
                        
                        if (deleteError) {
                            console.error('Error deleting file from storage:', deleteError);
                        }
                    }
                } catch (err) {
                    // Log error but continue with removal
                    console.error('Error deleting file from storage:', err);
                }
            }
            
            onUpload(null);
            setSelectedFileName(null);
            // Reset the file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } finally {
            setRemoving(false);
        }
    }

    function handleButtonClick() {
        if (currentImageUrl) {
            // If asset exists, remove it
            handleRemove();
        } else {
            // If no asset, trigger file input
            fileInputRef.current?.click();
        }
    }

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <div className="flex items-center gap-4">
                {currentImageUrl ? (
                    <div className="relative">
                        <img src={currentImageUrl} alt="Preview" className="h-16 w-16 object-cover rounded border" />
                    </div>
                ) : (
                    <div className="h-16 w-16 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-400">
                        None
                    </div>
                )}
                <div className="flex-1 max-w-xs space-y-2">
                    <Input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploading}
                        className="hidden"
                    />
                    <Button
                        type="button"
                        onClick={handleButtonClick}
                        disabled={uploading || removing}
                        variant={currentImageUrl ? "destructive" : "default"}
                    >
                        {removing ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Removing...
                            </>
                        ) : currentImageUrl ? (
                            'Remove'
                        ) : (
                            'Upload'
                        )}
                    </Button>
                    {selectedFileName && !error && (
                        <p className="text-xs text-muted-foreground truncate" title={selectedFileName}>
                            {selectedFileName}
                        </p>
                    )}
                    {uploading && <p className="text-xs text-muted-foreground">Uploading...</p>}
                    {removing && <p className="text-xs text-muted-foreground">Removing...</p>}
                    {error && <p className="text-xs text-red-500">{error}</p>}
                    {!error && !uploading && !removing && !selectedFileName && !currentImageUrl && (
                        <p className="text-xs text-muted-foreground">Max 25MB, JPG/PNG/WebP</p>
                    )}
                </div>
            </div>
        </div>
    )
}
