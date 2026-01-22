"use client"

import { useEffect, useState, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { motion, LayoutGroup } from "framer-motion"
import clsx from "clsx"

interface Category {
    id: string
    name: string
}

interface PropertyFilterBarProps {
    categories: Category[]
    activeCategoryId?: string
}

export function PropertyFilterBar({ categories, activeCategoryId }: PropertyFilterBarProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [selected, setSelected] = useState(activeCategoryId || "")
    const [isPending, startTransition] = useTransition()

    useEffect(() => {
        setSelected(activeCategoryId || "")
    }, [activeCategoryId])

    const navigate = (categoryId?: string) => {
        setSelected(categoryId || "")
        const params = new URLSearchParams(searchParams?.toString())
        if (categoryId) {
            params.set("category", categoryId)
        } else {
            params.delete("category")
        }

        startTransition(() => {
            router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`)
        })
    }

    const spring = { type: "spring", stiffness: 420, damping: 36 }

    const renderButton = (label: string, id?: string) => {
        const isActive = (id || "") === selected

        const classes = clsx(
            "rounded-full px-4 py-2 transition-all",
            isActive
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-surface text-muted-foreground border border-border/50 hover:text-foreground hover:bg-surface-muted"
        )

        return (
            <motion.div
                key={id || "all"}
                layout
                transition={spring}
                animate={{ y: isActive ? -3 : 0, scale: isActive ? 1.02 : 1, opacity: isPending && isActive ? 0.9 : 1 }}
            >
                <Button
                    variant="ghost"
                    size="sm"
                    className={classes}
                    onClick={(e) => {
                        e.preventDefault()
                        navigate(id)
                    }}
                >
                    {label}
                </Button>
            </motion.div>
        )
    }

    return (
        <LayoutGroup>
            <div className="flex flex-wrap gap-2">
                {renderButton("Alle", undefined)}
                {categories.map((cat) => renderButton(cat.name, cat.id))}
            </div>
        </LayoutGroup>
    )
}
