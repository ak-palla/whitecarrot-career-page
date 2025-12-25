'use client';
import { useState } from 'react';
import { uploadImage } from '@/app/actions/upload';
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

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        const result = await uploadImage(formData, bucket);

        if (result.error) {
            setError(result.error);
        } else if (result.url) {
            onUpload(result.url);
        }
        setUploading(false);
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
                <div className="flex-1">
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploading}
                        data-uploader={label}
                    />
                    {uploading && <p className="text-xs text-muted-foreground mt-1">Uploading...</p>}
                    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                </div>
            </div>
        </div>
    )
}
