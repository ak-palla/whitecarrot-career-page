import { getCompanies } from '@/app/actions/companies';
import { CreateCompanyDialog } from './create-company-dialog';
import { CompanyCard } from '@/components/recruiter/company-card';
import { EmptyState } from './empty-state';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';


export default async function DashboardPage() {
    const companies = await getCompanies();

    return (
        <div className="flex flex-1 flex-col gap-8 pt-6 px-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
                    <p className="text-lg text-muted-foreground">Manage your career pages and job postings.</p>
                </div>
                {companies.length > 0 && (
                    <CreateCompanyDialog>
                        <Button className="font-semibold shadow-sm">
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
        </div>
    );
}
