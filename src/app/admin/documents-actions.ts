'use server'

import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

const allowedMimeTypes = new Set([
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "text/csv",
    "image/jpeg",
    "image/png",
])

function assertAllowedFile(file: File) {
    const ext = file.name.split(".").pop()?.toLowerCase() || ""
    const allowedExt = new Set(["pdf", "docx", "xlsx", "pptx", "txt", "csv", "jpg", "jpeg", "png"])
    if (!allowedExt.has(ext) || !allowedMimeTypes.has(file.type)) {
        throw new Error("Filtypen støttes ikke. Tillatt: pdf, docx, xlsx, pptx, txt, csv, jpg, png.")
    }
}

export async function uploadDocument(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Unauthorized")
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || !['admin', 'editor'].includes(profile.role)) {
        throw new Error("Du har ikke rettigheter til å laste opp dokumenter")
    }

    const title = formData.get('title') as string
    const category_id = formData.get('category_id') as string // UUID
    const description = formData.get('description') as string
    const visibility = formData.get('visibility') as string // 'authenticated' | 'admin_only'

    const file = formData.get('file') as File

    if (!file) {
        throw new Error("No file uploaded")
    }

    assertAllowedFile(file)

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
    const { data: inserted, error: dbError } = await supabase
        .from('documents')
        .insert({
            title,
            category_id,
            description,
            file_path: filePath,
            file_name: file.name,
            mime_type: file.type,
            visibility: visibility || 'authenticated',
            published_at: new Date().toISOString(),
            created_by: user.id,
        })
        .select('id')
        .single()

    if (dbError || !inserted) {
        // Cleanup file if DB insert fails? ideally yes.
        console.error('DB Insert Error:', dbError)
        throw new Error(dbError.message)
    }

    const { error: versionError } = await supabase
        .from('document_versions')
        .insert({
            document_id: inserted.id,
            version_label: 'v1',
            title,
            file_path: filePath,
            file_name: file.name,
            mime_type: file.type,
            created_by: user.id,
        })

    if (versionError) {
        console.error('Document version insert error:', versionError)
    }

    revalidatePath('/admin/dokumenter')
    redirect('/admin/dokumenter')
}

export async function uploadDocumentVersion(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error("Unauthorized")
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || !['admin', 'editor'].includes(profile.role)) {
        throw new Error("Du har ikke rettigheter til å laste opp dokumenter")
    }

    const documentId = formData.get('document_id') as string
    const newTitle = (formData.get('title') as string | null)?.trim()
    const versionLabelInput = (formData.get('version_label') as string | null)?.trim()
    const versionDescription = (formData.get('description') as string | null)?.trim()
    const file = formData.get('file') as File | null

    if (!documentId) throw new Error("Mangler dokument-ID")
    if (!file) throw new Error("Ingen fil valgt")

    assertAllowedFile(file)

    const { data: existing, error: fetchError } = await supabase
        .from('documents')
        .select('id, title, file_path, file_name, mime_type, visibility, category_id, description')
        .eq('id', documentId)
        .single()

    if (fetchError || !existing) {
        console.error('Fetch document error:', fetchError)
        throw new Error("Fant ikke dokumentet")
    }

    let versionLabel = versionLabelInput

    if (!versionLabel) {
        const { count } = await supabase
            .from('document_versions')
            .select('id', { count: 'exact', head: true })
            .eq('document_id', documentId)

        const nextNumber = (count ?? 0) + 1
        versionLabel = `v${nextNumber}`
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `documents/${fileName}`

    const { error: uploadError } = await supabase.storage
        .from('toppgroup')
        .upload(filePath, file)

    if (uploadError) {
        console.error('Upload Error:', uploadError)
        throw new Error("File upload failed")
    }

    const titleToUse = newTitle && newTitle.length > 0 ? newTitle : existing.title

    const { error: updateError } = await supabase
        .from('documents')
        .update({
            title: titleToUse,
            file_path: filePath,
            file_name: file.name,
            mime_type: file.type,
            published_at: new Date().toISOString(),
        })
        .eq('id', documentId)
    const { error: versionInsertError } = await supabase
        .from('document_versions')
        .insert({
            document_id: documentId,
            version_label: versionLabel,
            title: titleToUse,
            file_path: filePath,
            file_name: file.name,
            mime_type: file.type,
            description: versionDescription || null,
            created_by: user.id,
        })

    if (versionInsertError) {
        console.error('Version insert error:', versionInsertError)
        throw new Error(versionInsertError.message)
    }

    if (updateError) {
        console.error('DB Update Error:', updateError)
        throw new Error(updateError.message)
    }

    // Optional: keep old file for traceability; if you want cleanup later, add a background task.

    revalidatePath('/admin/dokumenter')
    revalidatePath('/portal')
    redirect('/admin/dokumenter')
}

export async function deleteDocument(formData: FormData) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Unauthorized")
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle()

    if (!profile || !["admin", "editor"].includes(profile.role)) {
        throw new Error("Forbidden")
    }

    const documentId = (formData.get("document_id") as string | null)?.trim()
    if (!documentId) {
        throw new Error("Mangler dokument-ID")
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
        throw new Error("Server misconfigured")
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
        throw new Error("Fant ikke dokumentet")
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

    const { error: deleteError } = await supabaseAdmin
        .from("documents")
        .delete()
        .eq("id", documentId)

    if (deleteError) {
        throw new Error(deleteError.message)
    }

    revalidatePath("/admin/dokumenter")
    revalidatePath("/portal")
    redirect("/admin/dokumenter")
}

export async function updateDocumentVersion(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || !['admin', 'editor'].includes(profile.role)) {
        throw new Error("Du har ikke rettigheter til å endre versjoner")
    }

    const versionId = formData.get('version_id') as string | null
    const title = (formData.get('title') as string | null)?.trim()
    const versionLabel = (formData.get('version_label') as string | null)?.trim()
    const description = (formData.get('description') as string | null)?.trim()

    if (!versionId) throw new Error("Mangler versjons-ID")

    const update: Record<string, string | null> = {}
    if (title) update.title = title
    if (versionLabel) update.version_label = versionLabel
    if (description !== undefined) update.description = description || null

    if (Object.keys(update).length === 0) {
        return
    }

    const { error: updateError } = await supabase
        .from('document_versions')
        .update(update)
        .eq('id', versionId)

    if (updateError) {
        console.error('Update version error:', updateError)
        throw new Error(updateError.message)
    }

    revalidatePath('/admin/dokumenter')
    revalidatePath('/portal')
}

export async function createCategory(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || !['admin', 'editor'].includes(profile.role)) {
        throw new Error("Du har ikke rettigheter til å legge til kategorier")
    }

    const name = (formData.get('name') as string | null)?.trim()
    if (!name) throw new Error("Kategorinavn mangler")

    const { data: lastSort } = await supabase
        .from('document_categories')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1)

    const nextSort = (lastSort?.[0]?.sort_order ?? 0) + 1

    const { error: insertError } = await supabase
        .from('document_categories')
        .insert({ name, sort_order: nextSort })

    if (insertError) {
        console.error('Insert category error:', insertError)
        throw new Error(insertError.message)
    }

    revalidatePath('/admin/dokumenter/upload')
    revalidatePath('/admin/dokumenter')
}

