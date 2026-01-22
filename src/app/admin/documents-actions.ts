'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function uploadDocument(formData: FormData) {
    const supabase = await createClient()

    const title = formData.get('title') as string
    const category_id = formData.get('category_id') as string // UUID
    const description = formData.get('description') as string
    const visibility = formData.get('visibility') as string // 'authenticated' | 'admin_only'

    const file = formData.get('file') as File

    if (!file) {
        throw new Error("No file uploaded")
    }

    // Upload to Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `documents/${fileName}`

    // Convert File to Buffer for Supabase (if needed, or just pass Blob)
    // supabase-js supports File directly in browser, but on server with Node?
    // Next.js FormData File extends Blob. supabase-js supports Blob.

    const { error: uploadError } = await supabase.storage
        .from('toppgroup')
        .upload(filePath, file)

    if (uploadError) {
        console.error('Upload Error:', uploadError)
        throw new Error("File upload failed")
    }

    // Insert Record
    const { error: dbError } = await supabase.from('documents').insert({
        title,
        category_id,
        description,
        file_path: filePath,
        file_name: file.name,
        mime_type: file.type,
        visibility: visibility || 'authenticated',
        published_at: new Date().toISOString()
    })

    if (dbError) {
        // Cleanup file if DB insert fails? ideally yes.
        console.error('DB Insert Error:', dbError)
        throw new Error(dbError.message)
    }

    revalidatePath('/admin/dokumenter')
    redirect('/admin/dokumenter')
}
