/* Simple top-tab layout: Theme, Jobs, Settings */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Palette, Briefcase, Settings, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ThemeCustomizer } from '@/components/recruiter/theme-customizer';
import { JobManager } from '@/components/recruiter/jobs/job-manager';
import { CompanySettings } from '@/components/recruiter/company-settings';

type TabId = 'theme' | 'jobs' | 'settings';

export function EditorMain({ company, careerPage }: { company: any; careerPage: any }) {
    const [activeTab, setActiveTab] = useState<TabId>('theme');

    return (
        <div className="flex h-full w-full flex-col bg-muted/10">
            {/* Header with Back + Tabs */}
            <header className="flex items-center justify-between border-b bg-card px-4 py-3">
                <div className="flex items-center gap-3">
                    <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                        <Link href="/dashboard">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Link>
                    </Button>
                    <Separator orientation="vertical" className="h-6" />
                    <div className="inline-flex gap-1 rounded-lg bg-muted p-1">
                        <TabButton icon={Palette} label="Theme" active={activeTab === 'theme'} onClick={() => setActiveTab('theme')} />
                        <TabButton icon={Briefcase} label="Jobs" active={activeTab === 'jobs'} onClick={() => setActiveTab('jobs')} />
                        <TabButton icon={Settings} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
                    </div>
                </div>

                <div className="hidden text-xs text-muted-foreground md:flex items-center gap-2">
                    <span className="truncate max-w-[160px] font-medium">{company.name}</span>
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] border border-border/50">
                        /{company.slug}
                    </code>
                </div>
            </header>

            {/* Main content area */}
            <main className="flex-1 overflow-auto bg-muted/20 p-4 md:p-6">
                {activeTab === 'theme' && (
                    <div className="mx-auto max-w-4xl">
                        <h2 className="mb-2 text-lg font-semibold tracking-tight">Theme Customization</h2>
                        <p className="mb-6 text-sm text-muted-foreground">Manage your brand colors, logo, and banner.</p>
                        <ThemeCustomizer company={company} careerPage={careerPage} />
                    </div>
                )}

                {activeTab === 'jobs' && (
                    <div className="mx-auto max-w-4xl">
                        {company && <JobManager companyId={company.id} />}
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="mx-auto max-w-4xl">
                        <CompanySettings company={company} />
                    </div>
                )}
            </main>
        </div>
    );
}

function TabButton({
    active,
    onClick,
    icon: Icon,
    label,
}: {
    active: boolean;
    onClick: () => void;
    icon: any;
    label: string;
}) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                active ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:bg-background/60 hover:text-foreground'
            }`}
        >
            <Icon className="h-3.5 w-3.5" />
            <span>{label}</span>
        </button>
    );
}
