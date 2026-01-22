import Link from "next/link"
import { LucideIcon, ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface BusinessAreaCardProps {
    title: string
    description: string
    href: string
    icon: LucideIcon
    tags?: string[]
    className?: string
    pattern?: "building" | "chart" // Kept for API compatibility but unused for color
}

export function BusinessAreaCard({
    title,
    description,
    href,
    icon: Icon,
    tags,
    className,
}: BusinessAreaCardProps) {
    return (
        <Link href={href} className={cn("group block h-full", className)}>
            <div className="relative overflow-hidden rounded-3xl bg-surface-dark aspect-[16/9] md:aspect-[2/1] h-full motion-card hover:-translate-y-0.5 hover:shadow-2xl">
                {/* Unified Dark Background to match theme */}
                <div className="absolute inset-0 bg-surface-dark" />
                
                {/* Subtle Gradient Overlay for depth, consistent across cards */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Content */}
                <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-end">
                    {/* Arrow - Always visible now, moves slightly on hover */}
                    <div className="absolute top-8 right-8 motion-icon group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                        <div className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 text-white">
                            <ArrowRight className="h-5 w-5" />
                        </div>
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/5 shadow-inner">
                                <Icon className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{title}</h3>
                        </div>

                        <p className="text-gray-400 mb-6 max-w-lg text-lg leading-relaxed transition-colors group-hover:text-gray-200">
                            {description}
                        </p>

                        {tags && tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag) => (
                                    <Badge
                                        key={tag}
                                        variant="outline"
                                        className="border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white backdrop-blur-sm px-3 py-1 transition-colors"
                                    >
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    )
}
