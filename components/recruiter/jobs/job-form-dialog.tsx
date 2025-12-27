'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RichTextEditor } from '../rich-text-editor';

export function JobFormDialog({ open, onOpenChange, onSubmit, initialData }: any) {
    const [title, setTitle] = useState(initialData?.title || '');
    const [location, setLocation] = useState(initialData?.location || '');
    const [type, setType] = useState(initialData?.job_type || 'full-time');
    const [description, setDescription] = useState(initialData?.description || '');
    const [requirements, setRequirements] = useState(initialData?.requirements || '');
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        await onSubmit({
            title,
            location,
            job_type: type,
            description,
            requirements
        });
        setSubmitting(false);
        onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] sm:max-h-[85vh] overflow-hidden flex flex-col max-w-[calc(100vw-2rem)] sm:max-w-2xl w-full">
                <DialogHeader className="px-1 sm:px-0">
                    <DialogTitle>{initialData ? 'Edit Job' : 'Create Job'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto px-1 sm:px-0 pb-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Job Title</Label>
                            <Input value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Senior Frontend Engineer" />
                        </div>
                        <div className="space-y-2">
                            <Label>Location</Label>
                            <Input value={location} onChange={e => setLocation(e.target.value)} required placeholder="e.g. Remote, New York" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Job Type</Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="full-time">Full Time</SelectItem>
                                <SelectItem value="part-time">Part Time</SelectItem>
                                <SelectItem value="contract">Contract</SelectItem>
                                <SelectItem value="internship">Internship</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <RichTextEditor content={description} onChange={setDescription} />
                    </div>
                    <div className="space-y-2">
                        <Label>Requirements (Optional)</Label>
                        <RichTextEditor content={requirements} onChange={setRequirements} />
                    </div>
                </form>
                <DialogFooter className="pt-4 sm:pt-2 px-1 sm:px-0 gap-2 sm:gap-0">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">Cancel</Button>
                    <Button onClick={handleSubmit} disabled={submitting} className="w-full sm:w-auto">{submitting ? 'Saving...' : 'Save Job'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
