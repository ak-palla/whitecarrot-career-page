import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { CareerPageRenderer } from '@/components/candidate/career-page-renderer';
import { PuckRenderer } from '@/components/candidate/puck-renderer';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ companySlug: string }> }): Promise<Metadata> {
    const { companySlug } = await params;
    const supabase = await createClient();
    
    const { data: company } = await supabase
        .from('companies')
        .select('name, career_pages(logo_url)')
        .eq('slug', companySlug)
        .single();

    const logoUrl = company?.career_pages?.[0]?.logo_url;
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
        (process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");
    
    // Use logo URL directly if it's absolute (from Supabase storage), otherwise use tie.png
    const iconUrl = logoUrl && logoUrl.startsWith('http') 
        ? logoUrl 
        : `${baseUrl}/tie.png`;

    return {
        title: company ? `Preview - ${company.name}` : "Preview Career Page",
        description: "Preview your company's career page before publishing.",
        icons: {
            icon: iconUrl,
            shortcut: iconUrl,
            apple: iconUrl,
        },
        robots: {
            index: false,
            follow: false,
        },
    };
}

export default async function PreviewPage({ params }: { params: Promise<{ companySlug: string }> }) {
    const { companySlug } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

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
        <PuckRenderer 
            data={careerPage.draft_puck_data} 
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
            preview={true}
        />
    );
}

