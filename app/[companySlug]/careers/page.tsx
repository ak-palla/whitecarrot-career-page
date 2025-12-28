import { createClient } from '@/lib/supabase/server';
import { CareerPageRenderer } from '@/components/candidate/career-page-renderer';
import { PuckRenderer } from '@/components/candidate/puck-renderer';

export const dynamic = 'force-dynamic';

// Revalidate this page every 5 minutes
export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ companySlug: string }> }) {
    const { companySlug } = await params;
    const supabase = await createClient();

    // Fetch company and career page data for metadata
    const { data: company } = await supabase
        .from('companies')
        .select('name, career_pages(banner_url, logo_url)')
        .eq('slug', companySlug)
        .single();

    if (!company) return {};

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ||
        (process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : "http://localhost:3000");
    const canonicalUrl = `${baseUrl}/${companySlug}/careers`;
    const bannerUrl = company.career_pages?.[0]?.banner_url;
    const logoUrl = company.career_pages?.[0]?.logo_url;

    // Use logo URL directly if it's absolute (from Supabase storage), otherwise use tie.png
    const iconUrl = logoUrl && logoUrl.startsWith('http')
        ? logoUrl
        : `${baseUrl}/tie.png`;

    return {
        title: `Careers at ${company.name}`,
        description: `Join our team at ${company.name}. Browse available jobs and apply today.`,
        icons: {
            icon: iconUrl,
            shortcut: iconUrl,
            apple: iconUrl,
        },
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title: `Careers at ${company.name}`,
            description: `Join our team at ${company.name}. Browse available jobs and apply today.`,
            url: canonicalUrl,
            siteName: "Lisco",
            images: bannerUrl ? [
                {
                    url: bannerUrl,
                    width: 1200,
                    height: 630,
                    alt: `${company.name} Careers`,
                }
            ] : logoUrl ? [
                {
                    url: logoUrl,
                    width: 1200,
                    height: 630,
                    alt: `${company.name} Logo`,
                }
            ] : [],
            locale: "en_US",
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: `Careers at ${company.name}`,
            description: `Join our team at ${company.name}. Browse available jobs and apply today.`,
            images: bannerUrl ? [bannerUrl] : logoUrl ? [logoUrl] : [],
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                "max-video-preview": -1,
                "max-image-preview": "large",
                "max-snippet": -1,
            },
        },
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

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ||
        (process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : "http://localhost:3000");
    const careersUrl = `${baseUrl}/${companySlug}/careers`;

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": company.name,
        "logo": careerPage.logo_url,
        "url": careersUrl,
    };

    // Generate JobPosting structured data for each published job
    const jobPostings = (jobs || []).map((job) => {
        const jobPosting: any = {
            "@context": "https://schema.org",
            "@type": "JobPosting",
            "title": job.title,
            "description": job.description || `${job.title} at ${company.name}`,
            "identifier": {
                "@type": "PropertyValue",
                "name": company.name,
                "value": job.id,
            },
            "datePosted": job.created_at,
            "employmentType": job.employment_type || "FULL_TIME",
            "hiringOrganization": {
                "@type": "Organization",
                "name": company.name,
                "logo": careerPage.logo_url,
                "sameAs": careersUrl,
            },
        };

        if (job.expires_at) {
            jobPosting.validThrough = job.expires_at;
        }

        if (job.location) {
            jobPosting.jobLocation = {
                "@type": "Place",
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": job.location,
                },
            };
        }

        if (job.salary_range) {
            const salaryParts = job.salary_range.split('-');
            jobPosting.baseSalary = {
                "@type": "MonetaryAmount",
                "currency": job.currency || "USD",
                "value": {
                    "@type": "QuantitativeValue",
                    "minValue": salaryParts[0]?.trim(),
                    "maxValue": salaryParts[1]?.trim(),
                },
            };
        }

        return jobPosting;
    });

    const puckData = careerPage.puck_data || careerPage.draft_puck_data;


    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLd, ...jobPostings]) }}
            />
            {puckData ? (
                <PuckRenderer
                    data={puckData}
                    theme={careerPage.theme}
                    jobs={jobs || []}
                    bannerUrl={careerPage.banner_url}
                    logoUrl={careerPage.logo_url}
                    videoUrl={careerPage.video_url}
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
