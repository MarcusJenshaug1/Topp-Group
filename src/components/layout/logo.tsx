import Link from "next/link"
import { cn } from "@/lib/utils"

export function Logo({ className }: { className?: string }) {
    return (
        <Link href="/" className={cn("flex items-center gap-2 font-bold text-xl tracking-tight text-primary", className)}>
            <span>Topp Group</span>
        </Link>
    )
}
