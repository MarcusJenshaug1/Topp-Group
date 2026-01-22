import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Container } from "@/components/ui/container"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, MapPin, Tag, ImageIcon, Pencil } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

type Params = Promise<{ slug: string }>

export default async function ProjectDetailsPage({
    params,
}: {
    params: Params
}) {
    const { slug } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    let canEdit = false

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        canEdit = profile?.role === 'admin' || profile?.role === 'editor'
    }

    const { data: project } = await supabase
        .from('projects')
        .select('*, project_categories(name)')
        .eq('slug', slug)
        .single()

    if (!project) {
        notFound()
    }

    const getImageUrl = (path: string | null) => {
        if (!path) return null
        if (path.startsWith('http')) return path
        return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/toppgroup/${path}`
    }

    const coverUrl = getImageUrl(project.cover_image_path)
    const gallery: string[] = Array.isArray(project.gallery) ? project.gallery : []

    return (
        <article className="pb-24">
            {/* Hero Image */}
            <div className="relative h-[50vh] w-full bg-muted">
                {coverUrl ? (
                    <Image
                        src={coverUrl}
                        alt={project.title}
                        fill
                        className="object-cover"
                        priority
                    />
                ) : (
                    <div className="absolute inset-0 bg-surface-muted flex items-center justify-center text-muted-foreground">
                        Ingen bilde
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
                    <Container className="pb-12 text-white">
                        <div className="flex gap-3 mb-4">
                            <Badge className="bg-white/20 hover:bg-white/30 text-white backdrop-blur border-none">{project.project_categories?.name || 'Prosjekt'}</Badge>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold mb-4">{project.title}</h1>
                    </Container>
                </div>
            </div>

            <Container className="mt-12">
                <div className="flex flex-wrap items-center gap-3 mb-8">
                    <Link href="/eiendom" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Tilbake til oversikt
                    </Link>
                    {canEdit && (
                        <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="rounded-full border border-border/60 bg-white shadow-sm text-foreground hover:bg-primary/10 hover:text-primary"
                        >
                            <Link href={`/admin/prosjekter/${project.id}`} className="inline-flex items-center gap-2 px-3 py-1.5">
                                <Pencil className="h-4 w-4" aria-hidden="true" />
                                <span>Rediger prosjekt</span>
                            </Link>
                        </Button>
                    )}
                </div>

                <div className="grid md:grid-cols-3 gap-12">
                    <div className="md:col-span-2 space-y-12">
                        {/* Description */}
                        <div className="prose max-w-none text-lg leading-relaxed text-muted-foreground">
                            <p className="font-medium text-foreground text-xl mb-6">
                                {project.excerpt}
                            </p>
                            {project.content ? (
                                <div dangerouslySetInnerHTML={{ __html: project.content }} />
                            ) : (
                                <p>Ingen beskrivelse tilgjengelig.</p>
                            )}
                        </div>

                        {/* Gallery Section */}
                        {gallery.length > 0 && (
                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold flex items-center gap-2">
                                    <ImageIcon className="h-6 w-6 text-primary" />
                                    Galleri
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {gallery.map((path, idx) => (
                                        <div key={idx} className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted group">
                                            <Image
                                                src={getImageUrl(path) || ''}
                                                alt={`Galleri bilde ${idx + 1}`}
                                                fill
                                                className="object-cover motion-image group-hover:scale-[1.02]"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar / More Information */}
                    <div className="space-y-8">
                        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                <Tag className="h-5 w-5 text-primary" />
                                Prosjektfakta
                            </h3>
                            
                            <dl className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-border/50">
                                    <dt className="text-muted-foreground text-sm">Kategori</dt>
                                    <dd className="font-medium">{project.project_categories?.name || '-'}</dd>
                                </div>
                                
                                <div className="flex justify-between items-center py-2 border-b border-border/50">
                                    <dt className="text-muted-foreground text-sm">Ferdigstillelse</dt>
                                    <dd className="font-medium flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        {project.year || '-'}
                                    </dd>
                                </div>

                                {project.location && (
                                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                                        <dt className="text-muted-foreground text-sm">Lokasjon</dt>
                                        <dd className="font-medium flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            {project.location}
                                        </dd>
                                    </div>
                                )}

                                {project.area_sqm && (
                                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                                        <dt className="text-muted-foreground text-sm">Areal</dt>
                                        <dd className="font-medium">{project.area_sqm} kvm</dd>
                                    </div>
                                )}

                                {/* Placeholder for Address if added later */}
                                {/* 
                                <div className="flex justify-between items-center py-2 border-b border-border/50">
                                    <dt className="text-muted-foreground text-sm">Adresse</dt>
                                    <dd className="font-medium flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        Oslo
                                    </dd>
                                </div> 
                                */}
                            </dl>
                        </div>

                        {/* Contact Card Idea */}
                        {/* 
                        <div className="rounded-xl border border-border bg-primary text-primary-foreground p-6 shadow-sm">
                            <h3 className="text-lg font-semibold mb-2">Interessert?</h3>
                            <p className="text-primary-foreground/80 mb-4 text-sm">
                                Ta kontakt for mer informasjon om dette prosjektet.
                            </p>
                            <Link href="/kontakt">
                                <Button variant="secondary" className="w-full">
                                    Kontakt oss
                                </Button>
                            </Link>
                        </div> 
                        */}
                    </div>
                </div>
            </Container>
        </article>
    )
}
