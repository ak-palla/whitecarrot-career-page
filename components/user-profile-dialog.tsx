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
import { useState, useEffect } from 'react';
import { updateUserProfile } from '@/app/actions/user-profile';
import { useFormStatus } from 'react-dom';
import { User } from '@supabase/supabase-js';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

// Avatar options - paths to the avatar images
const AVATAR_OPTIONS = [
    '/avatars/avatar-1.svg',
    '/avatars/avatar-2.svg',
    '/avatars/avatar-3.svg',
    '/avatars/avatar-4.svg',
    '/avatars/avatar-5.svg',
    '/avatars/avatar-6.svg',
    '/avatars/avatar-7.svg',
    '/avatars/avatar-8.svg',
];

interface UserProfileDialogProps {
    user: User;
    children?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function UserProfileDialog({ user, children, open: controlledOpen, onOpenChange: controlledOnOpenChange }: UserProfileDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const router = useRouter();
    const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setOpen = controlledOnOpenChange || setInternalOpen;
    const [error, setError] = useState<string | null>(null);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState<string>('');

    // Initialize form with user data
    useEffect(() => {
        if (user && open) {
            const metadata = user.user_metadata || {};
            setFirstName(metadata.first_name || '');
            setLastName(metadata.last_name || '');
            setSelectedAvatar(metadata.avatar_url || '');
        }
    }, [user, open]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);

        // Client-side validation: at least one name field must be filled
        const firstNameTrimmed = firstName.trim();
        const lastNameTrimmed = lastName.trim();
        
        if (!firstNameTrimmed && !lastNameTrimmed) {
            setError('Please provide at least a first name or last name');
            return;
        }

        const result = await updateUserProfile({
            first_name: firstNameTrimmed,
            last_name: lastNameTrimmed,
            avatar_url: selectedAvatar || undefined,
        });

        if (result?.error) {
            setError(result.error);
        } else {
            setOpen(false);
            // Refresh to update the sidebar with new user metadata
            router.refresh();
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {children && controlledOpen === undefined && (
                <DialogTrigger asChild>
                    {children}
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                        Update your profile information. Email cannot be changed.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-6 py-4">
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                                id="firstName"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="John"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                                id="lastName"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Doe"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                value={user.email || ''}
                                disabled
                                className="bg-muted cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Avatar</Label>
                        <div className="grid grid-cols-4 gap-3">
                            {AVATAR_OPTIONS.map((avatarPath) => (
                                <button
                                    key={avatarPath}
                                    type="button"
                                    onClick={() => setSelectedAvatar(avatarPath)}
                                    className={cn(
                                        "relative aspect-square rounded-lg border-2 transition-all hover:scale-105",
                                        selectedAvatar === avatarPath
                                            ? "border-primary ring-2 ring-primary ring-offset-2"
                                            : "border-border hover:border-primary/50"
                                    )}
                                >
                                    <Image
                                        src={avatarPath}
                                        alt={`Avatar ${avatarPath}`}
                                        fill
                                        className="rounded-lg object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm text-center">{error}</p>
                    )}

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
    return (
        <Button type="submit" disabled={pending}>
            {pending ? 'Saving...' : 'Save Changes'}
        </Button>
    );
}
