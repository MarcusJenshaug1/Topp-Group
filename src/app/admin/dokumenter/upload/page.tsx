import { createClient } from "@/lib/supabase/server"
import { uploadDocument } from "@/app/admin/documents-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function UploadDocumentPage() {
    const supabase = await createClient()
    const { data: categories } = await supabase.from('document_categories').select('*').order('sort_order')

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/dokumenter">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold tracking-tight">Last opp dokument</h1>
            </div>

            <form action={uploadDocument} className="space-y-6 border p-6 rounded-lg bg-card">
                <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium">Tittel</label>
                    <Input name="title" id="title" required placeholder="F.eks. Årsrapport 2024" />
                </div>

                <div className="space-y-2">
                    <label htmlFor="category_id" className="text-sm font-medium">Kategori</label>
                    <select
                        name="category_id"
                        id="category_id"
                        required
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <option value="">Velg kategori</option>
                        {categories?.map((cat: any) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label htmlFor="file" className="text-sm font-medium">Fil</label>
                    <Input name="file" id="file" type="file" required className="cursor-pointer" />
                </div>

                <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium">Beskrivelse (valgfritt)</label>
                    <Textarea name="description" id="description" placeholder="Beskrivelse av innholdet..." />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Synlighet</label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                            <input type="radio" name="visibility" value="authenticated" defaultChecked />
                            <span className="text-sm">Alle innloggede</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="radio" name="visibility" value="admin_only" />
                            <span className="text-sm">Kun admin/editor</span>
                        </label>
                    </div>
                </div>

                <div className="pt-4 flex justify-end gap-2">
                    <Link href="/admin/dokumenter">
                        <Button variant="outline" type="button">Avbryt</Button>
                    </Link>
                    <Button type="submit">Last opp</Button>
                </div>
            </form>
        </div>
    )
}
