'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const jobSchema = {
    // We'll validate on client mostly or reuse zod schema
};

export async function createJob(companyId: string, data: any) {
    const supabase = await createClient();

    // Optimize: Only select id on insert to reduce response size
    const { data: job, error } = await supabase
        .from('jobs')
        .insert({
            company_id: companyId,
            ...data,
            published: false // Default to draft
        })
        .select('id')
        .single();

    if (error) return { error: error.message };

    // Invalidate dashboard or lists?
    // We don't have a path for job list specifically, but company edit page has list.
    return { success: true, id: job?.id };
}

export async function updateJob(jobId: string, updates: any) {
    const supabase = await createClient();

    // Optimize: Only select id on update to reduce response size
    const { error } = await supabase
        .from('jobs')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', jobId)
        .select('id')
        .single();

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

export interface GetJobsOptions {
    limit?: number;
    offset?: number;
    published?: boolean;
}

export async function getJobs(companyId: string, options?: GetJobsOptions) {
    const supabase = await createClient();

    // Optimize: Only select needed fields instead of *
    // Select all job fields but be explicit for clarity
    let query = supabase
        .from('jobs')
        .select('id, company_id, title, description, location, job_type, published, created_at, updated_at, team, work_policy, employment_type, experience_level, salary_range, job_slug, expires_at, currency')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

    // Apply published filter if specified
    if (options?.published !== undefined) {
        query = query.eq('published', options.published);
    }

    // Apply pagination if specified
    if (options?.limit) {
        query = query.limit(options.limit);
    }
    if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 100) - 1);
    }

    const { data, error } = await query;

    if (error) return [];
    return data;
}

export async function bulkUpdateJobsPublished(jobIds: string[], published: boolean) {
    const supabase = await createClient();

    if (jobIds.length === 0) {
        return { error: 'No jobs selected' };
    }

    const { error } = await supabase
        .from('jobs')
        .update({ 
            published,
            updated_at: new Date().toISOString()
        })
        .in('id', jobIds);

    if (error) return { error: error.message };
    return { success: true, updated: jobIds.length };
}

export async function bulkDeleteJobs(jobIds: string[]) {
    const supabase = await createClient();

    if (jobIds.length === 0) {
        return { error: 'No jobs selected' };
    }

    const { error } = await supabase
        .from('jobs')
        .delete()
        .in('id', jobIds);

    if (error) return { error: error.message };
    return { success: true, deleted: jobIds.length };
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
            // Optimize: Only select id on insert to reduce response size
            const { error: insertError, data } = await supabase
                .from('jobs')
                .insert(batch)
                .select('id');

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
