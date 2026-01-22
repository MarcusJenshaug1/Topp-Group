import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight } from "lucide-react"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ProjectCardProps {
    title: string
    category: string
    excerpt: string
    year: number
    imageUrl?: string
    slug: string
    status?: string
    id?: string
}

export function ProjectCard({
    title,
    category,
    excerpt,
    year,
    imageUrl,
    slug,
    status
}: ProjectCardProps) {
    return (
        <Link href={`/eiendom/${slug}`} className="group block h-full">
            <Card className="motion-card overflow-hidden h-full flex flex-col hover:shadow-lg hover:-translate-y-0.5 border-border/40 bg-surface group-hover:border-primary/20">
                <div className="relative aspect-[4/3] w-full bg-muted overflow-hidden">
                    {imageUrl ? (
                        <Image
                            src={imageUrl.startsWith('http') ? imageUrl : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/toppgroup/${imageUrl}`}
                            alt={title}
                            fill
                            style={{ objectFit: "cover" }}
                            className="motion-image group-hover:scale-[1.02]"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-surface-muted flex items-center justify-center text-muted-foreground">
                            Ingen bilde
                        </div>
                    )}
                    <div className="absolute top-4 left-4 flex gap-2">
                        <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-foreground shadow-sm">
                            {category}
                        </Badge>
                        {status && status !== 'published' && (
                            <Badge variant="outline" className="bg-black/50 backdrop-blur-sm text-white border-none">
                                {status}
                            </Badge>
                        )}
                    </div>
                </div>

                <CardHeader className="p-6 pb-2">
                    <div className="flex justify-between items-start gap-4">
                        <h3 className="font-bold text-lg leading-tight group-hover:text-[var(--color-hover-dark)] transition-colors">{title}</h3>
                        <ArrowUpRight className="motion-icon h-5 w-5 text-muted-foreground group-hover:text-[var(--color-hover-dark)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">{year}</p>
                </CardHeader>

                <CardContent className="p-6 pt-3 flex-grow">
                    <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
                        {excerpt}
                    </p>
                </CardContent>
            </Card>
        </Link>
    )
}
