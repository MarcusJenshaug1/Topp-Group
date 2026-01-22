import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Reveal } from "@/components/motion/reveal"
import { Building, FileText, Users, Activity } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export default async function AdminDashboardPage() {
    const supabase = await createClient()
    const since = new Date()
    since.setDate(since.getDate() - 30)

    const [projectsCount, documentsCount, usersCount, activityCount] = await Promise.all([
        supabase.from("projects").select("id", { count: "exact", head: true }),
        supabase.from("documents").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("documents").select("id", { count: "exact", head: true }).gte("created_at", since.toISOString()),
    ])

    const totalProjects = projectsCount.count ?? 0
    const totalDocuments = documentsCount.count ?? 0
    const totalUsers = usersCount.count ?? 0
    const recentActivity = activityCount.count ?? 0
    return (
        <div className="space-y-8">
            <Reveal variant="fadeUp">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Oversikt</h1>
                    <p className="text-muted-foreground">Velkommen tilbake til administrasjonpanelet.</p>
                </div>
            </Reveal>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Reveal variant="fadeUp" index={0} stagger={50}>
                    <Card className="motion-card bg-surface shadow-sm hover:shadow-md hover:-translate-y-0.5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Totalt Prosjekter</CardTitle>
                        <Building className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalProjects}</div>
                        <p className="text-xs text-muted-foreground">Totalt registrert</p>
                    </CardContent>
                    </Card>
                </Reveal>
                <Reveal variant="fadeUp" index={1} stagger={50}>
                    <Card className="motion-card bg-surface shadow-sm hover:shadow-md hover:-translate-y-0.5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Aktive Dokumenter</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalDocuments}</div>
                        <p className="text-xs text-muted-foreground">Totalt tilgjengelig</p>
                    </CardContent>
                    </Card>
                </Reveal>
                <Reveal variant="fadeUp" index={2} stagger={50}>
                    <Card className="motion-card bg-surface shadow-sm hover:shadow-md hover:-translate-y-0.5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Brukere</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalUsers}</div>
                        <p className="text-xs text-muted-foreground">Registrerte kontoer</p>
                    </CardContent>
                    </Card>
                </Reveal>
                <Reveal variant="fadeUp" index={3} stagger={50}>
                    <Card className="motion-card bg-surface shadow-sm hover:shadow-md hover:-translate-y-0.5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Aktivitet</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{recentActivity}</div>
                        <p className="text-xs text-muted-foreground">Nye dokumenter siste 30 dager</p>
                    </CardContent>
                    </Card>
                </Reveal>
            </div>
        </div>
    )
}
