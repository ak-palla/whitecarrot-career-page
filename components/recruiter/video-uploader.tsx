'use client';
import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

export function VideoUploader({
    label,
    bucket,
    currentVideoUrl,
    onUpload
}: {
    label: string,
    bucket: string,
    currentVideoUrl?: string,
    onUpload: (url: string | null) => void
}) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [validating, setValidating] = useState(false);
    const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
    const [removing, setRemoving] = useState(false);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    async function validateVideoDuration(file: File): Promise<boolean> {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            const url = URL.createObjectURL(file);
            
            video.src = url;
            video.preload = 'metadata';

            const handleLoadedMetadata = () => {
                const duration = video.duration;
                URL.revokeObjectURL(url);
                
                if (isNaN(duration) || duration === Infinity) {
                    // If duration can't be determined, allow upload (server will handle)
                    resolve(true);
                } else if (duration > 60) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            };

            const handleError = () => {
                URL.revokeObjectURL(url);
                // If we can't load metadata, allow upload (server will handle)
                resolve(true);
            };

            video.addEventListener('loadedmetadata', handleLoadedMetadata);
            video.addEventListener('error', handleError);
            
            // Timeout after 5 seconds
            setTimeout(() => {
                URL.revokeObjectURL(url);
                resolve(true); // Allow upload if validation times out
            }, 5000);
        });
    }

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFileName(file.name);
        setUploading(false);
        setValidating(true);
        setError(null);

        // Validate file type
        const validTypes = ['video/mp4', 'video/webm', 'video/ogg'];
        if (!validTypes.includes(file.type)) {
            setError('Invalid file type. Please upload MP4, WebM, or OGG video files.');
            setValidating(false);
            setSelectedFileName(null);
            return;
        }

        // Validate duration
        const isValidDuration = await validateVideoDuration(file);
        setValidating(false);

        if (!isValidDuration) {
            setError('Video duration must be 1 minute or less.');
            setSelectedFileName(null);
            // Reset the file input
            const fileInput = e.target;
            if (fileInput) {
                fileInput.value = '';
            }
            return;
        }

        // Proceed with upload directly to Supabase Storage
        setUploading(true);
        setError(null);

        try {
            const supabase = createClient();
            
            // Validate file size (100MB limit)
            if (file.size > 100 * 1024 * 1024) {
                setError('File size must be less than 100MB');
                setUploading(false);
                setSelectedFileName(null);
                return;
            }

            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload directly to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file);

            if (uploadError) {
                setError(uploadError.message);
                setUploading(false);
                setSelectedFileName(null);
                return;
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

            onUpload(publicUrl);
            // Keep the file name visible after successful upload
        } catch (err: any) {
            setError(err.message || 'Upload failed');
            setSelectedFileName(null);
        } finally {
            setUploading(false);
        }
    }

    async function handleRemove() {
        setRemoving(true);
        try {
            // If there's a current video, try to delete it from storage
            if (currentVideoUrl) {
                try {
                    const supabase = createClient();
                    // Extract the file path from the URL
                    // URL format: https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
                    // Or: https://[project].supabase.co/storage/v1/object/sign/[bucket]/[path]?...
                    let filePath: string | null = null;
                    
                    // Try to find the bucket name in the URL
                    const urlParts = currentVideoUrl.split('/');
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
        if (currentVideoUrl) {
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
                {currentVideoUrl ? (
                    <div className="relative">
                        <video
                            ref={videoRef}
                            src={currentVideoUrl}
                            className="h-20 w-32 object-cover rounded border"
                            preload="metadata"
                            muted
                        />
                    </div>
                ) : (
                    <div className="h-20 w-32 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-400">
                        None
                    </div>
                )}
                <div className="flex-1 max-w-xs space-y-2">
                    <Input
                        ref={fileInputRef}
                        type="file"
                        accept="video/mp4,video/webm,video/ogg"
                        onChange={handleFileChange}
                        disabled={uploading || validating}
                        className="hidden"
                    />
                    <Button
                        type="button"
                        onClick={handleButtonClick}
                        disabled={uploading || validating || removing}
                        variant={currentVideoUrl ? "destructive" : "default"}
                    >
                        {removing ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Removing...
                            </>
                        ) : currentVideoUrl ? (
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
                    {validating && <p className="text-xs text-muted-foreground">Validating video duration...</p>}
                    {uploading && <p className="text-xs text-muted-foreground">Uploading...</p>}
                    {removing && <p className="text-xs text-muted-foreground">Removing...</p>}
                    {error && <p className="text-xs text-red-500">{error}</p>}
                    {!error && !uploading && !validating && !removing && !selectedFileName && !currentVideoUrl && (
                        <p className="text-xs text-muted-foreground">Max 1 minute, 100MB, MP4/WebM/OGG</p>
                    )}
                </div>
            </div>
        </div>
    )
}

