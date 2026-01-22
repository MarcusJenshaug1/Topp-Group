'use server'

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { createAdminClient } from "@/lib/supabase/admin"

export async function createUserSilently(formData: FormData) {
    const email = (formData.get("email") as string)?.trim()
    const fullName = (formData.get("full_name") as string)?.trim()
    const role = (formData.get("role") as string)?.trim() || "viewer"

    if (!email) {
        throw new Error("E-post er påkrevd")
    }

    const admin = createAdminClient()

    const { data, error } = await admin.auth.admin.createUser({
        email,
        email_confirm: false,
        user_metadata: { full_name: fullName || null },
    })

    if (error) {
        throw new Error(error.message)
    }

    const userId = data?.user?.id
    if (userId) {
        await admin.from("profiles").upsert({
            id: userId,
            email,
            role,
            full_name: fullName || null,
        })
    }

    revalidatePath("/admin/brukere")
}

export async function sendInviteEmail(formData: FormData) {
    const email = (formData.get("email") as string)?.trim()
    const fullName = (formData.get("full_name") as string)?.trim()
    const role = (formData.get("role") as string)?.trim() || "viewer"

    if (!email) {
        throw new Error("E-post er påkrevd")
    }

    const admin = createAdminClient()
    const origin = (await headers()).get("origin") || ""
    const redirectTo = origin ? `${origin}/portal` : undefined

    const { data: existingProfile } = await admin
        .from("profiles")
        .select("id")
        .eq("email", email)
        .maybeSingle()

    if (existingProfile?.id) {
        const { data: userData } = await admin.auth.admin.getUserById(existingProfile.id)
        const invitedAt = userData?.user?.invited_at ? new Date(userData.user.invited_at) : null
        if (invitedAt) {
            const minutesSinceInvite = (Date.now() - invitedAt.getTime()) / (1000 * 60)
            if (minutesSinceInvite < 10) {
                revalidatePath("/admin/brukere")
                return
            }
        }
    }

    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
        data: { full_name: fullName || null },
        ...(redirectTo ? { redirectTo } : {}),
    })

    if (error) {
        if (error.message.toLowerCase().includes("rate limit")) {
            revalidatePath("/admin/brukere")
            return
        }
        throw new Error(error.message)
    }

    const userId = data?.user?.id
    if (userId) {
        await admin.from("profiles").upsert({
            id: userId,
            email,
            role,
            full_name: fullName || null,
        })
    }

    revalidatePath("/admin/brukere")
}

export async function updateUserRole(formData: FormData) {
    const userId = formData.get("user_id") as string
    const role = formData.get("role") as string

    if (!userId || !role) {
        throw new Error("Mangler bruker eller rolle")
    }

    const admin = createAdminClient()
    const { error } = await admin.from("profiles").update({ role }).eq("id", userId)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath("/admin/brukere")
}

export async function updateUserName(formData: FormData) {
    const userId = formData.get("user_id") as string
    const fullName = (formData.get("full_name") as string)?.trim()

    if (!userId) {
        throw new Error("Mangler bruker")
    }

    const admin = createAdminClient()
    const { error } = await admin
        .from("profiles")
        .update({ full_name: fullName || null })
        .eq("id", userId)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath("/admin/brukere")
}

export async function uploadUserAvatar(formData: FormData) {
    const userId = formData.get("user_id") as string
    const file = formData.get("avatar") as File | null

    if (!userId) {
        throw new Error("Mangler bruker")
    }

    if (!file || file.size === 0) {
        return
    }

    const admin = createAdminClient()

    const rawNameExt = file.name?.includes(".") ? file.name.split(".").pop() : null
    const rawMimeExt = file.type?.includes("/") ? file.type.split("/").pop() : null
    const unsafeExts = new Set(["blob", "octet-stream"])
    const extCandidate = (rawNameExt || rawMimeExt || "png").toLowerCase()
    const ext = unsafeExts.has(extCandidate) ? "png" : extCandidate
    const filePath = `avatars/${userId}.${ext}`
    const mimeType = (file.type || "").toLowerCase()
    const contentType = mimeType.startsWith("image/") ? mimeType : "image/png"

    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await admin.storage
        .from("toppgroup")
        .upload(filePath, buffer, {
            upsert: true,
            contentType,
        })

    if (uploadError) {
        throw new Error(uploadError.message)
    }

    const { error } = await admin
        .from("profiles")
        .update({ avatar_url: filePath })
        .eq("id", userId)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath("/admin/brukere")
}

export async function deleteUser(formData: FormData) {
    const userId = formData.get("user_id") as string

    if (!userId) {
        throw new Error("Mangler bruker")
    }

    const admin = createAdminClient()
    const { data: profile } = await admin
        .from("profiles")
        .select("avatar_url")
        .eq("id", userId)
        .maybeSingle()

    if (profile?.avatar_url) {
        await admin.storage.from("toppgroup").remove([profile.avatar_url])
    }

    const { error: deleteProfileError } = await admin.from("profiles").delete().eq("id", userId)

    if (deleteProfileError) {
        throw new Error(deleteProfileError.message)
    }

    const { error: deleteAuthError } = await admin.auth.admin.deleteUser(userId)

    if (deleteAuthError) {
        throw new Error(deleteAuthError.message)
    }

    revalidatePath("/admin/brukere")
}
