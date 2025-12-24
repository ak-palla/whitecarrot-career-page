'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
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
