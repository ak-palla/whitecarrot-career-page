'use server';

import { createClient } from '@/lib/supabase/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { loadJobsFromCSV } from '@/lib/utils/csv-loader';

/**
 * Import jobs directly from a CSV file path
 * This is useful for importing the jobs_apstic.csv file
 */
export async function importJobsFromCSVFile(companyId: string, csvFilePath?: string) {
    const supabase = await createClient();

    try {
        // Default to the jobs_apstic.csv file in docs folder
        // Try multiple possible paths
        let defaultPath: string;
        if (csvFilePath) {
            defaultPath = csvFilePath;
        } else {
            // Try relative to project root (career-page/)
            const path1 = join(process.cwd(), '..', 'docs', 'jobs_apstic.csv');
            // Try relative to workspace root
            const path2 = join(process.cwd(), '..', '..', 'docs', 'jobs_apstic.csv');
            // Try absolute from career-page
            const path3 = join(process.cwd(), 'docs', 'jobs_apstic.csv');
            
            // Use the first path that exists, or default to path1
            defaultPath = existsSync(path1) ? path1 : 
                         existsSync(path2) ? path2 : 
                         existsSync(path3) ? path3 : path1;
        }
        
        console.log(`Reading CSV file: ${defaultPath}`);
        const csvText = readFileSync(defaultPath, 'utf-8');

        console.log('Parsing CSV...');
        const mappedJobs = await loadJobsFromCSV(csvText);

        if (mappedJobs.length === 0) {
            return { error: 'No valid jobs found in CSV file' };
        }

        console.log(`Found ${mappedJobs.length} jobs to import`);

        // Transform mapped jobs to database format
        const jobsToInsert = mappedJobs.map((job) => {
            const jobData: any = {
                company_id: companyId,
                title: job.title || 'Untitled Position',
                location: job.location || '',
                job_type: job.job_type || 'full-time',
                description: job.description || `${job.title || 'Position'} at our company`,
                published: true, // Publish all imported jobs
            };

            // Add all CSV fields
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
            if (job.job_slug) {
                jobData.job_slug = job.job_slug;
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

        // Verify the insert
        const { count } = await supabase
            .from('jobs')
            .select('id', { count: 'exact', head: true })
            .eq('company_id', companyId)
            .eq('published', true);

        return {
            success: true,
            imported: totalInserted,
            total: mappedJobs.length,
            totalPublished: count || 0,
            errors: errors.length > 0 ? errors : undefined,
        };
    } catch (error: any) {
        return { error: error.message || 'Failed to import jobs from CSV file' };
    }
}

