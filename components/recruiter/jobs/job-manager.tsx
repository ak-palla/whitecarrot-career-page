'use client';
import { useState, useEffect } from 'react';
import { getJobs, createJob, updateJob, deleteJob } from '@/app/actions/jobs';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { JobFormDialog } from './job-form-dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export function JobManager({ companyId }: { companyId: string }) {
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingJob, setEditingJob] = useState<any>(null);

    useEffect(() => {
        loadJobs();
    }, [companyId]);

    async function loadJobs() {
        setLoading(true);
        const data = await getJobs(companyId);
        setJobs(data || []);
        if (loading) setLoading(false);
    }

    async function handleCreate(data: any) {
        await createJob(companyId, data);
        await loadJobs();
    }

    async function handleUpdate(data: any) {
        if (!editingJob) return;
        await updateJob(editingJob.id, data);
        await loadJobs();
        setEditingJob(null);
    }

    async function togglePublish(job: any) {
        await updateJob(job.id, { published: !job.published });
        await loadJobs();
    }

    async function handleDelete(id: string) {
        if (!confirm('Delete this job? This cannot be undone.')) return;
        await deleteJob(id);
        await loadJobs();
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Job Postings</h2>
                <Button onClick={() => { setEditingJob(null); setDialogOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Add Job
                </Button>
            </div>

            {loading ? <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted-foreground" /></div> : jobs.length === 0 ? (
                <div className="text-center p-12 bg-gray-50 rounded-lg border border-dashed text-muted-foreground">
                    <p>No jobs posted yet. Create your first listing.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {jobs.map(job => (
                        <div key={job.id} className="flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm hover:border-gray-300 transition-colors">
                            <div>
                                <h3 className="font-medium text-base">{job.title}</h3>
                                <div className="flex gap-2 text-sm text-gray-500 mt-1 items-center">
                                    <span>{job.location}</span>
                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                    <span className="capitalize">{job.job_type.replace('-', ' ')}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Badge variant={job.published ? "default" : "secondary"}>
                                    {job.published ? 'Published' : 'Draft'}
                                </Badge>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => { setEditingJob(job); setDialogOpen(true); }}>
                                            <Pencil className="mr-2 h-4 w-4" /> Edit Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => togglePublish(job)}>
                                            <span className={job.published ? "" : "text-green-600 font-medium"}>
                                                {job.published ? 'Unpublish' : 'Publish Job'}
                                            </span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => handleDelete(job.id)}>
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <JobFormDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={editingJob ? handleUpdate : handleCreate}
                initialData={editingJob}
                key={editingJob ? editingJob.id : 'new'}
            />
        </div>
    )
}
