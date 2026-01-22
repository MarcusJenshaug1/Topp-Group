import { NextResponse } from "next/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get("path") || ""

    if (!path) {
        return NextResponse.json({ error: "Mangler filsti" }, { status: 400 })
    }

    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
        console.error("Missing SUPABASE_SERVICE_ROLE_KEY env var")
        return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })
    }

    const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        {
            auth: { autoRefreshToken: false, persistSession: false },
        }
    )

    // Check document visibility using admin client (bypasses RLS), but respect user role
    const { data: docRow } = await supabaseAdmin
        .from("documents")
        .select("id, visibility, created_by")
        .eq("file_path", path)
        .maybeSingle()

    let visibility: string | null = docRow?.visibility ?? null

    if (!docRow) {
        // Maybe it's an older version – look up in document_versions
        const { data: versionRow } = await supabaseAdmin
            .from("document_versions")
            .select("document_id, documents(visibility, created_by)")
            .eq("file_path", path)
            .maybeSingle()

        const docVisibility = (versionRow as { documents?: { visibility?: string | null } } | null)?.documents?.visibility
        visibility = docVisibility ?? null
    }

    if (!visibility) {
        return NextResponse.json({ error: "Fant ikke dokumentet" }, { status: 404 })
    }

    if (visibility === "admin_only") {
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .maybeSingle()

        if (!profile || !["admin", "editor"].includes(profile.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }
    }

    const { data, error } = await supabaseAdmin.storage.from("toppgroup").download(path)

    if (error || !data) {
        console.error("Download error:", error)
        return NextResponse.json({ error: "Kunne ikke hente filen" }, { status: 500 })
    }

    const contentType = data.type || "application/octet-stream"
    const stream = data.stream()

    return new NextResponse(stream, {
        headers: {
            "Content-Type": contentType,
            "Content-Disposition": "inline",
        },
    })
}
