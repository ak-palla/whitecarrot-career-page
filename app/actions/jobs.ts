'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const jobSchema = {
    // We'll validate on client mostly or reuse zod schema
};

export async function createJob(companyId: string, data: any) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('jobs')
        .insert({
            company_id: companyId,
            ...data,
            published: false // Default to draft
        });

    if (error) return { error: error.message };

    // Invalidate dashboard or lists?
    // We don't have a path for job list specifically, but company edit page has list.
    return { success: true };
}

export async function updateJob(jobId: string, updates: any) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('jobs')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', jobId);

    if (error) return { error: error.message };
    return { success: true };
}

export async function deleteJob(jobId: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

    if (error) return { error: error.message };
    return { success: true };
}

export async function getJobs(companyId: string) {
    const supabase = await createClient();

    // Owner view - see all
    const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

    if (error) return [];
    return data;
}
