import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Building, FileText, Settings, LogOut, Users } from "lucide-react";

export const metadata: Metadata = {
    title: "Admin - Topp Group",
    description: "Administrasjonspanel",
    robots: "noindex, nofollow"
};

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/portal/login")
    }

    // Check role here if custom claims or DB query
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

    if (profile && !['admin', 'editor'].includes(profile.role)) {
        redirect("/portal") // Not authorized for admin
    }

    return (
        <div className="flex min-h-screen flex-col">
            <header className="border-b bg-muted/40 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-lg">
                    <span className="text-primary">Topp Group</span>
                    <span className="text-muted-foreground">Admin</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground hidden sm:inline-block">{user.email}</span>
                    <Link href="/">
                        <Button variant="ghost" size="sm">Til nettsiden</Button>
                    </Link>
                </div>
            </header>
            <div className="flex-1 flex flex-col md:flex-row">
                <aside className="w-full md:w-64 border-r bg-muted/10 p-4 space-y-2">
                    <Link href="/admin">
                        <Button variant="ghost" className="w-full justify-start">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            Oversikt
                        </Button>
                    </Link>
                    <Link href="/admin/prosjekter">
                        <Button variant="ghost" className="w-full justify-start">
                            <Building className="mr-2 h-4 w-4" />
                            Prosjekter
                        </Button>
                    </Link>
                    <Link href="/admin/dokumenter">
                        <Button variant="ghost" className="w-full justify-start">
                            <FileText className="mr-2 h-4 w-4" />
                            Dokumenter
                        </Button>
                    </Link>
                    <Link href="/admin/brukere">
                        <Button variant="ghost" className="w-full justify-start">
                            <Users className="mr-2 h-4 w-4" />
                            Brukere
                        </Button>
                    </Link>
                    <Link href="/admin/innstillinger">
                        <Button variant="ghost" className="w-full justify-start">
                            <Settings className="mr-2 h-4 w-4" />
                            Innstillinger
                        </Button>
                    </Link>
                    <div className="pt-4 mt-auto">
                        <form action="/auth/signout" method="post">
                            <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
                                <LogOut className="mr-2 h-4 w-4" />
                                Logg ut
                            </Button>
                        </form>
                    </div>
                </aside>
                <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
