import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight, ImageIcon } from "lucide-react"

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
        <Link href={`/eiendom/${slug}`} className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background">
            <Card className="relative h-full overflow-hidden flex flex-col rounded-2xl border border-border/60 bg-surface transform-gpu [will-change:transform] transition-[transform,box-shadow,border-color] duration-[var(--dur-med)] ease-[var(--ease-out-premium)] shadow-[0_8px_24px_-18px_rgba(0,0,0,0.22)] hover:-translate-y-[2px] hover:border-primary/30 hover:shadow-[0_18px_52px_-32px_rgba(0,0,0,0.35)]">
                <div className="relative aspect-[16/10] w-full bg-muted overflow-hidden">
                    {imageUrl ? (
                        <Image
                            src={imageUrl.startsWith("http") ? imageUrl : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/toppgroup/${imageUrl}`}
                            alt={title}
                            fill
                            style={{ objectFit: "cover" }}
                            className="h-full w-full object-cover transform-gpu [will-change:transform] transition-transform duration-[var(--dur-med)] ease-[var(--ease-out-premium)] group-hover:scale-[1.02]"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(46,55,69,0.10),rgba(46,55,69,0.03))]">
                            <div className="absolute bottom-5 left-6 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <span className="grid h-8 w-8 place-items-center rounded-full border border-border/60 bg-white/70 backdrop-blur">
                                    <ImageIcon className="h-4 w-4" />
                                </span>
                                <span>Bilde kommer</span>
                            </div>
                        </div>
                    )}
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/25 via-black/0 to-transparent opacity-0 [will-change:opacity] transition-opacity duration-[var(--dur-med)] ease-[var(--ease-out-premium)] group-hover:opacity-100" />
                    <div className="absolute top-4 left-4">
                        <Badge variant="secondary" className="bg-white/85 backdrop-blur-md text-foreground border border-border/60 px-3 py-1 rounded-full text-xs font-semibold">
                            {category}
                        </Badge>
                    </div>
                </div>

                <CardHeader className="p-6 pb-2">
                    <div className="flex justify-between items-start gap-4">
                        <h3 className="text-base md:text-lg font-semibold leading-tight tracking-tight transition-colors duration-[var(--dur-med)] ease-[var(--ease-out-premium)] group-hover:text-[#2E3745]">
                            {title}
                        </h3>
                        <div className="grid h-9 w-9 place-items-center rounded-full border border-border/60 bg-surface-muted transform-gpu [will-change:transform] transition-[transform,background-color,border-color] duration-[var(--dur-fast)] ease-[var(--ease-out-premium)] group-hover:bg-[#2E3745] group-hover:border-[#2E3745]">
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-[transform,color] duration-[var(--dur-fast)] ease-[var(--ease-out-premium)] group-hover:text-white group-hover:translate-x-[0.5px] group-hover:-translate-y-[0.5px]" />
                        </div>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground font-medium">
                        {year}
                        {status && status !== "published" ? ` • ${status}` : ""}
                    </p>
                </CardHeader>

                <CardContent className="p-6 pt-3 flex-grow">
                    <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                        {excerpt}
                    </p>
                </CardContent>
            </Card>
        </Link>
    )
}
