'use server';
import { createClient } from '@/lib/supabase/server';

export async function uploadImage(formData: FormData, bucket: string) {
    const supabase = await createClient();
    const file = formData.get('file') as File;

    if (!file) return { error: 'No file uploaded' };

    // Basic validation
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        return { error: 'File size must be less than 5MB' };
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

    if (uploadError) {
        return { error: uploadError.message };
    }

    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

    return { url: publicUrl };
}

export async function uploadVideo(formData: FormData, bucket: string) {
    const supabase = await createClient();
    const file = formData.get('file') as File;

    if (!file) return { error: 'No file uploaded' };

    // Validate file type
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    if (!validTypes.includes(file.type)) {
        return { error: 'Invalid file type. Please upload MP4, WebM, or OGG video files.' };
    }

    // File size limit (100MB)
    if (file.size > 100 * 1024 * 1024) {
        return { error: 'File size must be less than 100MB' };
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

    if (uploadError) {
        return { error: uploadError.message };
    }

    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

    return { url: publicUrl };
}
