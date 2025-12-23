/* Simple top-tab layout: Theme, Sections (Puck), Jobs, Settings */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Palette, Layers, Briefcase, Settings, ArrowLeft, LayoutTemplate } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ThemeCustomizer } from '@/components/recruiter/theme-customizer';
import { PuckEditor } from '@/components/recruiter/puck-editor';
import { JobManager } from '@/components/recruiter/jobs/job-manager';
import { CompanySettings } from '@/components/recruiter/company-settings';
import { InlineThemeControls } from '@/components/recruiter/inline-theme-controls';
import { savePuckDraft, publishPuckPage } from '@/app/actions/career-pages';

type TabId = 'theme' | 'pageBuilder' | 'jobs' | 'settings';

export function EditorMain({ company, careerPage }: { company: any; careerPage: any }) {
    const [activeTab, setActiveTab] = useState<TabId>('pageBuilder');
    const [currentTheme, setCurrentTheme] = useState(careerPage?.theme || { primaryColor: '#000000', secondaryColor: '#ffffff' });

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
                        <TabButton
                            icon={LayoutTemplate}
                            label="Page Builder"
                            active={activeTab === 'pageBuilder'}
                            onClick={() => setActiveTab('pageBuilder')}
                        />
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

                {activeTab === 'pageBuilder' && (
                    <div className="h-full w-full">
                        {careerPage ? (
                            <div className="space-y-4">
                                <div className="rounded-lg border bg-card px-4 py-3 text-sm text-muted-foreground">
                                    <p className="font-medium text-foreground">Career Page Builder</p>
                                    <p className="mt-1">
                                        Start with a recommended layout or a blank page inside the editor. Changes are saved as a draft until you
                                        publish.
                                    </p>
                                </div>
                                <InlineThemeControls
                                    company={company}
                                    careerPage={careerPage}
                                    onThemeChange={(theme) => {
                                        setCurrentTheme(theme);
                                    }}
                                />
                                <PuckEditor
                                    careerPage={careerPage}
                                    companySlug={company.slug}
                                    themeOverride={currentTheme}
                                    onSave={async (data) => {
                                        const result = await savePuckDraft(careerPage.id, data, company.slug);
                                        if (result.error) throw new Error(result.error);
                                    }}
                                    onPublish={async (data) => {
                                        await savePuckDraft(careerPage.id, data, company.slug);
                                        const result = await publishPuckPage(careerPage.id, company.slug);
                                        if (result.error) throw new Error(result.error);
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="flex h-full items-center justify-center">
                                <div className="flex max-w-md flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/10 p-8 text-center text-muted-foreground">
                                    <LayoutTemplate className="mb-2 h-8 w-8 opacity-50" />
                                    <p className="text-sm">Career page not initialized.</p>
                                </div>
                            </div>
                        )}
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
