import { getCompanies } from '@/app/actions/companies';
import { CreateCompanyDialog } from './create-company-dialog';
import { CompanyCard } from '@/components/recruiter/company-card';


export default async function DashboardPage() {
    const companies = await getCompanies();

    return (
        <div className="flex flex-1 flex-col gap-8 pt-6 pl-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
                    <p className="text-lg text-muted-foreground">Manage your career pages and job postings.</p>
                </div>
            </div>

            {companies.length === 0 ? (
                <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white/50 shadow-sm py-20">
                    <div className="flex flex-col items-center gap-2 text-center">
                        <h3 className="text-xl font-bold tracking-tight">No companies created</h3>
                        <p className="text-muted-foreground mb-6 max-w-sm">You have not created any companies yet. Get started by creating your first company.</p>
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
