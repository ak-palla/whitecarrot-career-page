'use client';

import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Loader2, UploadCloud } from 'lucide-react';

interface JobApplicationModalProps {
    job: any;
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function JobApplicationModal({ job, trigger, open, onOpenChange }: JobApplicationModalProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Controlled internal state if not controlled externally
    const show = open !== undefined ? open : isOpen;
    const setShow = onOpenChange || setIsOpen;

    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const formRef = useRef<HTMLFormElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.type !== 'application/pdf') {
                toast.error('Only PDF files are allowed');
                return;
            }
            if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error('File size must be less than 5MB');
                return;
            }
            setFile(selectedFile);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData(e.currentTarget);
            const firstName = formData.get('first_name') as string;
            const lastName = formData.get('last_name') as string;
            const linkedinUrl = formData.get('linkedin_url') as string;
            const email = formData.get('email') as string;

            if (!file) {
                toast.error('Please upload your resume');
                setLoading(false);
                return;
            }

            const supabase = createClient();

            // 1. Upload Resume
            const fileExt = 'pdf';
            const fileName = `${job.id}/${Date.now()}_${firstName}_${lastName}.${fileExt}`;
            const { error: uploadError, data: uploadData } = await supabase.storage
                .from('resumes')
                .upload(fileName, file);

            if (uploadError) {
                console.error('Upload Error:', uploadError);
                throw new Error('Failed to upload resume. Please try again.');
            }

            // Get public URL (or just store path if bucket is private, but for now we used public/authenticated reads)
            // Ideally we store the full path or URL. Let's store the full path relative to bucket.
            const resumePath = uploadData.path;

            // Get public URL for valid reference if needed, but usually we just need the path to download later
            // const { data: { publicUrl } } = supabase.storage.from('resumes').getPublicUrl(resumePath);


            // 2. Insert Application
            const { error: insertError } = await supabase
                .from('applications')
                .insert({
                    job_id: job.id,
                    first_name: firstName,
                    last_name: lastName,
                    linkedin_url: linkedinUrl,
                    email: email,
                    resume_url: resumePath, // Storing path in bucket
                    status: 'new'
                });

            if (insertError) {
                console.error('Insert Error:', insertError);
                throw new Error('Failed to submit application.');
            }

            toast.success('Application submitted successfully!');
            setShow(false);
            setFile(null);
            formRef.current?.reset();

        } catch (error: any) {
            toast.error(error.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={show} onOpenChange={setShow}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Apply for {job.title}</DialogTitle>
                    <DialogDescription>
                        {job.location} • {job.employment_type}
                    </DialogDescription>
                </DialogHeader>

                <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="first_name">First Name</Label>
                            <Input id="first_name" name="first_name" required placeholder="Jane" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="last_name">Last Name</Label>
                            <Input id="last_name" name="last_name" required placeholder="Doe" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" required placeholder="jane@example.com" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                        <Input id="linkedin_url" name="linkedin_url" type="url" required placeholder="https://linkedin.com/in/..." />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="resume">Resume (PDF)</Label>
                        <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors relative">
                            <input
                                type="file"
                                id="resume"
                                accept=".pdf"
                                onChange={handleFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            {file ? (
                                <div className="text-sm font-medium text-emerald-600 flex items-center gap-2">
                                    <span className="truncate max-w-[200px]">{file.name}</span>
                                    <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => {
                                        e.preventDefault();
                                        setFile(null);
                                    }}>
                                        ×
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
                                    <p className="text-sm text-muted-foreground">Click or drag PDF to upload</p>
                                    <span className="text-xs text-muted-foreground mt-1">Max 5MB</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setShow(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit Application
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
