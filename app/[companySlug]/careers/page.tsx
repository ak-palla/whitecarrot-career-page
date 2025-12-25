import { createClient } from '@/lib/supabase/server';
import { CareerPageRenderer } from '@/components/candidate/career-page-renderer';
import { PuckRenderer } from '@/components/candidate/puck-renderer';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ companySlug: string }> }) {
    const { companySlug } = await params;
    const supabase = await createClient();

    // Simple fetch for metadata
    const { data: company } = await supabase
        .from('companies')
        .select('name, career_pages(banner_url)')
        .eq('slug', companySlug)
        .single();

    if (!company) return {};

    return {
        title: `Careers at ${company.name}`,
        description: `Join our team at ${company.name}. Browse available jobs and apply today.`,
        openGraph: {
            title: `Careers at ${company.name}`,
            description: `Join our team at ${company.name}.`,
            images: company.career_pages?.[0]?.banner_url ? [company.career_pages[0].banner_url] : [],
        }
    };
}

export default async function CareersPage({ params }: { params: Promise<{ companySlug: string }> }) {
    const { companySlug } = await params;
    const supabase = await createClient();

    // Fetch all necessary data
    const { data: company } = await supabase
        .from('companies')
        .select('*, career_pages(*)')
        .eq('slug', companySlug)
        .single();


    if (!company) {
        // Instead of triggering a Next.js 404, render a friendly message.
        // This avoids the generic 404 page when data is misconfigured.
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-600">
                    Company profile for <span className="font-semibold">{companySlug}</span> is not available.
                </p>
            </div>
        );
    }

    let careerPage = company.career_pages?.[0];

    // If the joined relation didn't return anything (likely due to RLS on the relation),
    // fall back to an explicit query like the preview/edit pages do.
    if (!careerPage) {
        const { data: existingPage } = await supabase
            .from('career_pages')
            .select('*')
            .eq('company_id', company.id)
            .single();

        careerPage = existingPage;
    }

    // If there is still no career page at all, render a soft error instead of a 404.
    if (!careerPage) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-600">
                    Career page has not been set up yet for <span className="font-semibold">{company.name}</span>.
                </p>
            </div>
        );
    }

    // Fetch sections (for legacy fallback)
    const { data: sections } = await supabase
        .from('page_sections')
        .select('*')
        .eq('career_page_id', careerPage.id)
        .eq('visible', true)
        .order('order', { ascending: true });

    // Fetch published jobs
    const { data: jobs } = await supabase
        .from('jobs')
        .select('*')
        .eq('company_id', company.id)
        .eq('published', true)
        .order('created_at', { ascending: false });

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": company.name,
        "logo": careerPage.logo_url,
        "url": `https://whitecarrot.com/${companySlug}/careers`,
    };

    const puckData = careerPage.puck_data || careerPage.draft_puck_data;


    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {puckData ? (
                <PuckRenderer 
                    data={puckData} 
                    theme={careerPage.theme} 
                    jobs={jobs || []}
                    bannerUrl={careerPage.banner_url}
                    logoUrl={careerPage.logo_url}
                    companyName={company.name}
                />
            ) : (
                <CareerPageRenderer
                    company={company}
                    careerPage={careerPage}
                    sections={sections || []}
                    jobs={jobs || []}
                />
            )}
        </>
    );
}
