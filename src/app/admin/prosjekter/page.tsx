import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash, LayoutGrid, Rows } from "lucide-react"
import { FilterControls } from "@/components/admin/projects-filters"

const PAGE_SIZE = 12
const statusOptions = [
    { value: "", label: "Alle statuser" },
    { value: "published", label: "Publisert" },
    { value: "draft", label: "Kladd" },
    { value: "archived", label: "Arkivert" },
]

type SearchParams = Promise<{
    q?: string
    status?: string
    category?: string
    view?: string
    page?: string
}>

export default async function AdminProjectsPage({ searchParams }: { searchParams: SearchParams }) {
    const params = await searchParams
    const supabase = await createClient()

    const search = params.q?.trim() || ""
    const status = params.status || ""
    const category = params.category || ""
    const view = params.view === "grid" ? "grid" : "table"
    const currentPage = Math.max(parseInt(params.page || "1", 10) || 1, 1)
    const offset = (currentPage - 1) * PAGE_SIZE

    const { data: categories } = await supabase
        .from('project_categories')
        .select('id, name')
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true })

    let query = supabase
        .from('projects')
        .select('*, project_categories(name), created_by_profiles:profiles!projects_created_by_fkey(full_name, display_name, email), updated_by_profiles:profiles!projects_updated_by_fkey(full_name, display_name, email)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1)

    if (search) {
        const like = `%${search}%`
        query = query.or(`title.ilike.${like},excerpt.ilike.${like},slug.ilike.${like}`)
    }

    if (status) {
        query = query.eq('status', status)
    }

    if (category) {
        query = query.eq('category_id', category)
    }

    let { data: projects, count, error } = await query
    if (error) {
        console.error('Failed to fetch projects (with joins), retrying without author joins', error)
        const fallback = await supabase
            .from('projects')
            .select('*, project_categories(name)', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + PAGE_SIZE - 1)
        projects = fallback.data || []
        count = fallback.count || 0
        error = fallback.error || null
        if (fallback.error) {
            console.error('Fallback fetch also failed', fallback.error)
        }
    }

    const total = count || 0
    const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1)

    const buildQuery = (overrides: Record<string, string | number | undefined>) => {
        const sp = new URLSearchParams()
        if (search) sp.set('q', search)
        if (status) sp.set('status', status)
        if (category) sp.set('category', category)
        if (view) sp.set('view', view)
        Object.entries(overrides).forEach(([key, value]) => {
            if (value === undefined || value === "") return
            sp.set(key, String(value))
        })
        return `/admin/prosjekter${sp.toString() ? `?${sp.toString()}` : ""}`
    }

    const statusBadge = (value: string) => {
        if (value === 'published') return <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">Publisert</Badge>
        if (value === 'draft') return <Badge variant="outline" className="text-amber-600 bg-amber-50 border-amber-200">Kladd</Badge>
        return <Badge variant="outline" className="text-muted-foreground bg-surface-muted border-border/60">{value}</Badge>
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight">Prosjekter</h1>
                    <p className="text-sm text-muted-foreground">Søk, filtrer, paginer og velg visning.</p>
                </div>
                <Link href="/admin/prosjekter/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Nytt prosjekt
                    </Button>
                </Link>
            </div>

            <FilterControls
                search={search}
                status={status}
                category={category}
                view={view}
                categories={categories || []}
                total={total}
            />

            {error ? (
                <div className="rounded-xl border bg-surface p-12 text-center text-destructive shadow-sm">
                    Klarte ikke hente prosjekter: {error.message}
                </div>
            ) : (!projects || projects.length === 0) ? (
                <div className="rounded-xl border bg-surface p-12 text-center text-muted-foreground shadow-sm">
                    Ingen prosjekter funnet. Juster filtre eller opprett et nytt prosjekt.
                </div>
            ) : view === 'table' ? (
                <div className="rounded-xl border bg-surface shadow-sm overflow-hidden">
                    <div className="grid grid-cols-12 bg-surface-muted/50 px-4 py-3 text-sm font-medium text-muted-foreground">
                        <div className="col-span-5 sm:col-span-6">Prosjekt</div>
                        <div className="col-span-3 sm:col-span-2">Kategori</div>
                        <div className="col-span-2 sm:col-span-2">Status</div>
                        <div className="col-span-2 text-right">Handling</div>
                    </div>
                    {projects.map((project: any) => (
                        <div key={project.id} className="grid grid-cols-12 items-center gap-3 px-4 py-4 border-b last:border-0 hover:bg-surface-muted/30 transition-colors">
                            <div className="col-span-5 sm:col-span-6 flex items-center gap-3">
                                <div className="relative h-12 w-16 overflow-hidden rounded-md bg-muted flex-shrink-0">
                                    {project.cover_image_path ? (
                                        <Image
                                            src={project.cover_image_path.startsWith('http') ? project.cover_image_path : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/toppgroup/${project.cover_image_path}`}
                                            alt={project.title}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-[11px] text-muted-foreground">Ingen bilde</div>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <div className="font-medium text-foreground">{project.title}</div>
                                    <div className="text-xs text-muted-foreground">{project.slug}</div>
                                    <div className="text-[11px] text-muted-foreground">Av {project.created_by_profiles?.full_name || project.created_by_profiles?.display_name || project.created_by_profiles?.email || 'ukjent'} · Endret av {project.updated_by_profiles?.full_name || project.updated_by_profiles?.display_name || project.updated_by_profiles?.email || 'ukjent'}</div>
                                </div>
                            </div>
                            <div className="col-span-3 sm:col-span-2">
                                <Badge variant="secondary" className="bg-surface-muted text-muted-foreground">{project.project_categories?.name || 'Ukjent'}</Badge>
                            </div>
                            <div className="col-span-2 sm:col-span-2 text-sm">
                                {statusBadge(project.status)}
                            </div>
                            <div className="col-span-2 flex justify-end gap-2">
                                <Link href={`/admin/prosjekter/${project.id}`}>
                                    <Button variant="ghost" size="icon" className="hover:bg-surface-muted hover:text-primary">
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                </Link>
                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(320px,1fr))]">
                    {projects.map((project: any) => (
                        <div key={project.id} className="group rounded-xl border bg-surface shadow-sm overflow-hidden hover:border-primary/30">
                            <div className="relative h-44 w-full bg-muted">
                                {project.cover_image_path ? (
                                    <Image
                                        src={project.cover_image_path.startsWith('http') ? project.cover_image_path : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/toppgroup/${project.cover_image_path}`}
                                        alt={project.title}
                                        fill
                                        className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">Ingen bilde</div>
                                )}
                                <div className="absolute top-3 left-3 flex gap-2">
                                    <Badge variant="secondary" className="bg-white/90 backdrop-blur text-foreground shadow">{project.project_categories?.name || 'Ukjent'}</Badge>
                                    {statusBadge(project.status)}
                                </div>
                            </div>
                            <div className="p-4 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <h3 className="font-semibold leading-tight">{project.title}</h3>
                                        <p className="text-xs text-muted-foreground">{project.slug}</p>
                                        <p className="text-[11px] text-muted-foreground mt-1">Av {project.created_by_profiles?.full_name || project.created_by_profiles?.display_name || project.created_by_profiles?.email || 'ukjent'} · Endret av {project.updated_by_profiles?.full_name || project.updated_by_profiles?.display_name || project.updated_by_profiles?.email || 'ukjent'}</p>
                                    </div>
                                    <Link href={`/admin/prosjekter/${project.id}`}>
                                        <Button size="sm" variant="outline">Rediger</Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex items-center justify-between gap-3 rounded-xl border bg-surface p-3 shadow-sm">
                <div className="text-sm text-muted-foreground">Side {currentPage} av {totalPages}</div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild disabled={currentPage <= 1}>
                        <Link href={buildQuery({ page: Math.max(currentPage - 1, 1) })}>Forrige</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild disabled={currentPage >= totalPages}>
                        <Link href={buildQuery({ page: Math.min(currentPage + 1, totalPages) })}>Neste</Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
