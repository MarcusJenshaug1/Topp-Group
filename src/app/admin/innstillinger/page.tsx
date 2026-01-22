import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Container } from "@/components/ui/container"

export default async function AdminSettingsPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/portal/login")
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

    if (!profile || profile.role !== "admin") {
        redirect("/admin")
    }

    return (
        <Container className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Innstillinger</h1>
                <p className="text-muted-foreground">Basisinnstillinger for administrasjon.</p>
            </div>

            <div className="rounded-xl border border-border bg-surface p-6 text-sm text-muted-foreground">
                Innstillinger er under oppsett. Dette området er klart for videre konfigurasjon.
            </div>
        </Container>
    )
}
