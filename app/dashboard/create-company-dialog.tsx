'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createCompany } from '@/app/actions/companies';
import { useFormStatus } from 'react-dom';
import { companiesQueryKey } from '@/lib/hooks/use-companies';

export function CreateCompanyDialog({ children }: { children?: React.ReactNode }) {
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setError(null);
        const result = await createCompany(formData);
        if (result?.error) {
            setError(result.error);
        } else {
            // Invalidate companies cache so the list refreshes
            queryClient.invalidateQueries({ queryKey: companiesQueryKey });
            setOpen(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || <Button>Create Company</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Company</DialogTitle>
                    <DialogDescription>
                        Start building your career page. You can change settings later.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="Acme Inc."
                            className="col-span-3"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="slug" className="text-right">
                            Slug
                        </Label>
                        <Input
                            id="slug"
                            name="slug"
                            placeholder="acme-inc"
                            className="col-span-3"
                            required
                            pattern="[a-z0-9-]+"
                            title="Lowercase letters, numbers, and hyphens only"
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm col-span-4 text-center">{error}</p>}
                    <DialogFooter>
                        <SaveButton />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function SaveButton() {
    const { pending } = useFormStatus();
    return <Button type="submit" disabled={pending}>{pending ? 'Creating...' : 'Create'}</Button>;
}
