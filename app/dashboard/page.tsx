import { getCompanies } from '@/app/actions/companies';
import { CreateCompanyDialog } from './create-company-dialog';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function DashboardPage() {
    const companies = await getCompanies();

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Your Companies</h1>
                    <p className="text-muted-foreground mt-2">Manage your career pages and job postings.</p>
                </div>
                <CreateCompanyDialog />
            </div>

            {companies.length === 0 ? (
                <div className="text-center py-20 border rounded-lg bg-gray-50 border-dashed">
                    <h2 className="text-xl font-semibold mb-2">No companies yet</h2>
                    <p className="text-muted-foreground mb-4">Create your first company to get started.</p>
                    {/* The dialog button is already above, but we could put one here too if we wanted contextually. */}
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {companies.map((company) => (
                        <Link key={company.id} href={`/${company.slug}/edit`}>
                            <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                                <CardHeader>
                                    <CardTitle>{company.name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">/{company.slug}</p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
