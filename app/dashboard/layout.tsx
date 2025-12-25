import { DashboardNavbar } from "@/components/dashboard-navbar"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    try {
        const supabase = await createClient()

        const {
            data: { user },
            error: authError
        } = await supabase.auth.getUser()

        if (authError) {
            console.error('Auth error in dashboard layout:', authError);
            redirect("/auth/login")
        }

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
    } catch (error) {
        console.error('Error in dashboard layout:', error);
        // Re-throw to let error.tsx handle it
        throw error;
    }
}
