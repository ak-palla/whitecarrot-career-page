import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"


import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return redirect("/sign-in")
    }

    return (
        <SidebarProvider>
            <AppSidebar user={user} />
            <SidebarInset>
                <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
