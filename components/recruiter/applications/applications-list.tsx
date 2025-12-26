'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, Linkedin, Mail, Calendar, Download } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns'; // Need to check if date-fns is installed, if not use standard JS

interface Application {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    linkedin_url: string;
    resume_url: string;
    created_at: string;
    job_id: string;
    status: string;
}

interface JobWithApplications {
    id: string;
    title: string;
    applications: Application[];
}

export function ApplicationsList({ company }: { company: any }) {
    const [jobs, setJobs] = useState<JobWithApplications[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient();

            // 1. Fetch Company Jobs
            const { data: jobsData, error: jobsError } = await supabase
                .from('jobs')
                .select('id, title')
                .eq('company_id', company.id)
                .order('created_at', { ascending: false });

            if (jobsError || !jobsData) {
                console.error('Error fetching jobs:', jobsError);
                setLoading(false);
                return;
            }

            if (jobsData.length === 0) {
                setJobs([]);
                setLoading(false);
                return;
            }

            // 2. Fetch Applications for these jobs
            const jobIds = jobsData.map(j => j.id);
            const { data: appsData, error: appsError } = await supabase
                .from('applications')
                .select('*')
                .in('job_id', jobIds)
                .order('created_at', { ascending: false });

            if (appsError) {
                console.error('Error fetching applications:', appsError);
                setLoading(false);
                return;
            }

            // 3. Group Applications by Job
            const jobsWithApps: JobWithApplications[] = jobsData.map(job => ({
                ...job,
                applications: (appsData || []).filter(app => app.job_id === job.id)
            }));

            // Filter out jobs with 0 applications? No, user might want to see all jobs or maybe just ones with apps.
            // Let's keep all jobs but maybe sort jobs with applications first? 
            // For now, simple list.
            setJobs(jobsWithApps);
            setLoading(false);
        };

        fetchData();
    }, [company.id]);

    const getResumeUrl = (path: string) => {
        // If path itself is a full URL (legacy or external), return it
        if (path.startsWith('http')) return path;

        // Otherwise generate public URL from storage
        const supabase = createClient();
        const { data } = supabase.storage.from('resumes').getPublicUrl(path);
        return data.publicUrl;
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const totalApplications = jobs.reduce((acc, job) => acc + job.applications.length, 0);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Applications</h2>
                    <p className="text-muted-foreground">
                        {totalApplications} {totalApplications === 1 ? 'applicant' : 'applicants'} across {jobs.length} jobs
                    </p>
                </div>
            </div>

            {jobs.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-dashed">
                    <p className="text-muted-foreground">No jobs posted yet.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {jobs.map((job) => (
                        <Card key={job.id} className="overflow-hidden">
                            <CardHeader className="bg-muted/30 border-b py-3 px-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-base font-semibold">{job.title}</CardTitle>
                                        <Badge variant="secondary" className="font-normal text-xs">
                                            {job.applications.length}
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {job.applications.length === 0 ? (
                                    <div className="p-8 text-center text-sm text-muted-foreground">
                                        No applications yet
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {job.applications.map((app) => (
                                            <div key={app.id} className="p-4 hover:bg-muted/10 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-lg">
                                                            {app.first_name} {app.last_name}
                                                        </span>
                                                        {app.status === 'new' && (
                                                            <Badge className="text-[10px] h-5 px-1.5 bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">New</Badge>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                                                        <a href={`mailto:${app.email}`} className="flex items-center gap-1 hover:text-foreground transition-colors">
                                                            <Mail className="h-3.5 w-3.5" />
                                                            {app.email}
                                                        </a>
                                                        <a href={app.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                                                            <Linkedin className="h-3.5 w-3.5" />
                                                            LinkedIn Profile
                                                        </a>
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-3.5 w-3.5" />
                                                            {new Date(app.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0">
                                                    <Button variant="outline" size="sm" asChild className="gap-2">
                                                        <a href={getResumeUrl(app.resume_url)} target="_blank" rel="noopener noreferrer">
                                                            <FileText className="h-4 w-4" />
                                                            View Resume
                                                        </a>
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
