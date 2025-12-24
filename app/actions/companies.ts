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
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from('companies')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  return data || [];
}

export async function deleteCompany(companyId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/484ab544-b3d3-4b34-9f57-5d089fceb6aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'career-page/app/actions/companies.ts:81',message:'deleteCompany function entered',data:{companyId},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A,B,C,D,E,F,G'})}).catch(()=>{});
  // #endregion

  if (!user) {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/484ab544-b3d3-4b34-9f57-5d089fceb6aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'career-page/app/actions/companies.ts:84',message:'No user found, redirecting to login',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    redirect('/login');
  }

  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/484ab544-b3d3-4b34-9f57-5d089fceb6aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'career-page/app/actions/companies.ts:90',message:'User authenticated, proceeding with verification',data:{userId:user.id},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A,B,C,D,E,F,G'})}).catch(()=>{});
  // #endregion

  // Verify ownership before deleting
  const { data: company, error: fetchError } = await supabase
    .from('companies')
    .select('id, slug')
    .eq('id', companyId)
    .eq('owner_id', user.id)
    .single();

  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/484ab544-b3d3-4b34-9f57-5d089fceb6aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'career-page/app/actions/companies.ts:100',message:'Company verification query result',data:{company:!!company,fetchError:fetchError?.message,companyId,userId:user.id},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'B,D'})}).catch(()=>{});
  // #endregion

  if (fetchError || !company) {
    console.error('Error fetching company for deletion:', fetchError);
    console.error('Company ID:', companyId);
    console.error('User ID:', user.id);
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/484ab544-b3d3-4b34-9f57-5d089fceb6aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'career-page/app/actions/companies.ts:109',message:'Company verification failed, returning error',data:{fetchError:fetchError?.message,companyId,userId:user.id},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'B,D'})}).catch(()=>{});
    // #endregion
    return { error: `Company not found or unauthorized. Details: ${fetchError?.message || 'No company data returned'}` };
  }

  // Get all career pages for this company (includes logo_url and banner_url)
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/484ab544-b3d3-4b34-9f57-5d089fceb6aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'career-page/app/actions/companies.ts:114',message:'Fetching career pages for company',data:{companyId,companySlug:company.slug},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A,C,E,F,G'})}).catch(()=>{});
  // #endregion
  const { data: careerPages } = await supabase
    .from('career_pages')
    .select('id, logo_url, banner_url')
    .eq('company_id', companyId);

  const careerPageIds = careerPages?.map(page => page.id) || [];

  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/484ab544-b3d3-4b34-9f57-5d089fceb6aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'career-page/app/actions/companies.ts:123',message:'Career pages query result',data:{careerPagesCount:careerPages?.length || 0,careerPageIds},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A,C,E,F,G'})}).catch(()=>{});
  // #endregion

  // Delete related records in correct order to avoid foreign key constraints

  // 1. Delete storage files (logos and banners from career_pages)
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/484ab544-b3d3-4b34-9f57-5d089fceb6aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'career-page/app/actions/companies.ts:127',message:'Starting storage file deletion',data:{careerPagesCount:careerPages?.length || 0},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A,E,F'})}).catch(()=>{});
  // #endregion
  try {
    if (careerPages && careerPages.length > 0) {
      for (const page of careerPages) {
        if (page.logo_url) {
          const logoPath = page.logo_url.split('/').pop();
          if (logoPath) {
            // #region agent log
            fetch('http://127.0.0.1:7244/ingest/484ab544-b3d3-4b34-9f57-5d089fceb6aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'career-page/app/actions/companies.ts:135',message:'Deleting logo file',data:{logoPath,fullPath:`${company.slug}/${logoPath}`,pageId:page.id},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A,E,F'})}).catch(()=>{});
            // #endregion
            const { error: logoError } = await supabase.storage
              .from('company-logos')
              .remove([`${company.slug}/${logoPath}`]);

            // #region agent log
            fetch('http://127.0.0.1:7244/ingest/484ab544-b3d3-4b34-9f57-5d089fceb6aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'career-page/app/actions/companies.ts:142',message:'Logo deletion result',data:{logoPath,error:logoError?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A,E,F'})}).catch(()=>{});
            // #endregion

            if (logoError) {
              console.error('Error deleting logo:', logoError);
              // Continue anyway
            }
          }
        }

        if (page.banner_url) {
          const bannerPath = page.banner_url.split('/').pop();
          if (bannerPath) {
            // #region agent log
            fetch('http://127.0.0.1:7244/ingest/484ab544-b3d3-4b34-9f57-5d089fceb6aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'career-page/app/actions/companies.ts:152',message:'Deleting banner file',data:{bannerPath,fullPath:`${company.slug}/${bannerPath}`,pageId:page.id},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A,E,F'})}).catch(()=>{});
            // #endregion
            const { error: bannerError } = await supabase.storage
              .from('company-banners')
              .remove([`${company.slug}/${bannerPath}`]);

            // #region agent log
            fetch('http://127.0.0.1:7244/ingest/484ab544-b3d3-4b34-9f57-5d089fceb6aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'career-page/app/actions/companies.ts:159',message:'Banner deletion result',data:{bannerPath,error:bannerError?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A,E,F'})}).catch(()=>{});
            // #endregion

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
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/484ab544-b3d3-4b34-9f57-5d089fceb6aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'career-page/app/actions/companies.ts:189',message:'Storage cleanup error',data:{error:storageError?.message || String(storageError)},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A,E,F'})}).catch(()=>{});
    // #endregion
  }

  // 2. Delete page_sections (references career_pages)
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/484ab544-b3d3-4b34-9f57-5d089fceb6aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'career-page/app/actions/companies.ts:177',message:'Starting page_sections deletion',data:{careerPageIdsCount:careerPageIds.length},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A,C,E,G'})}).catch(()=>{});
  // #endregion
  if (careerPageIds.length > 0) {
    const { error: sectionsError } = await supabase
      .from('page_sections')
      .delete()
      .in('career_page_id', careerPageIds);

    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/484ab544-b3d3-4b34-9f57-5d089fceb6aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'career-page/app/actions/companies.ts:185',message:'page_sections deletion result',data:{careerPageIds,error:sectionsError?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A,C,E,G'})}).catch(()=>{});
    // #endregion

    if (sectionsError) {
      console.error('Error deleting page_sections:', sectionsError);
      return { error: `Failed to delete page sections: ${sectionsError.message}` };
    }
  }

  // 3. Delete jobs (references companies)
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/484ab544-b3d3-4b34-9f57-5d089fceb6aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'career-page/app/actions/companies.ts:192',message:'Starting jobs deletion',data:{companyId},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A,C,E,G'})}).catch(()=>{});
  // #endregion
  const { error: jobsError } = await supabase
    .from('jobs')
    .delete()
    .eq('company_id', companyId);

  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/484ab544-b3d3-4b34-9f57-5d089fceb6aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'career-page/app/actions/companies.ts:199',message:'jobs deletion result',data:{companyId,error:jobsError?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A,C,E,G'})}).catch(()=>{});
  // #endregion

  if (jobsError) {
    console.error('Error deleting jobs:', jobsError);
    return { error: `Failed to delete jobs: ${jobsError.message}` };
  }

  // 4. Delete career_pages (references companies)
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/484ab544-b3d3-4b34-9f57-5d089fceb6aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'career-page/app/actions/companies.ts:208',message:'Starting career_pages deletion',data:{careerPageIdsCount:careerPageIds.length,careerPageIds},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A,C,E,G'})}).catch(()=>{});
  // #endregion
  if (careerPageIds.length > 0) {
    const { error: pagesError } = await supabase
      .from('career_pages')
      .delete()
      .in('id', careerPageIds);

    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/484ab544-b3d3-4b34-9f57-5d089fceb6aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'career-page/app/actions/companies.ts:216',message:'career_pages deletion result',data:{careerPageIds,error:pagesError?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A,C,E,G'})}).catch(()=>{});
    // #endregion

    if (pagesError) {
      console.error('Error deleting career_pages:', pagesError);
      return { error: `Failed to delete career pages: ${pagesError.message}` };
    }
  }

  // 5. Finally delete the company
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/484ab544-b3d3-4b34-9f57-5d089fceb6aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'career-page/app/actions/companies.ts:255',message:'Starting final company deletion',data:{companyId,userId:user.id},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A,C,E,G'})}).catch(()=>{});
  // #endregion
  const { data: deleteData, error, count } = await supabase
    .from('companies')
    .delete()
    .eq('id', companyId)
    .eq('owner_id', user.id)
    .select();

  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/484ab544-b3d3-4b34-9f57-5d089fceb6aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'career-page/app/actions/companies.ts:264',message:'Final company deletion result',data:{companyId,userId:user.id,error:error?.message,hasError:!!error,errorDetails:error,deleteData,rowsDeleted:deleteData?.length || 0,count},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A,C,E,G'})}).catch(()=>{});
  // #endregion

  if (error) {
    console.error('Error deleting company:', error);
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/484ab544-b3d3-4b34-9f57-5d089fceb6aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'career-page/app/actions/companies.ts:270',message:'Company deletion failed, returning error',data:{companyId,error:error.message},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A,C,E,G'})}).catch(()=>{});
    // #endregion
    return { error: `Failed to delete company: ${error.message}` };
  }

  // Check if any rows were actually deleted (RLS might block silently)
  const rowsDeleted = deleteData?.length || 0;
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/484ab544-b3d3-4b34-9f57-5d089fceb6aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'career-page/app/actions/companies.ts:277',message:'Checking rows deleted count',data:{companyId,rowsDeleted},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'C,G'})}).catch(()=>{});
  // #endregion

  if (rowsDeleted === 0) {
    console.error('Company deletion returned success but 0 rows deleted - likely RLS policy blocking DELETE');
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/484ab544-b3d3-4b34-9f57-5d089fceb6aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'career-page/app/actions/companies.ts:283',message:'CRITICAL: Delete returned 0 rows - RLS likely blocking',data:{companyId,userId:user.id},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'C,G'})}).catch(()=>{});
    // #endregion
    return { error: 'Company deletion failed - no rows deleted. This may be due to Row Level Security (RLS) policies blocking DELETE operations.' };
  }

  // Verify the company was actually deleted
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/484ab544-b3d3-4b34-9f57-5d089fceb6aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'career-page/app/actions/companies.ts:289',message:'Verifying company deletion by checking if it still exists',data:{companyId},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'C,G'})}).catch(()=>{});
  // #endregion
  const { data: verifyCompany, error: verifyError } = await supabase
    .from('companies')
    .select('id')
    .eq('id', companyId)
    .single();

  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/484ab544-b3d3-4b34-9f57-5d089fceb6aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'career-page/app/actions/companies.ts:297',message:'Company verification after deletion',data:{companyId,stillExists:!!verifyCompany,verifyError:verifyError?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'C,G'})}).catch(()=>{});
  // #endregion

  // If company still exists despite deletion, something is wrong
  if (verifyCompany) {
    console.error('Company deletion reported success but company still exists!');
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/484ab544-b3d3-4b34-9f57-5d089fceb6aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'career-page/app/actions/companies.ts:303',message:'CRITICAL: Company deletion inconsistency - success reported but company still exists',data:{companyId,verifyCompany,rowsDeleted},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'C,G'})}).catch(()=>{});
    // #endregion
    return { error: 'Company deletion failed - data inconsistency detected' };
  }

  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/484ab544-b3d3-4b34-9f57-5d089fceb6aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'career-page/app/actions/companies.ts:246',message:'Company deletion successful, revalidating path',data:{companyId},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A,F'})}).catch(()=>{});
  // #endregion

  revalidatePath('/dashboard', 'layout');
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/484ab544-b3d3-4b34-9f57-5d089fceb6aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'career-page/app/actions/companies.ts:251',message:'Returning success from deleteCompany',data:{companyId},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A,F'})}).catch(()=>{});
  // #endregion
  return { success: true };
}
