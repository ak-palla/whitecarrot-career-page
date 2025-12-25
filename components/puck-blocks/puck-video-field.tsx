'use client';

import { VideoUploader } from '@/components/recruiter/video-uploader';
import { Label } from '@/components/ui/label';

interface PuckVideoFieldProps {
    value?: string;
    onChange: (value: string | undefined) => void;
    label: string;
    className?: string;
}

export function PuckVideoField({ value, onChange, label, className }: PuckVideoFieldProps) {
    // Using a bucket for video uploads
    // This bucket should be created in Supabase Storage with public read access
    const BUCKET_NAME = 'videos';

    return (
        <div className={`mb-4 ${className || ''}`}>
            <VideoUploader
                label={label}
                bucket={BUCKET_NAME}
                currentVideoUrl={value}
                onUpload={(url) => {
                    onChange(url || undefined);
                }}
            />
        </div>
    );
}

