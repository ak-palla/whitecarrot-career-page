'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { deleteCompany } from '@/app/actions/companies';
import { toast } from 'sonner';
import { useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface Company {
    id: string;
    name: string;
    slug: string;
}

export function CompanyCard({ company }: { company: Company }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);

    const handleDelete = async () => {
        const result = await deleteCompany(company.id);
        if (result?.error) {
            toast.error(result.error);
        } else if (result?.success) {
            setOpen(false);
            toast.success('Company deleted successfully');
            router.refresh();
        } else {
            toast.error('Failed to delete company. Please try again.');
        }
    };

    return (
        <div className="group relative">
            <Link href={`/${company.slug}/edit`}>
                <Card className="relative overflow-hidden transition-all hover:shadow-lg hover:border-primary/10 border-border/50 bg-white h-full group-hover:translate-y-[-2px]">
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-muted/20 opacity-0 transition-opacity group-hover:opacity-100" />
                    <CardHeader className="relative pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl font-bold tracking-tight">{company.name}</CardTitle>
                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/10">
                                Live
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="relative">
                        <p className="text-sm text-muted-foreground font-mono bg-muted/50 w-fit px-2 py-1 rounded-md">/{company.slug}</p>
                    </CardContent>
                </Card>
            </Link>

            <div className="absolute bottom-3 right-3 z-20 opacity-0 transition-opacity group-hover:opacity-100">
                <AlertDialog open={open} onOpenChange={setOpen}>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the company
                                <span className="font-semibold text-foreground"> {company.name} </span>
                                and all its data.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={(e: React.MouseEvent) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={(e: React.MouseEvent) => {
                                    e.stopPropagation();
                                    handleDelete();
                                }}
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}
