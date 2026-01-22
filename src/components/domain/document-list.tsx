"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, FileSpreadsheet, FileText, Image, Loader2, Search, X } from "lucide-react"
import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"

interface DocumentVersion {
    id: string
    version_label: string
    title: string
    file_path: string
    file_name: string
    mime_type?: string | null
    description?: string | null
    created_at: string
}

interface Document {
    id: string
    title: string
    file_path: string
    file_name?: string | null
    created_at: string
    mime_type: string | null
    visibility?: "authenticated" | "admin_only" | null
    document_categories: {
        name: string
    } | null
    versions?: DocumentVersion[]
}

interface DocumentListProps {
    documents: Document[] | null
    categories?: { id: string; name: string }[]
}

export function DocumentList({ documents, categories = [] }: DocumentListProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [activeCategory, setActiveCategory] = useState<string>("all")
    const [query, setQuery] = useState("")
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [activeVersions, setActiveVersions] = useState<Record<string, string>>({})

    const normalizedDocuments = documents || []

    const filteredDocuments = useMemo(() => {
        const matchesQuery = (doc: Document, value: string) => {
            if (!value) return true
            const versionsText = (doc.versions || [])
                .map((version) => `${version.version_label} ${version.title} ${version.file_name}`)
                .join(" ")
            const haystack = `${doc.title} ${doc.file_name || ""} ${doc.document_categories?.name || ""} ${versionsText}`.toLowerCase()
            return haystack.includes(value.toLowerCase())
        }

        return normalizedDocuments.filter((doc) => {
            const inCategory = activeCategory === "all" || doc.document_categories?.name === activeCategory
            const inQuery = matchesQuery(doc, query)
            return inCategory && inQuery
        })
    }, [normalizedDocuments, activeCategory, query])

    const formatDate = (value: string) => {
        try {
            return new Date(value).toLocaleDateString("no-NO", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            })
        } catch {
            return value
        }
    }

    const resolveActiveVersion = (doc: Document) => {
        const versions = doc.versions || []
        if (!versions.length) return null
        const selectedId = activeVersions[doc.id]
        return versions.find((version) => version.id === selectedId) || versions[0]
    }

    const describeFile = (doc: Document) => {
        const version = resolveActiveVersion(doc)
        const name = version?.file_name || doc.file_name || ""
        const mime = version?.mime_type || doc.mime_type || ""
        const ext = name.split(".").pop()?.toLowerCase() || ""
        const isPdf = mime === "application/pdf" || ext === "pdf"
        const isSheet = ["xlsx", "csv"].includes(ext)
        const isDoc = ["doc", "docx", "txt"].includes(ext)
        const isSlides = ["ppt", "pptx"].includes(ext)
        const isImage = ["jpg", "jpeg", "png"].includes(ext)
        return { name, mime, ext, isPdf, isSheet, isDoc, isSlides, isImage }
    }

    const fileVisual = (doc: Document) => {
        const info = describeFile(doc)
        if (info.isImage) return { Icon: Image, color: "bg-amber-100 text-amber-700" }
        if (info.isPdf) return { Icon: FileText, color: "bg-rose-100 text-rose-700" }
        if (info.isSheet) return { Icon: FileSpreadsheet, color: "bg-emerald-100 text-emerald-700" }
        if (info.isSlides) return { Icon: FileText, color: "bg-orange-100 text-orange-700" }
        if (info.isDoc) return { Icon: FileText, color: "bg-blue-100 text-blue-700" }
        return { Icon: FileText, color: "bg-muted text-foreground" }
    }

    const handlePreview = async (doc: Document) => {
        const info = describeFile(doc)
        if (!info.isPdf) {
            alert("Forhåndsvisning er kun tilgjengelig for PDF. Filen lastes ned i stedet.")
            return handleDownload(doc)
        }

        setLoadingId(doc.id)
        try {
            const activeVersion = resolveActiveVersion(doc)
            const filePath = activeVersion?.file_path || doc.file_path
            const url = `/api/documents/preview?path=${encodeURIComponent(filePath)}`
            setPreviewUrl(url)
        } catch (error) {
            console.error(error)
            alert("Kunne ikke laste dokumentet.")
        } finally {
            setLoadingId(null)
        }
    }

    const handleDownload = async (doc: Document) => {
        setLoadingId(doc.id)
        try {
            const { getDocumentSignedUrl } = await import("@/app/actions")
            const activeVersion = resolveActiveVersion(doc)
            const filePath = activeVersion?.file_path || doc.file_path
            const fileName = activeVersion?.file_name || doc.file_name || "dokument"
            const url = await getDocumentSignedUrl(filePath, "download", fileName)
            if (!url) return
            const link = document.createElement("a")
            link.href = url
            link.download = fileName
            document.body.appendChild(link)
            link.click()
            link.remove()
        } catch (error) {
            console.error(error)
            alert("Kunne ikke laste ned dokumentet.")
        } finally {
            setLoadingId(null)
        }
    }

    if (!normalizedDocuments.length) {
        return (
            <div className="rounded-3xl border border-dashed border-border/70 bg-surface-muted/40 text-center py-12 text-muted-foreground">
                Ingen dokumenter funnet ennå. Prøv et annet søk eller kategori.
            </div>
        )
    }

    return (
        <div className="rounded-3xl border border-border/70 bg-surface shadow-sm overflow-hidden">
            <div className="border-b border-border/60 p-4 md:p-6 space-y-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="relative w-full md:max-w-xl">
                        <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Søk på tittel, filnavn eller kategori"
                            className="w-full h-10 rounded-full border border-border/70 bg-background pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="rounded-full bg-surface-muted px-3 py-1 border border-border/60">
                            {filteredDocuments.length} av {normalizedDocuments.length} dokumenter
                        </span>
                        <span className="hidden sm:inline">Sorter via kolonnene under.</span>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => setActiveCategory("all")}
                        className={cn(
                            "rounded-full border px-3 py-1.5 text-sm",
                            activeCategory === "all"
                                ? "bg-primary text-white border-primary"
                                : "border-border/60 bg-surface hover:border-primary/40"
                        )}
                    >
                        Alle
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            type="button"
                            onClick={() => setActiveCategory(category.name)}
                            className={cn(
                                "rounded-full border px-3 py-1.5 text-sm",
                                activeCategory === category.name
                                    ? "bg-primary text-white border-primary"
                                    : "border-border/60 bg-surface hover:border-primary/40"
                            )}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-surface divide-y divide-border/60">
                <div className="hidden md:grid md:grid-cols-[minmax(0,1fr)_160px_140px_200px] gap-4 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <div>Dokument</div>
                    <div>Kategori</div>
                    <div>Versjon</div>
                    <div className="text-right">Handling</div>
                </div>

                {filteredDocuments.map((doc) => (
                    <div
                        key={doc.id}
                        className="flex flex-col gap-3 px-4 py-3 transition-colors hover:bg-surface-muted/40 md:grid md:grid-cols-[minmax(0,1fr)_160px_140px_200px] md:items-center md:gap-4"
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            {(() => {
                                const { Icon, color } = fileVisual(doc)
                                return (
                                    <div className={cn("h-10 w-10 shrink-0 rounded-xl flex items-center justify-center", color)}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                )
                            })()}
                            <div className="min-w-0">
                                <p className="font-semibold text-foreground truncate">{doc.title}</p>
                                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                    <span className="rounded-full bg-surface-muted px-2 py-1 border border-border/50">
                                        {resolveActiveVersion(doc)?.file_name || doc.file_name || doc.mime_type?.split("/")[1]?.toUpperCase() || "FIL"}
                                    </span>
                                    <span>{formatDate(doc.created_at)}</span>
                                </div>
                                {resolveActiveVersion(doc)?.description && (
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                        {resolveActiveVersion(doc)?.description}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center md:justify-start">
                            <Badge variant="secondary" className="bg-surface-muted text-muted-foreground border-border/60">
                                {doc.document_categories?.name || "Ukjent"}
                            </Badge>
                        </div>

                        <div className="flex items-center gap-2 md:justify-start">
                            {doc.versions && doc.versions.length > 1 ? (
                                <select
                                    className="h-8 min-w-[72px] rounded-md border border-border/60 bg-background px-2 text-xs"
                                    value={activeVersions[doc.id] ?? doc.versions[0].id}
                                    onChange={(event) =>
                                        setActiveVersions((prev) => ({
                                            ...prev,
                                            [doc.id]: event.target.value,
                                        }))
                                    }
                                >
                                    {doc.versions.map((version) => (
                                        <option key={version.id} value={version.id}>
                                            {version.version_label}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <span className="text-xs text-muted-foreground">–</span>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePreview(doc)}
                                disabled={loadingId === doc.id}
                                className="hover:bg-primary/10"
                            >
                                {loadingId === doc.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Forhåndsvis"}
                            </Button>

                            <Button
                                variant="secondary"
                                size="sm"
                                className="hidden sm:inline-flex"
                                onClick={() => handleDownload(doc)}
                                disabled={loadingId === doc.id}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Last ned
                            </Button>
                            <Button
                                variant="secondary"
                                size="icon"
                                className="sm:hidden"
                                onClick={() => handleDownload(doc)}
                                disabled={loadingId === doc.id}
                            >
                                <Download className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}

                {filteredDocuments.length === 0 && (
                    <div className="px-4 py-10 text-center text-muted-foreground text-sm">
                        Ingen dokumenter matcher filtrene dine.
                    </div>
                )}
            </div>

            {previewUrl && (
                <div className="motion-overlay fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
                    <div className="absolute inset-0 flex flex-col">
                        <div className="flex items-center justify-between px-6 h-14 border-b bg-background/95">
                            <h3 className="text-base font-semibold">Forhåndsvisning</h3>
                            <Button variant="ghost" size="icon" onClick={() => setPreviewUrl(null)} aria-label="Lukk forhåndsvisning">
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                        <iframe
                            src={previewUrl}
                            className="flex-1 w-full h-[calc(100%-56px)] bg-white"
                            title="Dokumentvisning"
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
