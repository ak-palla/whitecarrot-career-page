import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

  const supabase = await createClient();

  // Fetch all companies with published career pages
  const { data: companies } = await supabase
    .from('companies')
    .select('id, slug, updated_at, career_pages(id, published)')
    .order('updated_at', { ascending: false });

  if (!companies) {
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ];
  }

  const sitemapEntries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ];

  // Add career pages for each company
  for (const company of companies) {
    const careerPages = Array.isArray(company.career_pages)
      ? company.career_pages
      : company.career_pages
        ? [company.career_pages]
        : [];

    // Only include companies with published career pages
    const hasPublishedPage = careerPages.some((page: any) => page.published === true);

    if (hasPublishedPage) {
      sitemapEntries.push({
        url: `${baseUrl}/${company.slug}/careers`,
        lastModified: company.updated_at ? new Date(company.updated_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });

      // Fetch published jobs for this company
      const { data: jobs } = await supabase
        .from('jobs')
        .select('job_slug, updated_at')
        .eq('company_id', company.id)
        .eq('published', true)
        .order('updated_at', { ascending: false });

      // Add individual job pages if they have slugs
      if (jobs && jobs.length > 0) {
        for (const job of jobs) {
          if (job.job_slug) {
            sitemapEntries.push({
              url: `${baseUrl}/${company.slug}/careers/jobs/${job.job_slug}`,
              lastModified: job.updated_at ? new Date(job.updated_at) : new Date(),
              changeFrequency: 'weekly',
              priority: 0.6,
            });
          }
        }
      }
    }
  }

  return sitemapEntries;
}

