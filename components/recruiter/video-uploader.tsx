'use client';
import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

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
    const videoRef = useRef<HTMLVideoElement | null>(null);

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

        setUploading(false);
        setValidating(true);
        setError(null);

        // Validate file type
        const validTypes = ['video/mp4', 'video/webm', 'video/ogg'];
        if (!validTypes.includes(file.type)) {
            setError('Invalid file type. Please upload MP4, WebM, or OGG video files.');
            setValidating(false);
            return;
        }

        // Validate duration
        const isValidDuration = await validateVideoDuration(file);
        setValidating(false);

        if (!isValidDuration) {
            setError('Video duration must be 1 minute or less.');
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
                return;
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

            onUpload(publicUrl);
        } catch (err: any) {
            setError(err.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    }

    function handleRemove() {
        onUpload(null);
        // Reset the file input
        const fileInput = document.querySelector(`input[type="file"][data-uploader="${label}"]`) as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    }

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <div className="flex items-center gap-4">
                {currentVideoUrl ? (
                    <div className="relative group">
                        <video
                            ref={videoRef}
                            src={currentVideoUrl}
                            className="h-20 w-32 object-cover rounded border"
                            preload="metadata"
                            muted
                        />
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-sm transition-colors"
                            title="Remove video"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                ) : (
                    <div className="h-20 w-32 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-400">
                        None
                    </div>
                )}
                <div className="flex-1 max-w-xs">
                    <Input
                        type="file"
                        accept="video/mp4,video/webm,video/ogg"
                        onChange={handleFileChange}
                        disabled={uploading || validating}
                        data-uploader={label}
                    />
                    {validating && <p className="text-xs text-muted-foreground mt-1">Validating video duration...</p>}
                    {uploading && <p className="text-xs text-muted-foreground mt-1">Uploading...</p>}
                    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                    {!error && !uploading && !validating && (
                        <p className="text-xs text-muted-foreground mt-1">Max 1 minute, MP4/WebM/OGG</p>
                    )}
                </div>
            </div>
        </div>
    )
}

