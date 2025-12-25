"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { LogOut, User as UserIcon } from "lucide-react"
import { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { UserProfileDialog } from "@/components/user-profile-dialog"

interface DashboardNavbarProps {
    user: User
}

export function DashboardNavbar({ user }: DashboardNavbarProps) {
    const router = useRouter()
    const [profileDialogOpen, setProfileDialogOpen] = React.useState(false)

    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push("/sign-in")
        router.refresh()
    }

    const { email, user_metadata } = user
    const avatarUrl = user_metadata?.avatar_url

    // Get first and last name, with fallback to full_name or email
    const firstName = user_metadata?.first_name || ''
    const lastName = user_metadata?.last_name || ''
    const fullName = user_metadata?.full_name || ''

    let displayName = ''
    if (firstName && lastName) {
        displayName = `${firstName} ${lastName}`
    } else if (firstName) {
        displayName = firstName
    } else if (lastName) {
        displayName = lastName
    } else if (fullName) {
        displayName = fullName
    } else {
        displayName = email?.split("@")[0] || "User"
    }

    const initials = displayName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center px-6 max-w-5xl mx-auto">
                <div className="mr-8 flex items-center gap-2">
                    <Link href="/dashboard" className="flex items-center gap-2 font-medium">
                        <div className="flex h-6 w-6 items-center justify-center">
                            <Image
                                src="/tie.png"
                                alt="Company Logo"
                                width={24}
                                height={24}
                                className="h-6 w-6 object-contain"
                            />
                        </div>
                        Lisco
                    </Link>
                </div>

                <div className="ml-auto flex items-center gap-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={avatarUrl} alt={displayName} />
                                    <AvatarFallback>{initials}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <div className="flex items-center justify-start gap-2 p-2">
                                <div className="flex flex-col space-y-1 leading-none">
                                    <p className="font-medium">{displayName}</p>
                                    <p className="w-[200px] truncate text-xs text-muted-foreground">
                                        {email}
                                    </p>
                                </div>
                            </div>
                            <DropdownMenuItem onSelect={(e) => {
                                e.preventDefault()
                                setProfileDialogOpen(true)
                            }}>
                                <UserIcon className="mr-2 h-4 w-4" />
                                <span>Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleSignOut}>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <UserProfileDialog
                        user={user}
                        open={profileDialogOpen}
                        onOpenChange={setProfileDialogOpen}
                    />
                </div>
            </div>
        </header>
    )
}
