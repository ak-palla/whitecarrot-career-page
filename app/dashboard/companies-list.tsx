'use client';

/**
 * Client component for displaying companies list with React Query
 */

import { useCompanies } from '@/lib/hooks/use-companies';
import { CompanyCard } from '@/components/recruiter/company-card';
import { EmptyState } from './empty-state';
import { CreateCompanyDialog } from './create-company-dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CompanyCardsSkeleton } from '@/components/skeletons/company-cards-skeleton';

export function CompaniesList() {
  const { data: companies = [], isLoading, error } = useCompanies();

  if (isLoading) {
    return (
      <>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
            <p className="text-lg text-muted-foreground">
              Manage your career pages and job postings.
            </p>
          </div>
        </div>
        <CompanyCardsSkeleton count={2} />
      </>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-destructive mb-2">Failed to load companies</p>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : 'An error occurred'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
          <p className="text-lg text-muted-foreground">
            Manage your career pages and job postings.
          </p>
        </div>
        {companies.length > 0 && (
          <CreateCompanyDialog>
            <Button className="w-fit font-semibold shadow-sm bg-create-company hover:bg-create-company text-black">
              <Plus className="mr-2 h-4 w-4" />
              Create Company
            </Button>
          </CreateCompanyDialog>
        )}
      </div>

      {companies.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {companies.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
      )}
    </>
  );
}

