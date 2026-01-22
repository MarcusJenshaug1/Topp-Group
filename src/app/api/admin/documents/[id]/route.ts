import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .maybeSingle()

        if (!profile || !["admin", "editor"].includes(profile.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const { id: documentId } = await params
        if (!documentId) {
            return NextResponse.json({ error: "Mangler dokument-ID" }, { status: 400 })
        }

        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        if (!serviceRoleKey) {
            console.error("Missing SUPABASE_SERVICE_ROLE_KEY env var")
            return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })
        }

        const supabaseAdmin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
            auth: { autoRefreshToken: false, persistSession: false },
        })

        const { data: documentRow } = await supabaseAdmin
            .from("documents")
            .select("id, file_path")
            .eq("id", documentId)
            .maybeSingle()

        if (!documentRow) {
            return NextResponse.json({ error: "Fant ikke dokumentet" }, { status: 404 })
        }

        const { data: versionRows } = await supabaseAdmin
            .from("document_versions")
            .select("file_path")
            .eq("document_id", documentId)

        const filePathsToDelete = [documentRow.file_path, ...(versionRows?.map((v) => v.file_path) ?? [])]
            .filter((p): p is string => Boolean(p))

        if (filePathsToDelete.length) {
            await supabaseAdmin.storage.from("toppgroup").remove(filePathsToDelete)
        }

        await supabaseAdmin.from("document_versions").delete().eq("document_id", documentId)

        const { error: deleteError } = await supabaseAdmin.from("documents").delete().eq("id", documentId)
        if (deleteError) {
            return NextResponse.json({ error: deleteError.message }, { status: 500 })
        }

        revalidatePath("/admin/dokumenter")
        revalidatePath("/portal")

        return NextResponse.json({ ok: true })
    } catch (error) {
        console.error("Delete failed", error)
        return NextResponse.json({ error: "Ukjent feil" }, { status: 500 })
    }
}
