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
