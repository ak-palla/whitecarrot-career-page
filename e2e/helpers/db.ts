import { createClient } from '@supabase/supabase-js';

/**
 * Database helper functions for E2E tests
 *
 * IMPORTANT: These functions should only be used with a test database
 * Never use these with production data
 */

// Initialize Supabase client for tests
// Using service role key for admin operations (if needed)
let supabase: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (!supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'Missing Supabase credentials. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are set in .env.local'
      );
    }

    supabase = createClient(supabaseUrl, supabaseKey);
  }
  return supabase;
}

/**
 * Clean up test companies created during E2E tests
 * Only deletes companies with slugs starting with 'test-company-'
 */
export async function cleanupTestCompanies(): Promise<void> {
  const client = getSupabaseClient();

  // Only delete test companies (those with slug starting with 'test-company-')
  const { error } = await client
    .from('companies')
    .delete()
    .like('slug', 'test-company-%');

  if (error) {
    console.warn('Error cleaning up test companies:', error);
  }
}

/**
 * Clean up test jobs
 */
export async function cleanupTestJobs(companyId: string): Promise<void> {
  const client = getSupabaseClient();

  const { error } = await client
    .from('jobs')
    .delete()
    .eq('company_id', companyId);

  if (error) {
    console.warn('Error cleaning up test jobs:', error);
  }
}

/**
 * Clean up test sections
 */
export async function cleanupTestSections(careerPageId: string): Promise<void> {
  const client = getSupabaseClient();

  const { error } = await client
    .from('page_sections')
    .delete()
    .eq('career_page_id', careerPageId);

  if (error) {
    console.warn('Error cleaning up test sections:', error);
  }
}

/**
 * Get company by slug
 */
export async function getCompanyBySlug(slug: string) {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from('companies')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.warn('Error fetching company:', error);
    return null;
  }

  return data;
}

/**
 * Get career page for a company
 */
export async function getCareerPageByCompanyId(companyId: string) {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from('career_pages')
    .select('*')
    .eq('company_id', companyId)
    .single();

  if (error) {
    console.warn('Error fetching career page:', error);
    return null;
  }

  return data;
}

/**
 * Clean up all test data for a specific user
 * This is a comprehensive cleanup function
 */
export async function cleanupUserTestData(userId: string): Promise<void> {
  const client = getSupabaseClient();

  // Get all companies owned by this user
  const { data: companies } = await client
    .from('companies')
    .select('id')
    .eq('owner_id', userId)
    .like('slug', 'test-company-%');

  if (companies && companies.length > 0) {
    for (const company of companies as any[]) {
      // Clean up jobs
      await cleanupTestJobs(company.id);

      // Get career page
      const careerPage: any = await getCareerPageByCompanyId(company.id);
      if (careerPage) {
        await cleanupTestSections(careerPage.id);
      }
    }
  }

  // Finally, delete the test companies
  await cleanupTestCompanies();
}
