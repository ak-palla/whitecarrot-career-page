'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThemeCustomizer } from '@/components/recruiter/theme-customizer';
import { SectionBuilder } from '@/components/recruiter/section-builder';
import { JobManager } from '@/components/recruiter/jobs/job-manager';
import { CompanySettings } from '@/components/recruiter/company-settings';

export function EditorMain({ company, careerPage }: { company: any, careerPage: any }) {
    const [activeTab, setActiveTab] = useState<'theme' | 'sections' | 'jobs' | 'settings'>('theme');

    return (
        <div className="flex w-full h-full">
            {/* Sidebar / Tabs */}
            <aside className="w-80 border-r bg-gray-50 flex flex-col h-full">
                <nav className="p-4 space-y-1">
                    <TabButton active={activeTab === 'theme'} onClick={() => setActiveTab('theme')}>Theme</TabButton>
                    <TabButton active={activeTab === 'sections'} onClick={() => setActiveTab('sections')}>Sections</TabButton>
                    <TabButton active={activeTab === 'jobs'} onClick={() => setActiveTab('jobs')}>Jobs</TabButton>
                    <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')}>Settings</TabButton>
                </nav>

                <div className="p-4 flex-1 overflow-auto">
                    {activeTab === 'theme' && <ThemeCustomizer company={company} careerPage={careerPage} />}
                    {activeTab === 'sections' && careerPage && <SectionBuilder pageId={careerPage.id} />}
                    {activeTab === 'sections' && !careerPage && (
                        <div className="text-sm text-gray-500 p-4">
                            Career page not found. Please refresh the page.
                        </div>
                    )}
                    {activeTab === 'jobs' && <JobManager companyId={company.id} />}
                    {activeTab === 'settings' && <CompanySettings company={company} />}
                </div>
            </aside>

            {/* Preview Area */}
            <main className="flex-1 bg-gray-100 flex flex-col h-full overflow-hidden">
                <div className="h-10 flex items-center justify-center border-b bg-white text-xs text-gray-500">
                    Preview Mode
                </div>
                <div className="flex-1 overflow-auto p-8 flex justify-center">
                    <div className="bg-white shadow-xl w-full max-w-4xl min-h-full rounded-lg overflow-hidden flex items-center justify-center text-gray-400">
                        {/* We could potentially render the actual preview here via iframe or component */}
                        <div className="text-center p-8">
                            <h3 className="text-xl font-semibold mb-2">Live Preview</h3>
                            <p>To see the full page validation, use the "Preview" button in the header.</p>
                            <p className="mt-4 text-sm bg-yellow-50 p-2 rounded text-yellow-700">Detailed inline preview requires implementing the renderer here.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function TabButton({ children, active, onClick }: { children: React.ReactNode, active: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${active ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-black hover:bg-gray-200/50'}`}
        >
            {children}
        </button>
    )
}
