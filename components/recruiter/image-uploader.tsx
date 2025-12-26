'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

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

    function handleRemove() {
        onUpload(null);
        setSelectedFileName(null);
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
                {currentImageUrl ? (
                    <div className="relative group">
                        <img src={currentImageUrl} alt="Preview" className="h-16 w-16 object-cover rounded border" />
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-sm transition-colors"
                            title="Remove image"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                ) : (
                    <div className="h-16 w-16 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-400">
                        None
                    </div>
                )}
                <div className="flex-1 max-w-xs">
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploading}
                        data-uploader={label}
                    />
                    {selectedFileName && !error && (
                        <p className="text-xs text-muted-foreground mt-1 truncate" title={selectedFileName}>
                            {selectedFileName}
                        </p>
                    )}
                    {uploading && <p className="text-xs text-muted-foreground mt-1">Uploading...</p>}
                    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                </div>
            </div>
        </div>
    )
}
