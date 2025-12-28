import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getJobs } from '@/app/actions/jobs';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

export async function GET(
  request: Request,
  { params }: { params: Promise<{ companySlug: string }> }
) {
  const { companySlug } = await params;
  const supabase = await createClient();

  // Fetch company
  const { data: company } = await supabase
    .from('companies')
    .select('id, name, slug')
    .eq('slug', companySlug)
    .single();

  if (!company) {
    return new NextResponse('Company not found', { status: 404 });
  }

  // Fetch published jobs
  const jobs = await getJobs(company.id, { published: true });

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

  const careersUrl = `${baseUrl}/${companySlug}/careers`;
  const feedUrl = `${baseUrl}/${companySlug}/careers/feed.xml`;

  // Generate RSS feed
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Careers at ${company.name}</title>
    <link>${careersUrl}</link>
    <description>Latest job openings at ${company.name}</description>
    <language>en-US</language>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <pubDate>${new Date().toUTCString()}</pubDate>
    ${jobs.map(job => {
      const jobUrl = job.job_slug
        ? `${careersUrl}/jobs/${job.job_slug}`
        : `${careersUrl}?job=${job.id}`;
      
      const pubDate = job.created_at
        ? new Date(job.created_at).toUTCString()
        : new Date().toUTCString();

      // Clean description for XML
      const description = (job.description || `${job.title} at ${company.name}`)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

      return `
    <item>
      <title><![CDATA[${job.title}]]></title>
      <link>${jobUrl}</link>
      <guid isPermaLink="true">${jobUrl}</guid>
      <description><![CDATA[${description}]]></description>
      <pubDate>${pubDate}</pubDate>
      ${job.location ? `<category>${job.location}</category>` : ''}
      ${job.job_type ? `<category>${job.job_type}</category>` : ''}
      ${job.employment_type ? `<category>${job.employment_type}</category>` : ''}
    </item>`;
    }).join('')}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}

