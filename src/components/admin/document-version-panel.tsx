"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Download, Eye, Lock } from "lucide-react"

import { updateDocumentVersion, uploadDocumentVersion } from "@/app/admin/documents-actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

interface DocumentRow {
    id: string
    title: string
    file_name: string | null
    visibility: string | null
    category_id: string | null
    description?: string | null
}

interface DocumentVersion {
    id: string
    version_label: string
    title: string
    file_name: string
    file_path: string
    mime_type: string | null
    description: string | null
    created_at: string
}

interface DocumentVersionPanelProps {
    documentId: string
}

export function DocumentVersionPanel({ documentId }: DocumentVersionPanelProps) {
    const [document, setDocument] = useState<DocumentRow | null>(null)
    const [categoryName, setCategoryName] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [versions, setVersions] = useState<DocumentVersion[]>([])
    const [loadingVersionId, setLoadingVersionId] = useState<string | null>(null)

    useEffect(() => {
        let active = true
        const load = async () => {
            try {
                setLoading(true)
                setError(null)

                const supabase = createClient()
                const { data, error: docError } = await supabase
                    .from("documents")
                    .select("id, title, file_name, visibility, category_id")
                    .eq("id", documentId)
                    .maybeSingle()

                if (!active) return

                if (docError) {
                    setError(docError.message)
                    setDocument(null)
                    return
                }

                if (!data) {
                    setDocument(null)
                    return
                }

                setDocument(data)

                if (data.category_id) {
                    const { data: category } = await supabase
                        .from("document_categories")
                        .select("name")
                        .eq("id", data.category_id)
                        .maybeSingle()

                    if (!active) return

                    setCategoryName(category?.name ?? null)
                } else {
                    setCategoryName(null)
                }

                const { data: versionRows } = await supabase
                    .from("document_versions")
                    .select("id, version_label, title, file_name, file_path, mime_type, description, created_at")
                    .eq("document_id", data.id)
                    .order("created_at", { ascending: false })

                if (!active) return

                setVersions((versionRows as DocumentVersion[]) ?? [])
            } catch (err) {
                if (!active) return
                setError(err instanceof Error ? err.message : "Ukjent feil")
                setDocument(null)
            } finally {
                if (active) setLoading(false)
            }
        }

        load()
        return () => {
            active = false
        }
    }, [documentId])

    if (loading) {
        return (
            <div className="rounded-lg border bg-card p-6">
                <p className="text-sm text-muted-foreground">Laster dokument...</p>
            </div>
        )
    }

    if (!document) {
        return (
            <div className="rounded-lg border bg-card p-6">
                <p className="text-sm text-muted-foreground">Fant ikke dokumentet.</p>
                {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
                <Link href="/admin/dokumenter" className="mt-3 inline-flex">
                    <Button variant="outline" size="sm">Tilbake</Button>
                </Link>
            </div>
        )
    }

    const handleVersionPreview = async (version: DocumentVersion) => {
        setLoadingVersionId(version.id)
        try {
            const ext = version.file_name.split(".").pop()?.toLowerCase()
            const isPdf = version.mime_type === "application/pdf" || ext === "pdf"
            if (!isPdf) {
                alert("Forhåndsvisning er kun tilgjengelig for PDF. Bruk nedlasting.")
                return
            }

            const { getDocumentSignedUrl } = await import("@/app/actions")
            const url = await getDocumentSignedUrl(version.file_path, "preview")
            if (url) window.open(url, "_blank", "noopener,noreferrer")
        } catch (err) {
            console.error(err)
            alert("Kunne ikke forhåndsvise dokumentet.")
        } finally {
            setLoadingVersionId(null)
        }
    }

    const handleVersionDownload = async (version: DocumentVersion) => {
        setLoadingVersionId(version.id)
        try {
            const { getDocumentSignedUrl } = await import("@/app/actions")
            const url = await getDocumentSignedUrl(version.file_path, "download", version.file_name)
            if (!url) return
            const link = globalThis.document.createElement("a")
            link.href = url
            link.download = version.file_name
            globalThis.document.body.appendChild(link)
            link.click()
            link.remove()
        } catch (err) {
            console.error(err)
            alert("Kunne ikke laste ned dokumentet.")
        } finally {
            setLoadingVersionId(null)
        }
    }

    return (
        <>
            <div className="flex items-center gap-3">
                <Link href="/admin/dokumenter">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Dokument</p>
                    <h1 className="text-2xl font-semibold leading-tight">{document.title}</h1>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="secondary" className="bg-surface-muted text-muted-foreground">
                            {categoryName || "Ukjent kategori"}
                        </Badge>
                        {document.visibility === "admin_only" ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800">
                                <Lock className="h-3.5 w-3.5" /> Kun admin/editor
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800">
                                Tilgjengelig for innloggede
                            </span>
                        )}
                        <span className="text-xs">Fil: {document.file_name || "(ukjent)"}</span>
                    </div>
                </div>
            </div>

            <div className="rounded-lg border bg-card p-6 space-y-6">
                <div className="space-y-1">
                    <h2 className="text-lg font-semibold">Last opp ny versjon</h2>
                    <p className="text-sm text-muted-foreground">Oppdater fil, tittel og beskrivelse. Kategori og synlighet beholdes.</p>
                </div>

                <form action={uploadDocumentVersion} className="space-y-5">
                    <input type="hidden" name="document_id" value={document.id} />
                    <div className="space-y-2">
                        <label htmlFor="version_label" className="text-sm font-medium">Versjonsnummer</label>
                        <input
                            id="version_label"
                            name="version_label"
                            type="text"
                            placeholder={`v${versions.length + 1}`}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                        <p className="text-xs text-muted-foreground">Hvis du lar feltet stå tomt, settes det automatisk.</p>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="title" className="text-sm font-medium">Ny tittel (valgfritt)</label>
                        <input
                            id="title"
                            name="title"
                            type="text"
                            placeholder={document.title}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="description" className="text-sm font-medium">Beskrivelse (valgfritt)</label>
                        <textarea
                            id="description"
                            name="description"
                            placeholder={document.description || "Beskrivelse av dokumentet"}
                            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="file" className="text-sm font-medium">Ny fil</label>
                        <input
                            id="file"
                            name="file"
                            type="file"
                            required
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                        <p className="text-xs text-muted-foreground">Filen erstatter nåværende versjon og publiseres med én gang.</p>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Link href="/admin/dokumenter">
                            <Button type="button" variant="outline">Avbryt</Button>
                        </Link>
                        <Button type="submit">Last opp ny versjon</Button>
                    </div>
                </form>
            </div>

            <div className="rounded-lg border bg-card p-6 space-y-4">
                <div className="space-y-1">
                    <h2 className="text-lg font-semibold">Versjonshistorikk</h2>
                    <p className="text-sm text-muted-foreground">Rediger versjonsnummer og tittel for tidligere versjoner.</p>
                </div>

                {versions.length === 0 && (
                    <p className="text-sm text-muted-foreground">Ingen versjoner registrert ennå.</p>
                )}

                <div className="space-y-3">
                    {versions.map((version) => (
                        <form
                            key={version.id}
                            action={updateDocumentVersion}
                            className="grid gap-3 rounded-lg border border-border/60 bg-surface-muted/40 p-4 md:grid-cols-[140px_1fr_220px]"
                        >
                            <input type="hidden" name="version_id" value={version.id} />
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">Versjon</label>
                                <input
                                    name="version_label"
                                    defaultValue={version.version_label}
                                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">Tittel</label>
                                <input
                                    name="title"
                                    defaultValue={version.title}
                                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                                />
                                <div className="space-y-1">
                                    <label className="text-[11px] font-medium text-muted-foreground">Beskrivelse</label>
                                    <textarea
                                        name="description"
                                        defaultValue={version.description || ""}
                                        className="flex min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">Fil: {version.file_name}</p>
                            </div>
                            <div className="flex items-end justify-end gap-2">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    type="button"
                                    onClick={() => handleVersionPreview(version)}
                                    disabled={loadingVersionId === version.id}
                                    aria-label="Forhåndsvis versjon"
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    type="button"
                                    onClick={() => handleVersionDownload(version)}
                                    disabled={loadingVersionId === version.id}
                                    aria-label="Last ned versjon"
                                >
                                    <Download className="h-4 w-4" />
                                </Button>
                                <Button size="sm" type="submit">Lagre</Button>
                            </div>
                        </form>
                    ))}
                </div>
            </div>
        </>
    )
}
