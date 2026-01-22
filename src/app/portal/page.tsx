import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Container } from "@/components/ui/container"
import { Button } from "@/components/ui/button"
import { DocumentList } from "@/components/domain/document-list"
import { Reveal } from "@/components/motion/reveal"
import { LogOut, FilePlus2, FolderPlus, UserPlus, Shield, Clock3, FileText } from "lucide-react"
import Link from "next/link"

export default async function PortalPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return redirect("/portal/login")
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single()

    const role = profile?.role ?? "viewer"
    const isPrivileged = ["admin", "editor"].includes(role)
    const displayName = profile?.full_name
        || user.user_metadata?.full_name
        || user.user_metadata?.name
        || user.email?.split("@")[0]
        || "bruker"

    const documentsQuery = supabase
        .from("documents")
        .select("*, document_categories(name)")
        .order("created_at", { ascending: false })

    const { data: documents } = isPrivileged
        ? await documentsQuery
        : await documentsQuery.eq("visibility", "authenticated")

    type DocumentVersion = {
        id: string
        document_id: string
        version_label: string
        title: string
        file_path: string
        file_name: string
        mime_type: string | null
        description: string | null
        created_at: string
    }

    const documentIds = documents?.map((doc) => doc.id) ?? []

    const { data: versions } = documentIds.length
        ? await supabase
            .from("document_versions")
            .select("id, document_id, version_label, title, file_path, file_name, mime_type, description, created_at")
            .in("document_id", documentIds)
            .order("created_at", { ascending: false })
        : { data: [] }

    const versionsByDocument = (versions || []).reduce<Record<string, DocumentVersion[]>>((acc, version) => {
        if (!acc[version.document_id]) acc[version.document_id] = []
        acc[version.document_id].push(version)
        return acc
    }, {})

    const documentsWithVersions = (documents || []).map((doc) => ({
        ...doc,
        versions: versionsByDocument[doc.id] || [],
    }))

    const { data: categories } = await supabase
        .from("document_categories")
        .select("id, name")
        .order("sort_order")

    const lastUpdated = documents?.[0]?.created_at ?? null

    const quickActions = [
        {
            title: "Nytt dokument",
            href: "/admin/dokumenter/upload",
            description: "Last opp filer til dokumentportalen",
            icon: FilePlus2,
        },
        {
            title: "Nytt prosjekt",
            href: "/admin/prosjekter/new",
            description: "Opprett et nytt prosjektkort",
            icon: FolderPlus,
        },
        {
            title: "Ny bruker",
            href: "/admin/brukere",
            description: "Inviter en kollega eller kunde",
            icon: UserPlus,
        },
    ]

    const statItems = [
        {
            label: "Dokumenter",
            value: documents?.length ?? 0,
            hint: "Tilgjengelig for deg",
            icon: FileText,
        },
        {
            label: "Rolle",
            value: role === "viewer" ? "Bruker" : role === "editor" ? "Editor" : "Admin",
            hint: "Styrer rettigheter",
            icon: Shield,
        },
        {
            label: "Oppdatert",
            value: lastUpdated ? new Date(lastUpdated).toLocaleDateString("no-NO") : "-",
            hint: "Siste publisering",
            icon: Clock3,
        },
    ]

    return (
        <div className="py-10">
            <Container className="space-y-8">
                <Reveal variant="fadeUp">
                    <div className="rounded-3xl border border-border/60 bg-gradient-to-br from-surface to-surface/60 p-6 md:p-8 shadow-sm">
                        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                            <div className="space-y-2">
                                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Dokumentportal</p>
                                <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Hei, {displayName}</h1>
                                <p className="text-muted-foreground max-w-2xl">
                                    Her finner du alle delte dokumenter. Vi har gjort portalen mer ryddig slik at det
                                    er raskere å søke, filtrere og forhåndsvise filer.
                                </p>
                            </div>

                            <form action="/auth/signout" method="post" className="shrink-0">
                                <Button variant="outline" className="h-10 rounded-full px-4">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Logg ut
                                </Button>
                            </form>
                        </div>

                        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {statItems.map((stat) => {
                                const Icon = stat.icon
                                return (
                                    <div key={stat.label} className="rounded-2xl border border-border/60 bg-surface-muted/50 p-4 flex items-center gap-3">
                                        {Icon ? (
                                            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                                <Icon className="h-5 w-5" />
                                            </div>
                                        ) : (
                                            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                                                {stat.value}
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-muted-foreground">{stat.label}</p>
                                            <div className="text-lg font-semibold text-foreground leading-tight">{stat.value}</div>
                                            <p className="text-xs text-muted-foreground">{stat.hint}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </Reveal>

                {isPrivileged && (
                    <Reveal variant="fadeUp" delay={60}>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {quickActions.map((action) => {
                                const Icon = action.icon
                                return (
                                    <Link
                                        key={action.title}
                                        href={action.href}
                                        className="group rounded-2xl border border-border/60 bg-surface hover:border-primary/30 hover:shadow-md transition-all"
                                    >
                                        <div className="p-5 flex items-start gap-3">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-foreground">{action.title}</p>
                                                <p className="text-sm text-muted-foreground">{action.description}</p>
                                            </div>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    </Reveal>
                )}

                {!isPrivileged && (
                    <Reveal variant="fadeUp" delay={60}>
                        <div className="rounded-2xl border border-dashed border-border/70 bg-surface-muted/40 p-4 text-sm text-muted-foreground">
                            Opplasting er reservert for admin og editor. Ta kontakt med en administrator hvis du skal legge til nye dokumenter.
                        </div>
                    </Reveal>
                )}

                <Reveal variant="fadeUp" delay={120}>
                    <DocumentList documents={documentsWithVersions} categories={categories || []} />
                </Reveal>
            </Container>
        </div>
    )
}
