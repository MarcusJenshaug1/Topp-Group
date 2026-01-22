'use server'

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function getDocumentUrl(filePath: string, mode: 'preview' | 'download' = 'preview') {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Unauthorized")
    }

    const { data, error } = await supabase
        .storage
        .from('toppgroup')
        .createSignedUrl(filePath, 60, {
            download: mode === 'download' ? true : false
        })

    if (error) {
        console.error('Storage error:', error)
        throw new Error("Could not generate link")
    }

    if (!data?.signedUrl) {
        throw new Error("No signed URL returned")
    }

    // Redirect to the signed URL
    // If mode is 'preview' (target=_blank on client), it opens in new tab.
    // If mode is 'download', it triggers download in current tab (or new tab).
    redirect(data.signedUrl)
}

export async function getDocumentSignedUrl(
    filePath: string,
    mode: 'preview' | 'download' = 'preview',
    fileName?: string
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { data, error } = await supabase
        .storage
        .from('toppgroup')
        .createSignedUrl(filePath, 3600, {
            download: mode === 'download' ? (fileName || true) : false,
        }) // 1 hour signed URL

    if (error || !data?.signedUrl) return null
    return data.signedUrl
}
