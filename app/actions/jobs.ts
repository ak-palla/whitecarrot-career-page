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

export async function bulkImportJobsFromCSV(companyId: string, csvFilePath: string) {
    const supabase = await createClient();

    try {
        // Download CSV file from storage
        const { data: fileData, error: downloadError } = await supabase.storage
            .from('csv-uploads')
            .download(csvFilePath);

        if (downloadError) {
            return { error: `Failed to download CSV file: ${downloadError.message}` };
        }

        // Convert blob to text
        const csvText = await fileData.text();

        // Parse CSV (using the same utility)
        const { loadJobsFromCSV } = await import('@/lib/utils/csv-loader');
        const mappedJobs = await loadJobsFromCSV(csvText);

        if (mappedJobs.length === 0) {
            return { error: 'No valid jobs found in CSV file' };
        }

        // Transform mapped jobs to database format
        // Include all CSV fields that are now in the schema
        const jobsToInsert = mappedJobs.map((job) => {
            const jobData: any = {
                company_id: companyId,
                title: job.title || 'Untitled Position',
                location: job.location || '',
                job_type: job.job_type || 'full-time',
                description: job.description || `${job.title || 'Position'} at our company`,
                published: false, // Default to draft
            };

            // Add all CSV fields to the job data
            if (job.team) {
                jobData.team = job.team;
            }
            if (job.work_policy) {
                jobData.work_policy = job.work_policy;
            }
            if (job.employment_type) {
                jobData.employment_type = job.employment_type;
            }
            if (job.experience_level) {
                jobData.experience_level = job.experience_level;
            }
            if (job.salary_range) {
                jobData.salary_range = job.salary_range;
            }
            // Use the job_slug from the mapped job if available
            if (job.job_slug) {
                jobData.job_slug = job.job_slug;
            } else if (job.id && !job.id.startsWith('job-')) {
                // If ID is a slug (not generated), use it
                jobData.job_slug = job.id;
            } else {
                // Generate slug from title as fallback
                jobData.job_slug = job.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || null;
            }
            
            return jobData;
        });

        // Insert jobs in batches (Supabase has a limit)
        const batchSize = 100;
        const batches = [];
        for (let i = 0; i < jobsToInsert.length; i += batchSize) {
            batches.push(jobsToInsert.slice(i, i + batchSize));
        }

        let totalInserted = 0;
        const errors: string[] = [];

        for (const batch of batches) {
            const { error: insertError, data } = await supabase
                .from('jobs')
                .insert(batch)
                .select();

            if (insertError) {
                errors.push(`Batch error: ${insertError.message}`);
            } else {
                totalInserted += data?.length || batch.length;
            }
        }

        if (errors.length > 0 && totalInserted === 0) {
            return { error: `Failed to import jobs: ${errors.join(', ')}` };
        }

        return {
            success: true,
            imported: totalInserted,
            total: mappedJobs.length,
            errors: errors.length > 0 ? errors : undefined,
        };
    } catch (error: any) {
        return { error: error.message || 'Failed to import jobs from CSV' };
    }
}
