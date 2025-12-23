import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { CareerPageRenderer } from '@/components/candidate/career-page-renderer';
import { PuckRenderer } from '@/components/candidate/puck-renderer';

export default async function PreviewPage({ params }: { params: Promise<{ companySlug: string }> }) {
    const { companySlug } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/484ab544-b3d3-4b34-9f57-5d089fceb6aa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            sessionId: 'debug-session',
            runId: 'pre-fix-1',
            hypothesisId: 'H2',
            location: 'career-page/app/[companySlug]/preview/page.tsx:6',
            message: 'PreviewPage entry',
            data: { companySlug, hasUser: !!user },
            timestamp: Date.now(),
        }),
    }).catch(() => { });
    // #endregion agent log

    if (!user) {
        // Preview requires auth for now
        redirect('/login');
    }

    // Fetch company with joined career_pages
    const { data: company } = await supabase
        .from('companies')
        .select('*, career_pages(*)')
        .eq('slug', companySlug)
        .single();

    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/484ab544-b3d3-4b34-9f57-5d089fceb6aa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            sessionId: 'debug-session',
            runId: 'pre-fix-1',
            hypothesisId: 'H2',
            location: 'career-page/app/[companySlug]/preview/page.tsx:16',
            message: 'PreviewPage company fetch result',
            data: {
                companyExists: !!company,
                companyId: company?.id ?? null,
                companyName: company?.name ?? null,
                careerPagesCount: Array.isArray(company?.career_pages) ? company.career_pages.length : null,
            },
            timestamp: Date.now(),
        }),
    }).catch(() => { });
    // #endregion agent log
    if (!company) notFound();

    // Verify ownership
    if (company.owner_id !== user.id) {
        return <div className="p-8 text-center text-red-500">Unauthorized access to preview.</div>
    }

    // Ensure we always have a career_page, mirroring the logic in /[companySlug]/edit
    let careerPage = company.career_pages?.[0];

    if (!careerPage) {
        const { data: existingPage } = await supabase
            .from('career_pages')
            .select('*')
            .eq('company_id', company.id)
            .single();

        careerPage = existingPage;
    }

    if (!careerPage) {
        const { data: newPage, error: pageError } = await supabase
            .from('career_pages')
            .insert({
                company_id: company.id,
                theme: {
                    primaryColor: '#000000',
                    secondaryColor: '#ffffff',
                    accentColor: '#3b82f6'
                },
                published: false
            })
            .select()
            .single();

        if (pageError) {
            console.error('Error creating career page in preview:', pageError);
        } else {
            careerPage = newPage;
        }
    }

    if (!careerPage) {
        // Last-resort fallback – shouldn't normally happen
        return <div>Career page not initialized.</div>;
    }

    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/484ab544-b3d3-4b34-9f57-5d089fceb6aa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            sessionId: 'debug-session',
            runId: 'pre-fix-1',
            hypothesisId: 'H2',
            location: 'career-page/app/[companySlug]/preview/page.tsx:65',
            message: 'PreviewPage resolved careerPage',
            data: {
                companyId: company.id,
                careerPageId: careerPage.id,
                hasDraftPuckData: !!careerPage.draft_puck_data,
                hasPuckData: !!careerPage.puck_data,
            },
            timestamp: Date.now(),
        }),
    }).catch(() => { });
    // #endregion agent log

    // Fetch visible sections for backward compatibility (used only if no Puck data)
    const { data: sections } = await supabase
        .from('page_sections')
        .select('*')
        .eq('career_page_id', careerPage.id)
        .eq('visible', true)
        .order('order', { ascending: true });

    // For preview we stick to the same jobs visibility as public careers page (published only)
    const { data: jobs } = await supabase
        .from('jobs')
        .select('*')
        .eq('company_id', company.id)
        .eq('published', true)
        .order('created_at', { ascending: false });

    const hasDraftPuck = !!careerPage.draft_puck_data;

    return hasDraftPuck ? (
        <PuckRenderer data={careerPage.draft_puck_data} theme={careerPage.theme} jobs={jobs || []} />
    ) : (
        <CareerPageRenderer
            company={company}
            careerPage={careerPage}
            sections={sections || []}
            jobs={jobs || []}
            preview={true}
        />
    );
}

