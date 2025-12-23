import { getCompanies } from '@/app/actions/companies';
import { CreateCompanyDialog } from './create-company-dialog';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function DashboardPage() {
    const companies = await getCompanies();

    return (
        <div className="flex flex-1 flex-col gap-8">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">Your Companies</h1>
                    <p className="text-sm text-muted-foreground">Manage your career pages and job postings.</p>
                </div>
                {/* Create Dialog on top right as well, for convenience */}
                <CreateCompanyDialog />
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
                        <Link key={company.id} href={`/${company.slug}/edit`}>
                            <Card className="group relative overflow-hidden transition-all hover:shadow-md hover:border-primary/20 cursor-pointer">
                                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-muted/50 opacity-0 transition-opacity group-hover:opacity-100" />
                                <CardHeader className="relative">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">{company.name}</CardTitle>
                                        <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Live</span>
                                    </div>
                                </CardHeader>
                                <CardContent className="relative">
                                    <p className="text-sm text-muted-foreground font-mono">/{company.slug}</p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
