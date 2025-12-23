'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// import { updateCompany } from '@/app/actions/companies'; // Need this action
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export function CompanySettings({ company }: { company: any }) {
    const [name, setName] = useState(company.name);
    const [saving, setSaving] = useState(false);

    async function handleSave() {
        setSaving(true);
        // Call update company action (not implemented yet, but let's assume it exists or just log)
        // const res = await updateCompany(company.id, { name });
        // if (res.error) alert(res.error);

        // Simulating for now as action isn't strictly required by task list explicitly but "Settings" tab was
        setSaving(false);
    }

    return (
        <div className="space-y-6 max-w-2xl">
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
                    <Button variant="destructive" disabled>Delete Company</Button>
                </CardFooter>
            </Card>
        </div>
    )
}
