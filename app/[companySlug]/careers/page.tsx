import { createClient } from '@/lib/supabase/server';
import { CareerPageRenderer } from '@/components/candidate/career-page-renderer';
import { PuckRenderer } from '@/components/candidate/puck-renderer';
import { getJobs, getJobsCount } from '@/app/actions/jobs';

export const dynamic = 'force-dynamic';

// Revalidate this page every 5 minutes
export const revalidate = 300;

const JOBS_PER_PAGE = 20;

export async function generateMetadata({ params }: { params: Promise<{ companySlug: string }> }) {
    const { companySlug } = await params;
    const supabase = await createClient();

    // Optimize: Only select fields needed for metadata
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
            ] : [
                {
                    url: `${baseUrl}/og?company=${encodeURIComponent(company.name)}&title=${encodeURIComponent(`Careers at ${company.name}`)}&description=${encodeURIComponent(`Join our team at ${company.name}. Browse available jobs and apply today.`)}`,
                    width: 1200,
                    height: 630,
                    alt: `${company.name} Careers`,
                }
            ],
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

export default async function CareersPage({ 
    params,
    searchParams 
}: { 
    params: Promise<{ companySlug: string }>;
    searchParams: Promise<{ page?: string; search?: string; location?: string; type?: string; team?: string }>;
}) {
    const { companySlug } = await params;
    
    const supabase = await createClient();

    // Optimize: Combine company and career_pages query, only select needed fields
    const { data: company } = await supabase
        .from('companies')
        .select('id, name, slug, career_pages(id, company_id, theme, puck_data, draft_puck_data, logo_url, banner_url, video_url)')
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
        // Optimize: Only select needed fields
        const { data: existingPage } = await supabase
            .from('career_pages')
            .select('id, company_id, theme, puck_data, draft_puck_data, logo_url, banner_url, video_url')
            .eq('company_id', company.id)
            .single();

        if (existingPage) {
            careerPage = existingPage;
        }
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

    // Optimize: Fetch sections and jobs in parallel using Promise.all
    // Fetch ALL published jobs (no pagination) - client-side filtering and pagination like /edit page
    const [sectionsResult, jobs] = await Promise.all([
        // Fetch sections (for legacy fallback) - only select needed fields
        supabase
            .from('page_sections')
            .select('id, career_page_id, type, content, visible, order')
            .eq('career_page_id', careerPage.id)
            .eq('visible', true)
            .order('order', { ascending: true }),
        // Fetch ALL published jobs - no pagination, client-side filtering and pagination
        getJobs(company.id, {
            published: true
        })
    ]);

    const sections = sectionsResult.data || [];
    
    // Ensure only published jobs are passed to the component (defensive filtering)
    // This matches the /edit page strategy: fetch all needed data server-side, then filter client-side
    const publishedJobs = (jobs || []).filter(job => job.published === true);

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ||
        (process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : "http://localhost:3000");
    const careersUrl = `${baseUrl}/${companySlug}/careers`;

    // Enhanced Organization schema with more properties
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": company.name,
        "logo": careerPage.logo_url ? {
            "@type": "ImageObject",
            "url": careerPage.logo_url,
        } : undefined,
        "url": careersUrl,
        "sameAs": careerPage.video_url ? [careerPage.video_url] : undefined,
        "description": `Career opportunities at ${company.name}. Browse available job openings and apply today.`,
    };

    // Generate JobPosting structured data for each published job
    const jobPostings = publishedJobs.map((job) => {
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

        // Enhanced properties
        if (job.job_type) {
            jobPosting.jobType = job.job_type;
        }

        if (job.work_policy) {
            jobPosting.workLocation = {
                "@type": "Place",
                "name": job.work_policy,
            };
        }

        if (job.experience_level) {
            jobPosting.qualifications = {
                "@type": "EducationalOccupationalCredential",
                "credentialCategory": job.experience_level,
            };
        }

        if (job.team) {
            jobPosting.department = job.team;
        }

        // Add application URL if available
        jobPosting.url = `${careersUrl}?job=${job.id}`;

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
                    jobs={publishedJobs}
                    bannerUrl={careerPage.banner_url}
                    logoUrl={careerPage.logo_url}
                    videoUrl={careerPage.video_url}
                    companyName={company.name}
                />
            ) : (
                <CareerPageRenderer
                    company={company}
                    careerPage={careerPage}
                    sections={sections}
                    jobs={publishedJobs}
                />
            )}
        </>
    );
}
