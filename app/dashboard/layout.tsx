import { DashboardNavbar } from "@/components/dashboard-navbar"
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
        redirect("/auth/login")
    }

    return (
        <div className="min-h-screen bg-muted-cream">
            <DashboardNavbar user={user} />
            <main className="mx-auto max-w-5xl p-6">
                {children}
            </main>
        </div>
    )
}
