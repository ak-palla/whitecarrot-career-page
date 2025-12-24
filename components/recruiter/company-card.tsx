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
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/484ab544-b3d3-4b34-9f57-5d089fceb6aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'career-page/components/recruiter/company-card.tsx:33',message:'handleDelete called from company card',data:{companyId:company.id,companyName:company.name},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A,F,G'})}).catch(()=>{});
        // #endregion

        const result = await deleteCompany(company.id);

        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/484ab544-b3d3-4b34-9f57-5d089fceb6aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'career-page/components/recruiter/company-card.tsx:39',message:'deleteCompany result received',data:{companyId:company.id,result:JSON.stringify(result)},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A,F,G'})}).catch(()=>{});
        // #endregion

        if (result?.error) {
            // #region agent log
            fetch('http://127.0.0.1:7244/ingest/484ab544-b3d3-4b34-9f57-5d089fceb6aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'career-page/components/recruiter/company-card.tsx:44',message:'Showing error toast',data:{companyId:company.id,error:result.error},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            toast.error(result.error);
        } else if (result?.success) {
            // #region agent log
            fetch('http://127.0.0.1:7244/ingest/484ab544-b3d3-4b34-9f57-5d089fceb6aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'career-page/components/recruiter/company-card.tsx:48',message:'Showing success toast and refreshing',data:{companyId:company.id},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'F'})}).catch(()=>{});
            // #endregion
            setOpen(false);
            toast.success('Company deleted successfully');
            router.refresh();
        } else {
            // #region agent log
            fetch('http://127.0.0.1:7244/ingest/484ab544-b3d3-4b34-9f57-5d089fceb6aa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'career-page/components/recruiter/company-card.tsx:55',message:'Showing generic error toast',data:{companyId:company.id,result:JSON.stringify(result)},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            toast.error('Failed to delete company. Please try again.');
        }
    };

    return (
        <div className="group relative">
            <Link href={`/${company.slug}/edit`}>
                <Card className="relative overflow-hidden transition-all hover:shadow-md hover:border-primary/20 cursor-pointer h-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-muted/50 opacity-0 transition-opacity group-hover:opacity-100" />
                    <CardHeader className="relative">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{company.name}</CardTitle>
                            <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                Live
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="relative">
                        <p className="text-sm text-muted-foreground font-mono">/{company.slug}</p>
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
