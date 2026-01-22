"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LayoutGrid, Rows } from "lucide-react"

type Category = { id: string; name: string }

const statusOptions = [
    { value: "", label: "Alle statuser" },
    { value: "published", label: "Publisert" },
    { value: "draft", label: "Kladd" },
    { value: "archived", label: "Arkivert" },
]

export function FilterControls({
    search,
    status,
    category,
    view,
    categories,
    total,
}: {
    search: string
    status: string
    category: string
    view: string
    categories: Category[]
    total: number
}) {
    const router = useRouter()
    const [term, setTerm] = useState(search)
    const [pending, startTransition] = useTransition()

    const updateParams = (overrides: Record<string, string | number | undefined>) => {
        const sp = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "")
        if (term) sp.set("q", term)
        else sp.delete("q")
        if (status) sp.set("status", status)
        else sp.delete("status")
        if (category) sp.set("category", category)
        else sp.delete("category")
        if (view) sp.set("view", view)
        else sp.delete("view")

        Object.entries(overrides).forEach(([key, value]) => {
            if (value === undefined || value === "") sp.delete(key)
            else sp.set(key, String(value))
        })

        startTransition(() => {
            router.replace(`/admin/prosjekter${sp.toString() ? `?${sp.toString()}` : ""}`, { scroll: false })
        })
    }

    useEffect(() => {
        const handle = setTimeout(() => {
            updateParams({ page: 1 })
        }, 250)
        return () => clearTimeout(handle)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [term])

    return (
        <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
            <div className="flex flex-col gap-2 rounded-xl border bg-surface p-3 shadow-sm">
                <div className="flex items-center gap-2">
                    <Input
                        placeholder="Søk på tittel, slug eller beskrivelse"
                        value={term}
                        onChange={(e) => setTerm(e.target.value)}
                        className="w-full"
                    />
                    <Button type="button" variant="secondary" onClick={() => updateParams({ page: 1 })} disabled={pending}>
                        Søk
                    </Button>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <select
                        value={status}
                        onChange={(e) => updateParams({ status: e.target.value, page: 1 })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        {statusOptions.map((opt) => (
                            <option key={opt.value || 'all'} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    <select
                        value={category}
                        onChange={(e) => updateParams({ category: e.target.value, page: 1 })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        <option value="">Alle kategorier</option>
                        {(categories || []).map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl border bg-surface p-3 shadow-sm">
                <span className="text-sm text-muted-foreground">Visning</span>
                <Button
                    variant={view === 'table' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => updateParams({ view: 'table', page: 1 })}
                >
                    <Rows className="h-4 w-4 mr-1" /> Liste
                </Button>
                <Button
                    variant={view === 'grid' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => updateParams({ view: 'grid', page: 1 })}
                >
                    <LayoutGrid className="h-4 w-4 mr-1" /> Galleri
                </Button>
                <div className="ml-auto text-sm text-muted-foreground">{total} prosjekter</div>
            </div>
        </div>
    )
}
