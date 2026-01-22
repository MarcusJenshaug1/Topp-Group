import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, Download, Trash, Lock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default async function AdminDocumentsPage() {
    const supabase = await createClient()

    const { data: documents } = await supabase
        .from('documents')
        .select('*, document_categories(name)')
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Dokumenter</h1>
                <Link href="/admin/dokumenter/upload">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Last opp dokument
                    </Button>
                </Link>
            </div>

            <div className="border rounded-xl overflow-hidden bg-surface shadow-sm">
                <div className="bg-surface-muted/50 p-4 grid grid-cols-12 text-sm font-medium text-muted-foreground gap-4 border-b">
                    <div className="col-span-4 pl-2">Tittel / Filnavn</div>
                    <div className="col-span-3">Kategori</div>
                    <div className="col-span-2">Synlighet</div>
                    <div className="col-span-3 text-right pr-2">Handling</div>
                </div>

                {!documents || documents.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">
                        Ingen dokumenter funnet. Last opp ditt første dokument.
                    </div>
                ) : (
                    documents.map((doc: any) => (
                        <div key={doc.id} className="p-4 grid grid-cols-12 items-center gap-4 hover:bg-surface-muted/30 border-b last:border-0 transition-colors">
                            <div className="col-span-4 pl-2">
                                <div className="font-medium truncate text-foreground">{doc.title}</div>
                                <div className="text-xs text-muted-foreground truncate">{doc.file_name}</div>
                            </div>
                            <div className="col-span-3">
                                <Badge variant="secondary" className="bg-surface-muted text-muted-foreground">{doc.document_categories?.name || 'Ukjent'}</Badge>
                            </div>
                            <div className="col-span-2 flex items-center text-sm">
                                {doc.visibility === 'admin_only' && <Lock className="h-3 w-3 mr-1.5 text-muted-foreground" />}
                                <span className={doc.visibility === 'admin_only' ? 'text-muted-foreground' : 'text-foreground'}>
                                    {doc.visibility === 'authenticated' ? 'Alle innloggede' : 'Kun admin'}
                                </span>
                            </div>
                            <div className="col-span-3 flex justify-end gap-2 pr-2">
                                {/* Download Button via server action or signed url logic needed */}
                                <Button variant="ghost" size="icon" className="hover:bg-surface-muted hover:text-primary">
                                    <Download className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
