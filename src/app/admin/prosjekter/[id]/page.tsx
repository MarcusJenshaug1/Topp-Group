import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { ProjectEditForm } from "@/components/admin/project-edit-form"
import { Badge } from "@/components/ui/badge"

// Define Params as a Promise type to satisfy Next.js 15+ requirements
type Params = Promise<{ id: string }>

export default async function EditProjectPage(props: { params: Params }) {
    const params = await props.params
    const supabase = await createClient()

    // 1. Fetch Project
    const { data: project } = await supabase
        .from('projects')
        .select('*, created_by_profiles:profiles!projects_created_by_fkey(full_name, display_name, email), updated_by_profiles:profiles!projects_updated_by_fkey(full_name, display_name, email)')
        .eq('id', params.id)
        .single()

    if (!project) {
        notFound()
    }

    // 2. Fetch Categories for the dropdown
    const { data: categories } = await supabase
        .from('project_categories')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true })

    const { data: authors } = await supabase
        .from('profiles')
        .select('id, full_name, display_name, email')
        .in('role', ['admin', 'editor'])
        .order('display_name', { ascending: true })

    const { data: revisions } = await supabase
        .from('project_revisions')
        .select('id, action, payload, created_at, user:profiles(display_name, email)')
        .eq('project_id', params.id)
        .order('created_at', { ascending: false })
        .limit(10)

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/prosjekter">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight">Rediger prosjekt</h1>
                    <p className="text-sm text-muted-foreground">Oppdater informasjon og last opp bilder.</p>
                </div>
            </div>

            <ProjectEditForm project={project} categories={categories || []} authors={authors || []} />

            <div className="rounded-xl border bg-surface p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium">Historikk</p>
                        <p className="text-xs text-muted-foreground">Sist endret av {project.updated_by_profiles?.full_name || project.updated_by_profiles?.display_name || project.updated_by_profiles?.email || 'ukjent'}</p>
                    </div>
                    <Badge variant="secondary" className="bg-surface-muted text-muted-foreground">Maks 10 siste</Badge>
                </div>
                <div className="divide-y">
                    {(revisions || []).length === 0 ? (
                        <p className="py-3 text-sm text-muted-foreground">Ingen revisjoner enda.</p>
                    ) : (
                        (revisions || []).map((rev) => {
                            const revUser = (Array.isArray(rev.user) ? rev.user[0] : rev.user) as any
                            return (
                                <div key={rev.id} className="py-3 text-sm">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="capitalize">{rev.action}</Badge>
                                            <span className="text-muted-foreground text-xs">{revUser?.full_name || revUser?.display_name || revUser?.email || 'ukjent'}</span>
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(rev.created_at).toLocaleString('no-NO', { dateStyle: 'short', timeStyle: 'short' })}
                                        </span>
                                    </div>
                                    {rev.payload && (
                                        <p className="text-xs text-muted-foreground mt-1 truncate">{JSON.stringify(rev.payload)}</p>
                                    )}
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    )
}
