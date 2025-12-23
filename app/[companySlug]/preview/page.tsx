import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { CareerPageRenderer } from '@/components/candidate/career-page-renderer';

export default async function PreviewPage({ params }: { params: Promise<{ companySlug: string }> }) {
    const { companySlug } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        // Preview usually requires auth unless we used a signed token, but for now simple auth check
        redirect('/login');
    }

    // Fetch all necessary data
    const { data: company } = await supabase
        .from('companies')
        .select('*, career_pages(*)')
        .eq('slug', companySlug)
        .single();

    if (!company) notFound();

    // Verify ownership
    if (company.owner_id !== user.id) {
        return <div className="p-8 text-center text-red-500">Unauthorized access to preview.</div>
    }

    const careerPage = company.career_pages?.[0];

    if (!careerPage) {
        return <div>Career page not initialized.</div>
    }

    // Fetch sections (all visible ones, or even hidden ones if we wanted full preview?)
    // Usually preview shows what IS rendered, so respect visibility settings but ignore published status of page
    const { data: sections } = await supabase
        .from('page_sections')
        .select('*')
        .eq('career_page_id', careerPage.id)
        .eq('visible', true)
        .order('order', { ascending: true });

    // Fetch jobs (include unpublished? Maybe preview should show what the public *will* see, so only published jobs?
    // Or maybe show unpublished jobs with a label? Stick to public logic for jobs for now to simulate visitor view)
    const { data: jobs } = await supabase
        .from('jobs')
        .select('*')
        .eq('company_id', company.id)
        .eq('published', true) // Only show published jobs even in preview? Or show drafts? 
        // Let's show drafts too for preview
        // .eq('published', true)
        .order('created_at', { ascending: false });

    return (
        <CareerPageRenderer
            company={company}
            careerPage={careerPage}
            sections={sections || []}
            jobs={jobs || []}
            preview={true}
        />
    );
}
