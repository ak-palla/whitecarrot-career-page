import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { EditorMain } from './editor-main';

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
                    primaryColor: '#000000',
                    secondaryColor: '#ffffff',
                    accentColor: '#3b82f6'
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

    return (
        <div className="flex h-screen flex-col bg-background">
            <header className="border-b px-6 py-3 flex items-center justify-between bg-white">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="text-sm text-gray-500 hover:text-black">← Back</Link>
                    <h1 className="font-semibold">{company.name}</h1>
                    <span className="text-xs text-muted-foreground px-2 py-1 bg-gray-100 rounded-full">Editor</span>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href={`/${company.slug}/preview`} target="_blank">Preview</Link>
                    </Button>
                    {/* We'll implement Publish action later */}
                    <Button>Publish</Button>
                </div>
            </header>
            <div className="flex-1 overflow-hidden flex">
                <EditorMain company={company} careerPage={careerPage || null} />
            </div>
        </div>
    );
}
