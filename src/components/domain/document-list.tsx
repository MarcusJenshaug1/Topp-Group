'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Download, X, Loader2 } from "lucide-react"
import { getDocumentUrl } from "@/app/actions"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface Document {
    id: string
    title: string
    file_path: string
    created_at: string
    mime_type: string | null
    document_categories: {
        name: string
    } | null
}

interface DocumentListProps {
    documents: Document[] | null
}

export function DocumentList({ documents }: DocumentListProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const handlePreview = async (filePath: string) => {
        setIsLoading(true)
        try {
            // We use 'preview' mode to get a URL that doesn't force download
            // Note: Since this is a client component calling a server action that redirects,
            // we might need to adjust the server action to RETURN the url instead of redirecting
            // IF we want to display it in an iframe. 
            // The current 'getDocumentUrl' does `redirect()`. redirect() in Server Action
            // called from Client Component acts as a navigation action (MPA style) or Router.push.
            // It DOES NOT return the string to the caller.

            // WE NEED TO UPDATE THE SERVER ACTION TO RETURN THE URL if we want to use it in an iframe.
            // But wait, I can't easily change the server action signature without breaking the download form?
            // Actually, I should create a separate action or update it to support returning string.
            // Let's assume I will update the server action in the next step to return string if requested.
            // For now, I will simulate the call assuming I fix the action.

            alert("Jeg må oppdatere server-koden for å støtte popup-visning. Ett øyeblikk...");
            // This is a placeholder to prevent broken UI while I fix the action.
            // Real logic will go here after I fix the action.
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    if (!documents || documents.length === 0) {
        return (
            <div className="text-center py-12 border rounded-lg bg-background text-muted-foreground">
                Ingen dokumenter funnet.
            </div>
        )
    }

    return (
        <div className="divide-y border rounded-lg bg-background">
            <div className="bg-muted/50 p-4 grid grid-cols-12 text-sm font-medium text-muted-foreground gap-4">
                <div className="col-span-6 md:col-span-5">Dokument</div>
                <div className="col-span-2 hidden md:block">Kategori</div>
                <div className="col-span-2 hidden md:block">Dato</div>
                <div className="col-span-4 md:col-span-3 text-right">Handling</div>
            </div>

            {documents.map((doc) => (
                <div key={doc.id} className="p-4 grid grid-cols-12 items-center gap-4 hover:bg-muted/30 transition-colors">
                    <div className="col-span-6 md:col-span-5 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <FileText className="h-5 w-5" />
                        </div>
                        <div className="truncate">
                            <p className="font-medium truncate">{doc.title}</p>
                            <p className="text-xs text-muted-foreground md:hidden">
                                {new Date(doc.created_at).toLocaleDateString("no-NO")}
                            </p>
                            <p className="text-xs text-muted-foreground hidden md:block">
                                {doc.mime_type?.split('/')[1]?.toUpperCase() || 'FIL'}
                            </p>
                        </div>
                    </div>

                    <div className="col-span-2 hidden md:flex items-center">
                        <Badge variant="outline">{doc.document_categories?.name || 'Ukjent'}</Badge>
                    </div>

                    <div className="col-span-2 hidden md:flex items-center text-sm text-muted-foreground">
                        {new Date(doc.created_at).toLocaleDateString("no-NO")}
                    </div>

                    <div className="col-span-4 md:col-span-3 flex justify-end gap-2">
                        {/* Preview Button - Triggers Modal */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                                // Inline logic to fetch URL for modal
                                setIsLoading(true)
                                try {
                                    // I'm assuming I'll export a new action 'getSignedUrl' 
                                    // that simply returns the string.
                                    // For now, let's just scaffold the UI.
                                    const { getDocumentSignedUrl } = await import("@/app/actions")
                                    const url = await getDocumentSignedUrl(doc.file_path)
                                    if (url) setPreviewUrl(url)
                                } catch (e) {
                                    console.error(e)
                                    alert("Kunne ikke laste dokumentet.")
                                } finally {
                                    setIsLoading(false)
                                }
                            }}
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Forhåndsvis"}
                        </Button>

                        {/* Download Form - Triggers download */}
                        <form action={getDocumentUrl.bind(null, doc.file_path, 'download')}>
                            <Button variant="secondary" size="sm" className="hidden sm:flex" type="submit">
                                <Download className="h-4 w-4 mr-2" />
                                Last ned
                            </Button>
                            <Button variant="secondary" size="icon" className="sm:hidden" type="submit">
                                <Download className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                </div>
            ))}

            {/* Fullscreen Preview Modal */}
            {previewUrl && (
                <div className="motion-overlay fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="motion-panel bg-background border shadow-lg rounded-lg w-full h-full max-w-6xl max-h-[90vh] flex flex-col relative">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="font-semibold">Forhåndsvisning</h3>
                            <Button variant="ghost" size="icon" onClick={() => setPreviewUrl(null)}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                        <div className="flex-1 bg-muted/20 p-4 overflow-hidden relative">
                            <iframe
                                src={previewUrl}
                                className="w-full h-full rounded border bg-white"
                                title="Dokumentvisning"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
