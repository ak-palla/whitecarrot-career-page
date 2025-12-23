'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { PuckData } from '@/lib/puck/config';

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

export async function savePuckDraft(pageId: string, puckData: PuckData, companySlug: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    const { error } = await supabase
        .from('career_pages')
        .update({
            draft_puck_data: puckData,
            updated_at: new Date().toISOString()
        })
        .eq('id', pageId);

    if (error) return { error: error.message };

    revalidatePath(`/${companySlug}/edit`);
    revalidatePath(`/${companySlug}/preview`);

    return { success: true };
}

export async function publishPuckPage(pageId: string, companySlug: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    // Get the draft data
    const { data: careerPage, error: fetchError } = await supabase
        .from('career_pages')
        .select('draft_puck_data')
        .eq('id', pageId)
        .single();

    if (fetchError) return { error: fetchError.message };
    if (!careerPage) return { error: 'Career page not found' };

    // Copy draft to published
    const { error } = await supabase
        .from('career_pages')
        .update({
            puck_data: careerPage.draft_puck_data,
            // Ensure the page is marked as published so it becomes visible
            published: true,
            updated_at: new Date().toISOString()
        })
        .eq('id', pageId);

    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/484ab544-b3d3-4b34-9f57-5d089fceb6aa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            sessionId: 'debug-session',
            runId: 'pre-fix-1',
            hypothesisId: 'H3',
            location: 'career-page/app/actions/career-pages.ts:70',
            message: 'publishPuckPage update result',
            data: {
                pageId,
                companySlug,
                hasDraftPuckData: !!careerPage.draft_puck_data,
                errorMessage: error?.message ?? null,
            },
            timestamp: Date.now(),
        }),
    }).catch(() => { });
    // #endregion agent log

    if (error) return { error: error.message };

    revalidatePath(`/${companySlug}/careers`);
    revalidatePath(`/${companySlug}/preview`);

    return { success: true };
}
