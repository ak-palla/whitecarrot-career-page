'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { deleteCompany } from '@/app/actions/companies';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export function CompanySettings({ company }: { company: any }) {
    const [name, setName] = useState(company.name);
    const [saving, setSaving] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const router = useRouter();

    async function handleSave() {
        setSaving(true);
        // Call update company action (not implemented yet, but let's assume it exists or just log)
        // const res = await updateCompany(company.id, { name });
        // if (res.error) alert(res.error);

        // Simulating for now as action isn't strictly required by task list
        setTimeout(() => setSaving(false), 500);
        toast.info("Save functionality not fully implemented yet");
    }

    async function handleDelete() {
        const res = await deleteCompany(company.id);
        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success('Company deleted');
            router.push('/dashboard');
            router.refresh();
        }
    }

    return (
        <div className="space-y-6 ">
            <h2 className="text-lg font-semibold">General Settings</h2>

            <Card>
                <CardHeader>
                    <CardTitle>Company Details</CardTitle>
                    <CardDescription>Update your company information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Company Name</Label>
                        <Input value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Slug (URL)</Label>
                        <Input value={company.slug} disabled className="bg-muted" />
                        <p className="text-xs text-muted-foreground">Slug cannot be changed once created.</p>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSave} disabled={saving}>Save Changes</Button>
                </CardFooter>
            </Card>

            <Card className="border-red-200">
                <CardHeader>
                    <CardTitle className="text-red-500">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Deleting your company will remove all career pages and job listings. This action cannot be undone.</p>
                </CardContent>
                <CardFooter>
                    <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">Delete Company</Button>
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
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={handleDelete}
                                >
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardFooter>
            </Card>
        </div>
    )
}
