/* Simple top-tab layout: Theme, Jobs, Settings */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Palette, Briefcase, Settings, ArrowLeft, Layout, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ThemeCustomizer } from '@/components/recruiter/theme-customizer';
import { JobManager } from '@/components/recruiter/jobs/job-manager';
import { CompanySettings } from '@/components/recruiter/company-settings';
import { PuckEditor } from '@/components/recruiter/puck-editor';
import { ApplicationsList } from '@/components/recruiter/applications/applications-list';

type TabId = 'theme' | 'builder' | 'jobs' | 'applications' | 'settings';

export function EditorMain({ company, careerPage }: { company: any; careerPage: any }) {
    const [activeTab, setActiveTab] = useState<TabId>('theme');
    const [saveHandler, setSaveHandler] = useState<(() => Promise<void>) | null>(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    return (
        <div className="flex h-full w-full flex-col bg-muted/10">
            {/* Header with Back + Tabs */}
            <header className="flex items-center border-b bg-card px-4 py-3">
                <div className="flex items-center gap-3 flex-1">
                    <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                        <Link href="/dashboard">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Link>
                    </Button>
                    <Separator orientation="vertical" className="h-6" />
                </div>

                <div className="inline-flex gap-1 rounded-lg p-1" style={{ backgroundColor: '#FAF9F5' }}>
                    <TabButton icon={Palette} label="Theme" active={activeTab === 'theme'} onClick={() => setActiveTab('theme')} />
                    <TabButton icon={Layout} label="Page Builder" active={activeTab === 'builder'} onClick={() => setActiveTab('builder')} />
                    <TabButton icon={Briefcase} label="Jobs" active={activeTab === 'jobs'} onClick={() => setActiveTab('jobs')} />
                    <TabButton icon={Users} label="Applications" active={activeTab === 'applications'} onClick={() => setActiveTab('applications')} />
                    <TabButton icon={Settings} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
                </div>

                <div className="hidden text-xs text-muted-foreground md:flex items-center gap-2 flex-1 justify-end">
                    <span className="truncate max-w-[160px] font-medium">{company.name}</span>
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] border border-border/50">
                        /{company.slug}
                    </code>
                </div>
            </header>

            {/* Main content area */}
            <main className="flex-1 overflow-hidden bg-muted/20">
                {activeTab === 'theme' && (
                    <div className="h-full overflow-auto p-4 md:p-6">
                        <div className="mx-auto max-w-4xl px-4 md:px-6">
                            <h2 className="mb-2 text-lg font-semibold tracking-tight">Theme Customization</h2>
                            <p className="mb-6 text-sm text-muted-foreground">Manage your brand colors, logo, and banner.</p>
                            <ThemeCustomizer
                                company={company}
                                careerPage={careerPage}
                                onSaveStateChange={(state) => {
                                    setSaveHandler(() => state.handleSave);
                                    setSaving(state.saving);
                                    setMessage(state.message);
                                }}
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'builder' && (
                    <PuckEditor careerPage={careerPage} companySlug={company.slug} />
                )}

                {activeTab === 'jobs' && (
                    <div className="h-full overflow-auto p-4 md:p-6">
                        <div className="mx-auto max-w-4xl px-4 md:px-6">
                            {company && <JobManager companyId={company.id} />}
                        </div>
                    </div>
                )}

                {activeTab === 'applications' && (
                    <div className="h-full overflow-auto p-4 md:p-6">
                        <div className="mx-auto max-w-4xl px-4 md:px-6">
                            <ApplicationsList company={company} />
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="h-full overflow-auto p-4 md:p-6">
                        <div className="mx-auto max-w-4xl px-4 md:px-6">
                            <CompanySettings company={company} />
                        </div>
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
            className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring ${active ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:bg-background/60 hover:text-foreground'
                }`}
        >
            <Icon className="h-3.5 w-3.5" />
            <span>{label}</span>
        </button>
    );
}
