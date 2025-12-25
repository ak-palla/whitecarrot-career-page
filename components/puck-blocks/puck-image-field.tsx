'use client';

import { ImageUploader } from '@/components/recruiter/image-uploader';
import { Label } from '@/components/ui/label';

interface PuckImageFieldProps {
    value?: string;
    onChange: (value: string | undefined) => void;
    label: string;
    className?: string;
}

export function PuckImageField({ value, onChange, label, className }: PuckImageFieldProps) {
    // Using a bucket for team member profile photos and other page assets
    // This bucket should be created in Supabase Storage with public read access
    const BUCKET_NAME = 'team-photos';

    return (
        <div className={`mb-4 ${className || ''}`}>
            <ImageUploader
                label={label}
                bucket={BUCKET_NAME}
                currentImageUrl={value}
                onUpload={(url) => {
                    onChange(url || undefined);
                }}
            />
        </div>
    );
}
