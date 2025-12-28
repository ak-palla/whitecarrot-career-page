import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { EditorMain } from './editor-main';
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
        title: company ? `Edit - ${company.name}` : "Edit Career Page",
        description: "Edit and customize your company's career page, theme, sections, and job postings.",
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

export default async function EditorPage({ params }: { params: Promise<{ companySlug: string }> }) {
    // Await the params object (since it's a promise in Next.js 15 usually, checking typings)
    // Actually in Next 15 params is awaitable.
    const { companySlug } = await params;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('*, career_pages(*)')
        .eq('slug', companySlug)
        .single();

    if (!company) notFound();

    if (company.owner_id !== user.id) {
        redirect('/dashboard');
    }

    // Fetch career page separately if not included
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
                    primaryColor: '#000000'
                },
                published: false
            })
            .select()
            .single();

        if (pageError) {
            console.error('Error creating career page:', pageError);
        } else {
            careerPage = newPage;
        }
    }

    // Fetch published jobs for the company
    // Optimize: Only select needed fields instead of *
    const { data: jobs } = await supabase
        .from('jobs')
        .select('id, company_id, title, description, location, job_type, created_at, employment_type, salary_range, team, work_policy, experience_level, job_slug')
        .eq('company_id', company.id)
        .eq('published', true)
        .order('created_at', { ascending: false });

    return (
        <div className="h-screen w-full overflow-hidden" style={{ backgroundColor: '#FAF9F5' }}>
            <EditorMain company={company} careerPage={careerPage || null} jobs={jobs || []} />
        </div>
    );
}
