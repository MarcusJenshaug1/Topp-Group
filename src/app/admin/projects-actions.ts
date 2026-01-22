'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

async function resolveAuthorId(supabase: any, requestedId: string | null, fallbackId: string | null) {
    if (!requestedId) return fallbackId

    const { data, error } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', requestedId)
        .in('role', ['admin', 'editor'])
        .limit(1)
        .single()

    if (error) {
        console.warn('Author override rejected, keeping fallback', error)
        return fallbackId
    }

    return data?.id ?? fallbackId
}

export async function createProject(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const title = formData.get('title') as string
    const category_id = formData.get('category_id') as string
    const slug = formData.get('slug') as string
    const year = parseInt(formData.get('year') as string)
    const status = (formData.get('status') as string) || 'draft'
    const excerpt = formData.get('excerpt') as string
    const content = formData.get('content') as string
    const location = formData.get('location') as string
    const area_sqm_raw = formData.get('area_sqm') as string
    const area_sqm = area_sqm_raw ? parseInt(area_sqm_raw) : null
    const requestedAuthorId = (formData.get('created_by_override') as string) || null

    // Simple validation
    if (!title || !slug) {
        throw new Error("Missing required fields")
    }

    if (status !== 'draft' && !category_id) {
        throw new Error("Missing required fields")
    }

    const resolvedAuthorId = await resolveAuthorId(supabase, requestedAuthorId, user?.id ?? null)

    const { data: inserted, error } = await supabase
        .from('projects')
        .insert({
        title,
        category_id,
        slug,
        year: Number.isNaN(year) ? null : year,
        status,
        excerpt,
        content: content || null,
        location: location || null,
        area_sqm: Number.isNaN(area_sqm) ? null : area_sqm,
        created_by: resolvedAuthorId,
        updated_by: user?.id ?? null
    })
        .select('id')
        .single()

    if (error) {
        console.error("Error creating project:", error)
        throw new Error(error.message)
    }

    const projectId = inserted?.id

    if (projectId) {
        const coverFile = formData.get('cover_upload') as File | null
        const galleryFiles = formData.getAll('gallery_upload') as File[]

        let coverPath: string | null = null
        const galleryPaths: string[] = []

        if (coverFile && coverFile.size > 0) {
            const coverExt = coverFile.name.split('.').pop()
            const coverName = `cover-${Date.now()}.${coverExt}`
            const coverFilePath = `projects/${projectId}/${coverName}`

            const { error: coverError } = await supabase.storage
                .from('toppgroup')
                .upload(coverFilePath, coverFile)

            if (!coverError) {
                coverPath = coverFilePath
            }
        }

        if (galleryFiles && galleryFiles.length > 0) {
            for (let i = 0; i < galleryFiles.length; i++) {
                const file = galleryFiles[i]
                if (!file || file.size === 0) continue
                const ext = file.name.split('.').pop()
                const fileName = `gallery-${Date.now()}-${i}.${ext}`
                const filePath = `projects/${projectId}/gallery/${fileName}`

                const { error: galleryError } = await supabase.storage
                    .from('toppgroup')
                    .upload(filePath, file)

                if (!galleryError) {
                    galleryPaths.push(filePath)
                }
            }
        }

        if (coverPath || galleryPaths.length > 0) {
            await supabase
                .from('projects')
                .update({
                    cover_image_path: coverPath,
                    gallery: galleryPaths
                })
                .eq('id', projectId)
        }

        await supabase
            .from('project_revisions')
            .insert({
                project_id: projectId,
                user_id: user?.id ?? null,
                action: 'create',
                payload: { title, status, category_id, slug }
            })
    }

    revalidatePath('/admin/prosjekter')
    redirect('/admin/prosjekter')
}

export async function createProjectDraft(payload: {
    title: string
    slug: string
    category_id?: string | null
    year?: number | null
    excerpt?: string | null
    content?: string | null
    location?: string | null
    area_sqm?: number | null
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!payload.title || !payload.slug) {
        throw new Error("Missing required fields")
    }

    const { data, error } = await supabase
        .from('projects')
        .insert({
            title: payload.title,
            slug: payload.slug,
            category_id: payload.category_id || null,
            year: payload.year ?? null,
            status: 'draft',
            excerpt: payload.excerpt || null,
            content: payload.content || null,
            location: payload.location || null,
            area_sqm: payload.area_sqm ?? null,
            created_by: user?.id ?? null,
            updated_by: user?.id ?? null
        })
        .select('id')
        .single()

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/admin/prosjekter')
    return data?.id as string
}

export async function updateProjectDraft(id: string, payload: {
    title?: string
    slug?: string
    category_id?: string | null
    year?: number | null
    excerpt?: string | null
    content?: string | null
    location?: string | null
    area_sqm?: number | null
    status?: string
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
        .from('projects')
        .update({
            title: payload.title,
            slug: payload.slug,
            category_id: payload.category_id ?? null,
            year: payload.year ?? null,
            status: payload.status || 'draft',
            excerpt: payload.excerpt || null,
            content: payload.content || null,
            location: payload.location || null,
            area_sqm: payload.area_sqm ?? null,
            updated_at: new Date().toISOString(),
            updated_by: user?.id ?? null
        })
        .eq('id', id)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/admin/prosjekter')
}

export async function updateProject(id: string, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const title = formData.get('title') as string
    const category_id = formData.get('category_id') as string
    const slug = formData.get('slug') as string
    const year = parseInt(formData.get('year') as string)
    const status = formData.get('status') as string
    const excerpt = formData.get('excerpt') as string
    const cover_image_path = formData.get('cover_image_path') as string
    const content = formData.get('content') as string
    const location = formData.get('location') as string
    const area_sqm_raw = formData.get('area_sqm') as string
    const area_sqm = area_sqm_raw ? parseInt(area_sqm_raw) : null
    const requestedAuthorId = (formData.get('created_by_override') as string) || null

    // Parse gallery JSON
    let gallery: string[] = []
    try {
        const galleryRaw = formData.get('gallery') as string
        if (galleryRaw) {
            gallery = JSON.parse(galleryRaw)
        }
    } catch (e) {
        console.error("Error parsing gallery JSON", e)
    }

    // Simple validation
    if (!title || !slug) {
        throw new Error("Missing required fields")
    }

    if (status !== 'draft' && !category_id) {
        throw new Error("Missing required fields")
    }

    const resolvedAuthorId = await resolveAuthorId(supabase, requestedAuthorId, user?.id ?? null)

    const { error } = await supabase.from('projects').update({
        title,
        category_id: category_id || null,
        slug,
        year,
        status,
        excerpt,
        content: content || null,
        location: location || null,
        area_sqm: Number.isNaN(area_sqm) ? null : area_sqm,
        cover_image_path: cover_image_path || null,
        gallery: gallery,
        updated_at: new Date().toISOString(),
        updated_by: user?.id ?? null,
        created_by: resolvedAuthorId
    }).eq('id', id)

    if (error) {
        console.error("Error updating project:", error)
        throw new Error(error.message)
    }

    revalidatePath('/admin/prosjekter')
    revalidatePath(`/admin/prosjekter/${id}`)
    revalidatePath(`/eiendom`)
    revalidatePath(`/eiendom/${slug}`) // In case slug changed, tricky but okay

    await supabase
        .from('project_revisions')
        .insert({
            project_id: id,
            user_id: user?.id ?? null,
            action: 'update',
            payload: { title, status, category_id, slug }
        })
}
