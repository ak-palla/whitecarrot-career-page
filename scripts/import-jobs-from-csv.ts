/**
 * Script to import jobs from CSV file directly
 * Usage: npx tsx scripts/import-jobs-from-csv.ts <companyId> <csvFilePath>
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { loadJobsFromCSV } from '../lib/utils/csv-loader';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL');
  console.error('  SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function importJobsFromCSV(companyId: string, csvFilePath: string) {
  try {
    console.log(`Reading CSV file: ${csvFilePath}`);
    const csvText = readFileSync(csvFilePath, 'utf-8');

    console.log('Parsing CSV...');
    const mappedJobs = await loadJobsFromCSV(csvText);

    if (mappedJobs.length === 0) {
      console.error('No valid jobs found in CSV file');
      return;
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

    // Insert jobs in batches (Supabase has a limit of 1000 rows per insert)
    const batchSize = 100;
    const batches = [];
    for (let i = 0; i < jobsToInsert.length; i += batchSize) {
      batches.push(jobsToInsert.slice(i, i + batchSize));
    }

    console.log(`Inserting ${jobsToInsert.length} jobs in ${batches.length} batch(es)...`);

    let totalInserted = 0;
    const errors: string[] = [];

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`  Inserting batch ${i + 1}/${batches.length} (${batch.length} jobs)...`);

      const { error: insertError, data } = await supabase
        .from('jobs')
        .insert(batch)
        .select('id');

      if (insertError) {
        const errorMsg = `Batch ${i + 1} error: ${insertError.message}`;
        errors.push(errorMsg);
        console.error(`  ❌ ${errorMsg}`);
      } else {
        totalInserted += data?.length || batch.length;
        console.log(`  ✅ Inserted ${data?.length || batch.length} jobs`);
      }
    }

    if (errors.length > 0 && totalInserted === 0) {
      console.error('\n❌ Failed to import jobs:');
      errors.forEach((error) => console.error(`  - ${error}`));
      process.exit(1);
    }

    console.log(`\n✅ Successfully imported ${totalInserted} out of ${mappedJobs.length} jobs`);
    if (errors.length > 0) {
      console.warn(`⚠️  ${errors.length} batch(es) had errors:`);
      errors.forEach((error) => console.warn(`  - ${error}`));
    }

    // Verify the import
    const { count } = await supabase
      .from('jobs')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('published', true);

    console.log(`\n📊 Total published jobs for company: ${count || 0}`);
  } catch (error: any) {
    console.error('Error importing jobs:', error);
    process.exit(1);
  }
}

// Main execution
const args = process.argv.slice(2);

if (args.length < 1) {
  console.error('Usage: npx tsx scripts/import-jobs-from-csv.ts <companyId> [csvFilePath]');
  console.error('');
  console.error('Arguments:');
  console.error('  companyId    - The ID of the company to import jobs for');
  console.error('  csvFilePath  - Path to CSV file (default: docs/jobs_apstic.csv)');
  process.exit(1);
}

const companyId = args[0];
const csvFilePath = args[1] || join(process.cwd(), '..', 'docs', 'jobs_apstic.csv');

console.log('🚀 Starting job import...');
console.log(`   Company ID: ${companyId}`);
console.log(`   CSV File: ${csvFilePath}`);
console.log('');

importJobsFromCSV(companyId, csvFilePath);

