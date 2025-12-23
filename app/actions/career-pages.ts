'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateCareerPage(pageId: string, updates: any, companySlug: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    // Verify ownership via RLS policies implicitly, or explicit check?
    // RLS "Users can update their own companies" -> wait, RLS on career_pages is "Owners can manage".
    // So update should work if authorized.

    const { error } = await supabase
        .from('career_pages')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', pageId);

    if (error) return { error: error.message };

    revalidatePath(`/${companySlug}/edit`);
    revalidatePath(`/${companySlug}/preview`);
    revalidatePath(`/${companySlug}/careers`);

    return { success: true };
}
