import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Container } from "@/components/ui/container"
import { ProjectCard } from "@/components/domain/project-card"
import { Building2 } from "lucide-react"
import { Reveal } from "@/components/motion/reveal"
import { PropertyFilterBar } from "@/components/domain/property-filter-bar"

export default async function EiendomPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
    const supabase = await createClient()

    const resolvedParams = await searchParams
    const activeCategoryId = resolvedParams?.category || undefined

    // Fetch categories for filter buttons
    const { data: categories } = await supabase
        .from('project_categories')
        .select('id, name, sort_order')
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true })

    // Query projects with optional category filter
    let query = supabase
        .from('projects')
        .select('*, project_categories(name)')
        .eq('status', 'published')
        .order('year', { ascending: false })

    if (activeCategoryId) {
        query = query.eq('category_id', activeCategoryId)
    }

    const { data: projects } = await query

    return (
        <div className="py-24 md:py-32 bg-background min-h-screen">
            <Container>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <Reveal variant="fadeUp">
                        <div className="space-y-6 max-w-2xl">
                            <div className="flex items-center gap-2 text-primary">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <Building2 className="h-5 w-5" />
                                </div>
                                <span className="font-semibold tracking-wide uppercase text-sm">Eiendomsprosjekter</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">Våre prosjekter</h1>
                            <p className="text-xl text-muted-foreground leading-relaxed">
                                En oversikt over våre pågående og ferdigstilte prosjekter innen næring, bolig og fritid.
                                Vi utvikler eiendommer med varig verdi.
                            </p>
                        </div>
                    </Reveal>

                    <Reveal variant="fadeUp" delay={80}>
                        <PropertyFilterBar categories={categories || []} activeCategoryId={activeCategoryId} />
                    </Reveal>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                    {!projects || projects.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-muted-foreground">
                            Ingen prosjekter er publisert enda.
                        </div>
                    ) : (
                        projects.map((project: any, index: number) => (
                            <Reveal key={project.id} variant="fadeUp" index={index} stagger={60}>
                                <ProjectCard
                                    id={project.id}
                                    title={project.title}
                                    category={project.project_categories?.name || 'Ukjent'}
                                    slug={project.slug}
                                    excerpt={project.excerpt}
                                    year={project.year}
                                    imageUrl={project.cover_image_path}
                                    status={project.status}
                                />
                            </Reveal>
                        ))
                    )}
                </div>
            </Container>
        </div>
    )
}
