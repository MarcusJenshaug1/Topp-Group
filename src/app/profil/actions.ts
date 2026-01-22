"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function updateProfileName(formData: FormData) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Ikke innlogget")
    }

    const fullName = (formData.get("full_name") as string | null)?.trim() || null

    const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName })
        .eq("id", user.id)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath("/profil")
}

export async function uploadProfileAvatar(formData: FormData) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Ikke innlogget")
    }

    const file = formData.get("avatar") as File | null

    if (!file || file.size === 0) {
        return
    }

    const rawNameExt = file.name?.includes(".") ? file.name.split(".").pop() : null
    const rawMimeExt = file.type?.includes("/") ? file.type.split("/").pop() : null
    const unsafeExts = new Set(["blob", "octet-stream"])
    const extCandidate = (rawNameExt || rawMimeExt || "png").toLowerCase()
    const ext = unsafeExts.has(extCandidate) ? "png" : extCandidate
    const mimeType = (file.type || "").toLowerCase()
    const contentType = mimeType.startsWith("image/") ? mimeType : "image/png"
    const filePath = `avatars/${user.id}.${ext}`

    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await supabase.storage
        .from("toppgroup")
        .upload(filePath, buffer, {
            upsert: true,
            contentType,
        })

    if (uploadError) {
        throw new Error(uploadError.message)
    }

    const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: filePath })
        .eq("id", user.id)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath("/profil")
}
