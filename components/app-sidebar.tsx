"use client"

import * as React from "react"
import Image from "next/image"
import { Calendar, Home, Inbox, Search, Plus, Briefcase, ChevronsUpDown, LogOut, User as UserIcon } from "lucide-react"
import { UserProfileDialog } from "@/components/user-profile-dialog"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarHeader,
    SidebarFooter,
    useSidebar,
} from "@/components/ui/sidebar"
import { CreateCompanyDialog } from "@/app/dashboard/create-company-dialog"
import { User } from "@supabase/supabase-js"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

// Menu items.
const items = [
    {
        title: "Companies",
        url: "/dashboard",
        icon: Home,
    },
]

export function AppSidebar({ user, ...props }: React.ComponentProps<typeof Sidebar> & { user: User }) {
    const { isMobile } = useSidebar()
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
        <Sidebar {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <a href="/dashboard">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                                    <Image
                                        src="/tie.png"
                                        alt="Lisco Logo"
                                        width={24}
                                        height={24}
                                        className="h-6 w-6 object-contain"
                                    />
                                </div>
                                <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
                                    <span className="font-bold tracking-tight text-base">Lisco</span>
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Actions</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <CreateCompanyDialog>
                                    <SidebarMenuButton tooltip="Create Company">
                                        <Plus />
                                        <span>Create Company</span>
                                    </SidebarMenuButton>
                                </CreateCompanyDialog>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarImage src={avatarUrl} alt={displayName} />
                                        <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                                        <span className="truncate font-semibold">{displayName}</span>
                                        <span className="truncate text-xs">{email}</span>
                                    </div>
                                    <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                                side={isMobile ? "bottom" : "right"}
                                align="end"
                                sideOffset={4}
                            >
                                <DropdownMenuItem onSelect={(e) => {
                                    e.preventDefault()
                                    setProfileDialogOpen(true)
                                }}>
                                    <UserIcon />
                                    Profile
                                </DropdownMenuItem>
                                <UserProfileDialog 
                                    user={user} 
                                    open={profileDialogOpen}
                                    onOpenChange={setProfileDialogOpen}
                                />
                                <DropdownMenuItem onClick={handleSignOut}>
                                    <LogOut />
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
