'use server';

import { createClient } from '@/lib/supabase/server';

export interface ApplicationFilters {
    jobId?: string;
    status?: string;
    searchQuery?: string;
}

export interface ApplicationWithJob {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    linkedin_url: string;
    resume_url: string;
    created_at: string;
    job_id: string;
    status: string;
    job: {
        id: string;
        title: string;
    };
}

export async function getApplications(companyId: string, filters?: ApplicationFilters) {
    const supabase = await createClient();

    // First, get all job IDs for this company
    const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('id, title')
        .eq('company_id', companyId);

    if (jobsError || !jobsData || jobsData.length === 0) {
        return [];
    }

    const jobIds = jobsData.map(j => j.id);
    const jobMap = new Map(jobsData.map(j => [j.id, j.title]));

    // Build query for applications
    let query = supabase
        .from('applications')
        .select('*')
        .in('job_id', jobIds)
        .order('created_at', { ascending: false });

    // Apply filters
    if (filters?.jobId) {
        query = query.eq('job_id', filters.jobId);
    }

    if (filters?.status) {
        query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching applications:', error);
        return [];
    }

    // Apply search filter client-side (Supabase text search is limited)
    let filteredData = data || [];
    
    if (filters?.searchQuery) {
        const searchLower = filters.searchQuery.toLowerCase();
        filteredData = filteredData.filter((app: any) => {
            const fullName = `${app.first_name} ${app.last_name}`.toLowerCase();
            const email = (app.email || '').toLowerCase();
            return fullName.includes(searchLower) || email.includes(searchLower);
        });
    }

    // Transform data to match ApplicationWithJob interface
    return filteredData.map((app: any) => ({
        id: app.id,
        first_name: app.first_name,
        last_name: app.last_name,
        email: app.email,
        linkedin_url: app.linkedin_url,
        resume_url: app.resume_url,
        created_at: app.created_at,
        job_id: app.job_id,
        status: app.status || 'new',
        job: {
            id: app.job_id,
            title: jobMap.get(app.job_id) || 'Unknown Job',
        },
    })) as ApplicationWithJob[];
}

export async function updateApplicationStatus(applicationId: string, status: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', applicationId);

    if (error) return { error: error.message };
    return { success: true };
}

export async function getApplicationStats(companyId: string) {
    const supabase = await createClient();

    // First, get all job IDs for this company
    const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('id')
        .eq('company_id', companyId);

    if (jobsError || !jobsData || jobsData.length === 0) {
        return {
            total: 0,
            byStatus: {},
            byJob: {},
        };
    }

    const jobIds = jobsData.map(j => j.id);

    // Get all applications for this company's jobs
    const { data, error } = await supabase
        .from('applications')
        .select('status, job_id')
        .in('job_id', jobIds);

    if (error) {
        console.error('Error fetching application stats:', error);
        return {
            total: 0,
            byStatus: {},
            byJob: {},
        };
    }

    const stats = {
        total: data?.length || 0,
        byStatus: {} as Record<string, number>,
        byJob: {} as Record<string, number>,
    };

    // Count by status
    data?.forEach((app: any) => {
        const status = app.status || 'new';
        stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
    });

    // Count by job
    data?.forEach((app: any) => {
        const jobId = app.job_id;
        stats.byJob[jobId] = (stats.byJob[jobId] || 0) + 1;
    });

    return stats;
}

