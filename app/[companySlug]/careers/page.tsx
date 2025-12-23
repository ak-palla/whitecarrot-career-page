import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { CareerPageRenderer } from '@/components/candidate/career-page-renderer';

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

    if (!company) notFound();

    const careerPage = company.career_pages?.[0];

    // Public page requires published status
    if (!careerPage || !careerPage.published) {
        notFound();
        // Or return a custom "Not published" component
    }

    // Fetch sections
    const { data: sections } = await supabase
        .from('page_sections')
        .select('*')
        .eq('career_page_id', careerPage.id)
        .eq('visible', true)
        .order('order', { ascending: true });

    // Fetch published jobs
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

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <CareerPageRenderer
                company={company}
                careerPage={careerPage}
                sections={sections || []}
                jobs={jobs || []}
            />
        </>
    );
}
