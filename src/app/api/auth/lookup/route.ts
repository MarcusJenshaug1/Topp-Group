import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}))
        const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : ""

        if (!email) {
            return NextResponse.json({ error: "Mangler e-post" }, { status: 400 })
        }

        const admin = createAdminClient()
        const { data: profile, error: profileError } = await admin
            .from("profiles")
            .select("id")
            .eq("email", email)
            .maybeSingle()

        if (profileError) {
            return NextResponse.json({ error: profileError.message }, { status: 500 })
        }

        if (!profile?.id) {
            return NextResponse.json({ status: "not_found" }, { status: 200 })
        }

        const { data: userData, error: userError } = await admin.auth.admin.getUserById(profile.id)
        if (userError || !userData?.user) {
            return NextResponse.json({ status: "not_found" }, { status: 200 })
        }

        const invited = Boolean(userData.user.invited_at) && !userData.user.last_sign_in_at

        return NextResponse.json({ status: invited ? "invited" : "active" }, { status: 200 })
    } catch (error) {
        console.error("Auth lookup failed", error)
        return NextResponse.json({ error: "Ukjent feil" }, { status: 500 })
    }
}
