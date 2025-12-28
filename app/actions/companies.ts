'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const createCompanySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
});

export async function createCompany(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const rawData = {
    name: formData.get('name'),
    slug: formData.get('slug'),
  };

  const validation = createCompanySchema.safeParse(rawData);

  if (!validation.success) {
    return { error: 'Invalid data', details: validation.error.flatten() };
  }

  const { data: company, error } = await supabase
    .from('companies')
    .insert({
      ...validation.data,
      owner_id: user.id,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') { // Unique violation
      return { error: 'Company with this slug already exists' };
    }
    return { error: error.message };
  }

  // Also create a default career page for the company
  const { error: pageError } = await supabase
    .from('career_pages')
    .insert({
      company_id: company.id,
      theme: {
        primaryColor: '#000000'
      }
    });

  if (pageError) {
    // Potentially rollback or just log? For now proceed.
    console.error('Failed to create career page', pageError);
  }

  redirect(`/${company.slug}/edit`);
}

export async function getCompanies() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error('Error getting user:', authError);
      return [];
    }

    if (!user) return [];

    // Optimize: Only select needed fields instead of *
    const { data, error } = await supabase
      .from('companies')
      .select('id, name, slug, owner_id, created_at, updated_at, career_pages(logo_url)')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching companies:', error);
      return [];
    }

    // Flatten the logo_url from career_pages array to the company object
    const companiesWithLogo = (data || []).map(company => {
      // Handle both array and single object cases
      const careerPages = Array.isArray(company.career_pages) 
        ? company.career_pages 
        : company.career_pages 
          ? [company.career_pages] 
          : [];
      
      const logoUrl = careerPages[0]?.logo_url || null;
      
      // Remove career_pages from the returned object to keep it clean
      const { career_pages, ...companyData } = company;
      return {
        ...companyData,
        logo_url: logoUrl
      };
    });

    return companiesWithLogo;
  } catch (error) {
    console.error('Error in getCompanies:', error);
    return [];
  }
}

export async function deleteCompany(companyId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Verify ownership before deleting - optimized: only select needed fields
  const { data: company, error: fetchError } = await supabase
    .from('companies')
    .select('id, slug')
    .eq('id', companyId)
    .eq('owner_id', user.id)
    .single();

  if (fetchError || !company) {
    console.error('Error fetching company for deletion:', fetchError);
    console.error('Company ID:', companyId);
    console.error('User ID:', user.id);
    return { error: `Company not found or unauthorized. Details: ${fetchError?.message || 'No company data returned'}` };
  }

  // Get all career pages for this company (includes logo_url and banner_url)
  // Optimized: Only select needed fields
  const { data: careerPages } = await supabase
    .from('career_pages')
    .select('id, logo_url, banner_url')
    .eq('company_id', companyId);

  const careerPageIds = careerPages?.map(page => page.id) || [];

  // Delete related records in correct order to avoid foreign key constraints

  // 1. Delete storage files (logos and banners from career_pages)
  try {
    if (careerPages && careerPages.length > 0) {
      for (const page of careerPages) {
        if (page.logo_url) {
          const logoPath = page.logo_url.split('/').pop();
          if (logoPath) {
            const { error: logoError } = await supabase.storage
              .from('company-logos')
              .remove([`${company.slug}/${logoPath}`]);

            if (logoError) {
              console.error('Error deleting logo:', logoError);
              // Continue anyway
            }
          }
        }

        if (page.banner_url) {
          const bannerPath = page.banner_url.split('/').pop();
          if (bannerPath) {
            const { error: bannerError } = await supabase.storage
              .from('company-banners')
              .remove([`${company.slug}/${bannerPath}`]);

            if (bannerError) {
              console.error('Error deleting banner:', bannerError);
              // Continue anyway
            }
          }
        }
      }
    }
  } catch (storageError: any) {
    console.error('Error cleaning up storage:', storageError);
    // Continue with database deletion
  }

  // 2. Delete page_sections (references career_pages)
  if (careerPageIds.length > 0) {
    const { error: sectionsError } = await supabase
      .from('page_sections')
      .delete()
      .in('career_page_id', careerPageIds);

    if (sectionsError) {
      console.error('Error deleting page_sections:', sectionsError);
      return { error: `Failed to delete page sections: ${sectionsError.message}` };
    }
  }

  // 3. Delete jobs (references companies)
  const { error: jobsError } = await supabase
    .from('jobs')
    .delete()
    .eq('company_id', companyId);

  if (jobsError) {
    console.error('Error deleting jobs:', jobsError);
    return { error: `Failed to delete jobs: ${jobsError.message}` };
  }

  // 4. Delete career_pages (references companies)
  if (careerPageIds.length > 0) {
    const { error: pagesError } = await supabase
      .from('career_pages')
      .delete()
      .in('id', careerPageIds);

    if (pagesError) {
      console.error('Error deleting career_pages:', pagesError);
      return { error: `Failed to delete career pages: ${pagesError.message}` };
    }
  }

  // 5. Finally delete the company
  const { data: deleteData, error } = await supabase
    .from('companies')
    .delete()
    .eq('id', companyId)
    .eq('owner_id', user.id)
    .select();

  if (error) {
    console.error('Error deleting company:', error);
    return { error: `Failed to delete company: ${error.message}` };
  }

  // Check if any rows were actually deleted (RLS might block silently)
  const rowsDeleted = deleteData?.length || 0;
  if (rowsDeleted === 0) {
    console.error('Company deletion returned success but 0 rows deleted - likely RLS policy blocking DELETE');
    return { error: 'Company deletion failed - no rows deleted. This may be due to Row Level Security (RLS) policies blocking DELETE operations.' };
  }

  revalidatePath('/dashboard', 'layout');
  return { success: true };
}
