import { getCompanies } from '@/app/actions/companies';
import { CreateCompanyDialog } from './create-company-dialog';
import { CompanyCard } from '@/components/recruiter/company-card';


export default async function DashboardPage() {
    const companies = await getCompanies();

    return (
        <div className="flex flex-1 flex-col gap-8">
            <div className="flex items-center justify-between pt-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">Your Companies</h1>
                    <p className="text-sm text-muted-foreground">Manage your career pages and job postings.</p>
                </div>
            </div>

            {companies.length === 0 ? (
                <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm py-20 bg-muted/20">
                    <div className="flex flex-col items-center gap-1 text-center">
                        <h3 className="text-lg font-bold tracking-tight">No companies created</h3>
                        <p className="text-sm text-muted-foreground mb-4">You have not created any companies yet.</p>
                        <CreateCompanyDialog />
                    </div>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {companies.map((company) => (
                        <CompanyCard key={company.id} company={company} />
                    ))}
                </div>
            )}
        </div>
    );
}
