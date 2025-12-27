'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Trash2, Share2, Check, Loader2 } from 'lucide-react';
import { deleteCompany } from '@/app/actions/companies';
import { toast } from 'sonner';
import { useState } from 'react';
import { useNavigationLoading } from './navigation-loading-context';
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
    logo_url?: string | null;
}

export function CompanyCard({ company }: { company: Company }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const { setNavigating } = useNavigationLoading();

    const handleDelete = async () => {
        setDeleting(true);
        try {
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
        } finally {
            setDeleting(false);
        }
    };

    const handleCopyLink = async () => {
        const publicUrl = `${window.location.origin}/${company.slug}/careers`;
        try {
            await navigator.clipboard.writeText(publicUrl);
            setLinkCopied(true);
            toast.success('Link copied to clipboard');
            setTimeout(() => setLinkCopied(false), 2000);
        } catch (error) {
            toast.error('Failed to copy link');
        }
    };

    const handleCardClick = (e: React.MouseEvent) => {
        // Don't navigate if clicking on action buttons or dialogs
        if (
            (e.target as HTMLElement).closest('button') || 
            (e.target as HTMLElement).closest('[role="dialog"]') ||
            (e.target as HTMLElement).closest('[role="alertdialog"]')
        ) {
            return;
        }
        setNavigating(true);
        router.push(`/${company.slug}/edit`);
    };

    return (
        <div className="group relative">
                <Card className="relative overflow-hidden transition-all hover:shadow-lg hover:border-primary/10 border-border/50 bg-white h-full group-hover:translate-y-[-2px]">
                    <div 
                        onClick={handleCardClick}
                        className="block cursor-pointer"
                    >
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-muted/20 opacity-0 transition-opacity group-hover:opacity-100" />
                    <CardHeader className="relative pb-2">
                        <div className="flex items-center gap-2">
                            {company.logo_url && company.logo_url.trim() !== '' && (
                                <img 
                                    src={company.logo_url} 
                                    alt={`${company.name} logo`}
                                    className="h-6 w-6 object-contain"
                                    onError={(e) => {
                                        // Hide image if it fails to load
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            )}
                            <CardTitle className="text-xl font-bold tracking-tight">{company.name}</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="relative">
                        <p className="text-sm text-muted-foreground font-mono bg-muted/50 w-fit px-2 py-1 rounded-md">/{company.slug}</p>
                    </CardContent>
                </div>
                
                <div className="absolute bottom-3 right-6 z-50 opacity-0 transition-opacity group-hover:opacity-100 flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleCopyLink}
                        className="h-8 w-8 border-0"
                        title={linkCopied ? 'Copied!' : 'Share'}
                    >
                        {linkCopied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                    </Button>
                    <AlertDialog open={open} onOpenChange={setOpen}>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the company
                                    <span className="font-semibold text-foreground"> {company.name} </span>
                                    and all its data.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={handleDelete}
                                    disabled={deleting}
                                >
                                    {deleting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        'Delete'
                                    )}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </Card>
        </div>
    );
}
