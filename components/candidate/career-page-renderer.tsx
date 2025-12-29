import Link from 'next/link';
import Image from 'next/image';
import { PuckRenderer } from '@/components/candidate/puck-renderer';
import { ServerPagination } from '@/components/candidate/server-pagination';

export function CareerPageRenderer({
    company,
    careerPage,
    sections = [],
    jobs = [],
    preview = false,
    currentPage,
    totalPages,
    totalJobs
}: {
    company: any,
    careerPage: any,
    sections?: any[],
    jobs?: any[],
    preview?: boolean,
    currentPage?: number,
    totalPages?: number,
    totalJobs?: number
}) {
    // Theme application
    const theme = careerPage?.theme || {};
    // Fallbacks just in case
    const primaryColor = theme.primaryColor || '#000000';
    const secondaryColor = theme.secondaryColor || '#ffffff';
    // Accent not used yet but good to have

    // We use CSS variables for dynamic theming
    const style = {
        '--primary': primaryColor,
        '--secondary': secondaryColor,
        '--primary-foreground': secondaryColor,
    } as React.CSSProperties;

    return (
        <div style={style} className="min-h-screen bg-background font-sans">
            {preview && (
                <div className="bg-amber-100 text-amber-800 text-center py-2 text-sm font-medium border-b border-amber-200 sticky top-0 z-50">
                    Preview Mode - Unpublished Changes
                </div>
            )}

            {/* Hero Section */}
            <header className="bg-[var(--primary)] text-[var(--secondary)] pt-20 pb-24 px-8 text-center relative overflow-hidden">
                {careerPage?.banner_url && (
                    <div
                        className="absolute inset-0 opacity-20 bg-cover bg-center"
                        style={{ backgroundImage: `url(${careerPage.banner_url})` }}
                    />
                )}
                <div className="relative z-10 max-w-4xl mx-auto">
                    {careerPage?.logo_url && (
                        <div className="relative h-20 w-auto mx-auto mb-6 bg-white p-2 rounded-lg shadow-sm flex items-center justify-center">
                            <Image
                                src={careerPage.logo_url}
                                alt={`${company.name} Logo`}
                                width={80}
                                height={80}
                                className="h-auto w-auto max-h-16 object-contain"
                                priority
                            />
                        </div>
                    )}
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                        {company.name} Careers
                    </h1>
                    <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
                        Join our team and help us build the future.
                    </p>
                </div>
            </header>

            <main className="container mx-auto py-16 px-4 space-y-24 max-w-5xl">
                {/* Dynamic Sections - Use Puck if available, fallback to old sections */}
                {(() => {
                    // In preview mode, use draft_puck_data; in production, use puck_data
                    const puckData = preview ? careerPage?.draft_puck_data : careerPage?.puck_data;

                    if (puckData) {
                        // PuckRenderer handles jobs internally, no need for separate jobs section
                        return <PuckRenderer data={puckData} theme={theme} jobs={jobs} currentPage={currentPage} totalPages={totalPages} totalJobs={totalJobs} />;
                    } else if (sections.length > 0) {
                        return (
                            <>
                                <div className="space-y-16">
                                    {sections.map((section: any) => (
                                        <section key={section.id} className="prose prose-lg max-w-none">
                                            <h2 className="text-3xl font-bold mb-6 text-gray-900 border-b pb-4">{section.title}</h2>
                                            <div dangerouslySetInnerHTML={{ __html: section.content || '' }} />
                                        </section>
                                    ))}
                                </div>
                                {/* Jobs Section - only render when using legacy sections */}
                                <section id="jobs" className="scroll-mt-20">
                                    <div className="text-center mb-12">
                                        <h2 className="text-3xl font-bold mb-4">Open Positions</h2>
                                        <p className="text-gray-600">Find the role that fits you best.</p>
                                    </div>
                                    {jobs.length === 0 ? (
                                        <div className="text-center p-12 bg-gray-50 rounded-lg border border-dashed">
                                            <p className="text-gray-500 text-lg">No open positions at the moment. Check back soon!</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="grid md:grid-cols-2 gap-6">
                                                {jobs.map((job: any) => (
                                                    <div key={job.id} className="group border rounded-xl p-6 hover:shadow-md transition-all bg-white hover:border-[var(--primary)] relative">
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div>
                                                                <h3 className="font-bold text-xl mb-1 group-hover:text-[var(--primary)] transition-colors">{job.title}</h3>
                                                                <div className="flex gap-2 text-sm text-gray-500 items-center">
                                                                    <span>{job.location}</span>
                                                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                                    <span className="capitalize">{job.job_type.replace('-', ' ')}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="mt-4 pt-4 border-t flex justify-end">
                                                            <span className="text-sm font-medium text-[var(--primary)] group-hover:translate-x-1 transition-transform inline-flex items-center">
                                                                View Details
                                                                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                                </svg>
                                                            </span>
                                                        </div>
                                                        <Link href="#" className="absolute inset-0" aria-label={`View ${job.title}`} />
                                                    </div>
                                                ))}
                                            </div>
                                            {totalPages && totalPages > 1 && (
                                                <ServerPagination
                                                    currentPage={currentPage || 1}
                                                    totalPages={totalPages}
                                                    totalItems={totalJobs || jobs.length}
                                                    itemsPerPage={20}
                                                />
                                            )}
                                        </>
                                    )}
                                </section>
                            </>
                        );
                    }
                    // No sections and no puck data - show jobs only
                    return (
                        <section id="jobs" className="scroll-mt-20">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl font-bold mb-4">Open Positions</h2>
                                <p className="text-gray-600">Find the role that fits you best.</p>
                            </div>
                            {jobs.length === 0 ? (
                                <div className="text-center p-12 bg-gray-50 rounded-lg border border-dashed">
                                    <p className="text-gray-500 text-lg">No open positions at the moment. Check back soon!</p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {jobs.map((job: any) => (
                                            <div key={job.id} className="group border rounded-xl p-6 hover:shadow-md transition-all bg-white hover:border-[var(--primary)] relative">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h3 className="font-bold text-xl mb-1 group-hover:text-[var(--primary)] transition-colors">{job.title}</h3>
                                                        <div className="flex gap-2 text-sm text-gray-500 items-center">
                                                            <span>{job.location}</span>
                                                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                            <span className="capitalize">{job.job_type.replace('-', ' ')}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-4 pt-4 border-t flex justify-end">
                                                    <span className="text-sm font-medium text-[var(--primary)] group-hover:translate-x-1 transition-transform inline-flex items-center">
                                                        View Details
                                                        <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </span>
                                                </div>
                                                <Link href="#" className="absolute inset-0" aria-label={`View ${job.title}`} />
                                            </div>
                                        ))}
                                    </div>
                                    {totalPages && totalPages > 1 && (
                                        <ServerPagination
                                            currentPage={currentPage || 1}
                                            totalPages={totalPages}
                                            totalItems={totalJobs || jobs.length}
                                            itemsPerPage={20}
                                        />
                                    )}
                                </>
                            )}
                        </section>
                    );
                })()}
            </main>

            <footer className="bg-gray-900 text-gray-300 py-12 mt-20">
                <div className="container mx-auto px-4 text-center">
                    <p className="mb-4 text-white font-medium">{company.name}</p>
                    <p className="text-sm opacity-60">
                        &copy; {new Date().getFullYear()} {company.name}. All rights reserved.
                    </p>
                    <p className="text-xs mt-8 opacity-40">Powered by WhiteCarrot ATS</p>
                </div>
            </footer>
        </div>
    );
}
