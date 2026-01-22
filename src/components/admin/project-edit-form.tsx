'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { updateProject, createProject, createProjectDraft, updateProjectDraft } from "@/app/admin/projects-actions"
import { Loader2, Upload, X, Trash, Save, ImageIcon } from "lucide-react"

interface Category {
    id: string
    name: string
    slug?: string
    sort_order?: number | null
}

interface Project {
    id: string
    title: string
    slug: string
    category_id: string
    year: number
    status: string
    excerpt: string | null
    content?: string | null
    location?: string | null
    area_sqm?: number | null
    cover_image_path: string | null
    gallery: string[] | null // Array of paths
    created_by?: string | null
    updated_by?: string | null
}

interface ProjectEditFormProps {
    project: Project
    categories: Category[]
    authors?: { id: string; full_name?: string | null; display_name?: string | null; email?: string | null }[]
}

export function ProjectEditForm({ project, categories, authors = [] }: ProjectEditFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [coverImage, setCoverImage] = useState<string | null>(project.cover_image_path)
    const [gallery, setGallery] = useState<string[]>(Array.isArray(project.gallery) ? project.gallery : [])
    const [uploading, setUploading] = useState(false)
    const [slug, setSlug] = useState(project.slug)
    const [title, setTitle] = useState(project.title)
    const [manuallyEditedSlug, setManuallyEditedSlug] = useState(false)
    const [coverPreview, setCoverPreview] = useState<string | null>(null)
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>([])
    const [projectId, setProjectId] = useState(project.id)
    const [excerpt, setExcerpt] = useState(project.excerpt || '')
    const [content, setContent] = useState(project.content || '')
    const [categoryId, setCategoryId] = useState(project.category_id || '')
    const [year, setYear] = useState(project.year ? String(project.year) : '')
    const [status, setStatus] = useState(project.status || 'draft')
    const [location, setLocation] = useState(project.location || '')
    const [areaSqm, setAreaSqm] = useState(project.area_sqm ? String(project.area_sqm) : '')
    const [isDraftCreating, setIsDraftCreating] = useState(false)
    const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
    const [feedback, setFeedback] = useState<string | null>(null)
    const [categoryError, setCategoryError] = useState<string | null>(null)
    const [authorId, setAuthorId] = useState(project.created_by || '')

    const isNewProject = !project.id
    const supabase = createClient()

    function slugify(value: string) {
        return value
            .toLowerCase()
            .replace(/æ/g, 'ae')
            .replace(/ø/g, 'o')
            .replace(/å/g, 'a')
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
    }

    function sortCategories(items: Category[]) {
        return [...items].sort((a, b) => {
            const orderA = a.sort_order ?? Number.MAX_SAFE_INTEGER
            const orderB = b.sort_order ?? Number.MAX_SAFE_INTEGER
            if (orderA !== orderB) return orderA - orderB
            return a.name.localeCompare(b.name)
        })
    }

    function nextSortOrder(items: Category[]) {
        if (!items || items.length === 0) return 1
        const max = Math.max(...items.map(c => c.sort_order ?? 0))
        return (Number.isFinite(max) ? max + 1 : 1)
    }
    const [categoryOptions, setCategoryOptions] = useState<Category[]>(() => sortCategories(categories))
    const [newCategoryName, setNewCategoryName] = useState('')
    const [newCategoryOrder, setNewCategoryOrder] = useState('')
    const [selectedCategoryOrder, setSelectedCategoryOrder] = useState<string>('')
    const [isSavingCategory, setIsSavingCategory] = useState(false)
    const [categoryMessage, setCategoryMessage] = useState<string | null>(null)

    // Auto-slug generation
    useEffect(() => {
        if (!manuallyEditedSlug && title) {
            const generatedSlug = title
                .toLowerCase()
                .replace(/æ/g, 'ae')
                .replace(/ø/g, 'o')
                .replace(/å/g, 'a')
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '')
            setSlug(generatedSlug)
        }
    }, [title, manuallyEditedSlug])

    useEffect(() => {
        if (!newCategoryOrder) {
            setNewCategoryOrder(String(nextSortOrder(categoryOptions)))
        }
    }, [categoryOptions, newCategoryOrder])

    useEffect(() => {
        const current = categoryOptions.find((cat) => cat.id === categoryId)
        setSelectedCategoryOrder(current?.sort_order != null ? String(current.sort_order) : '')
    }, [categoryId, categoryOptions])

    useEffect(() => {
        const createDraftIfNeeded = async () => {
            if (!isNewProject || projectId || !title || !slug || isDraftCreating) return

            try {
                setIsDraftCreating(true)
                const newId = await createProjectDraft({
                    title,
                    slug,
                    category_id: categoryId || null,
                    year: year ? parseInt(year) : null,
                    excerpt,
                    content,
                    location,
                    area_sqm: areaSqm ? parseInt(areaSqm) : null,
                })
                setProjectId(newId)
            } catch (error) {
                console.error('Error creating draft:', error)
            } finally {
                setIsDraftCreating(false)
            }
        }

        createDraftIfNeeded()
    }, [title, slug, categoryId, year, excerpt, content, location, areaSqm, isNewProject, projectId, isDraftCreating])

    useEffect(() => {
        if (!projectId) return

        const handle = setTimeout(async () => {
            try {
                await updateProjectDraft(projectId, {
                    title,
                    slug,
                    category_id: categoryId || null,
                    year: year ? parseInt(year) : null,
                    excerpt,
                    content,
                    location,
                    area_sqm: areaSqm ? parseInt(areaSqm) : null,
                    status: isNewProject ? 'draft' : status,
                })
                setLastSavedAt(new Date().toISOString())
            } catch (error) {
                console.error('Auto-save failed:', error)
            }
        }, 800)

        return () => clearTimeout(handle)
    }, [projectId, title, slug, categoryId, year, excerpt, content, location, areaSqm, status, isNewProject])

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSlug(e.target.value)
        setManuallyEditedSlug(true)
    }

    // Handle Cover Image Upload
    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true)
            const file = e.target.files?.[0]
            if (!file) return

            if (!projectId) {
                const previewUrl = URL.createObjectURL(file)
                setCoverPreview(previewUrl)
                return
            }

            const fileExt = file.name.split('.').pop()
            const fileName = `cover-${Date.now()}.${fileExt}`
            const filePath = `projects/${projectId}/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('toppgroup')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('toppgroup')
                .getPublicUrl(filePath)

            // For now, we store just the path or publicUrl depending on preference.
            // Let's store the full Public URL for easier display, or relative path if strict.
            // Implementation Plan says "path", but public URL is easier for next/image.
            // Let's store the relative path for consistency with current schema ideas, 
            // but we might need public URL for display.
            // Actually, "cover_image_path" suggests path. 
            // Let's store the PATH and generate URL on fly or store URL.
            // Let's stick to storing the PATH for now: `projects/${project.id}/${fileName}`

            setCoverImage(filePath)
        } catch (error) {
            console.error('Error uploading cover:', error)
            alert('Feil ved opplasting av bilde')
        } finally {
            setUploading(false)
        }
    }

    // Handle Gallery Uploads
    const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true)
            const files = e.target.files
            if (!files || files.length === 0) return

            if (!projectId) {
                const previewUrls = Array.from(files).map((file) => URL.createObjectURL(file))
                setGalleryPreviews(previewUrls)
                return
            }

            const newPaths: string[] = []

            for (let i = 0; i < files.length; i++) {
                const file = files[i]
                const fileExt = file.name.split('.').pop()
                const fileName = `gallery-${Date.now()}-${i}.${fileExt}`
                const filePath = `projects/${projectId}/gallery/${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from('toppgroup')
                    .upload(filePath, file)

                if (uploadError) {
                    console.error('Failed to upload', file.name, uploadError)
                    continue
                }

                newPaths.push(filePath)
            }

            setGallery(prev => [...prev, ...newPaths])
        } catch (error) {
            console.error('Error uploading gallery:', error)
            alert('Feil ved opplasting av galleri')
        } finally {
            setUploading(false)
        }
    }

    const removeGalleryImage = (pathToRemove: string) => {
        setGallery(prev => prev.filter(path => path !== pathToRemove))
    }

        const getImageUrl = (path: string | null) => {
        if (!path) return null
        if (path.startsWith('http')) return path // Already a URL
        return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/toppgroup/${path}`
    }

        const handleCreateCategory = async () => {
            const trimmedName = newCategoryName.trim()
            if (!trimmedName) {
                setCategoryMessage('Navn mangler')
                return
            }

            try {
                setIsSavingCategory(true)
                setCategoryMessage(null)

                const parsedOrder = newCategoryOrder ? parseInt(newCategoryOrder, 10) : nextSortOrder(categoryOptions)
                const safeOrder = Number.isNaN(parsedOrder) ? null : parsedOrder

                const { data, error } = await supabase
                    .from('project_categories')
                    .insert({
                        name: trimmedName,
                        slug: slugify(trimmedName),
                        sort_order: safeOrder,
                    })
                    .select('id, name, sort_order')
                    .single()

                if (error) throw error

                const updated = sortCategories([...categoryOptions, data as Category])
                setCategoryOptions(updated)
                setCategoryId(data.id)
                setSelectedCategoryOrder(data.sort_order != null ? String(data.sort_order) : '')
                setNewCategoryName('')
                setNewCategoryOrder(String(nextSortOrder(updated)))
                setCategoryError(null)
                setCategoryMessage('Kategori opprettet')
            } catch (err) {
                console.error('Error creating category:', err)
                setCategoryMessage('Kunne ikke opprette kategorien')
            } finally {
                setIsSavingCategory(false)
            }
        }

        const handleUpdateCategoryOrder = async () => {
            if (!categoryId) return
            const parsedOrder = selectedCategoryOrder ? parseInt(selectedCategoryOrder, 10) : null

            try {
                setIsSavingCategory(true)
                setCategoryMessage(null)

                const { data, error } = await supabase
                    .from('project_categories')
                    .update({ sort_order: Number.isNaN(parsedOrder) ? null : parsedOrder })
                    .eq('id', categoryId)
                    .select('id, name, sort_order')
                    .single()

                if (error) throw error

                const updated = sortCategories(
                    categoryOptions.map((cat) => (cat.id === categoryId ? { ...cat, sort_order: data.sort_order } : cat))
                )
                setCategoryOptions(updated)
                setCategoryMessage('Rekkefølge oppdatert')
            } catch (err) {
                console.error('Error updating category order:', err)
                setCategoryMessage('Kunne ikke oppdatere rekkefølgen')
            } finally {
                setIsSavingCategory(false)
            }
        }

    const onSubmit = async (formData: FormData) => {
        try {
            setIsLoading(true)
            setCategoryError(null)
            
            // Ensure controlled inputs are in formData if needed (Next.js React 19 handles this mostly automatically for inputs with name)
            // But we have controlled state for slug and title which we might want to sync if not updated
            formData.set('slug', slug)
            formData.set('title', title)
            formData.set('category_id', categoryId)
            formData.set('status', status || 'draft')
            formData.set('cover_image_path', coverImage || '')
            formData.set('gallery', JSON.stringify(gallery))
            formData.set('created_by_override', authorId || '')

            if (status !== 'draft' && !categoryId) {
                setCategoryError('Velg kategori for å publisere')
                setIsLoading(false)
                return
            }

            if (isNewProject && projectId) {
                formData.set('status', status || 'draft')
                await updateProject(projectId, formData)
                setFeedback(status === 'published' ? 'Prosjekt publisert' : 'Prosjekt lagret')
                router.push('/admin/prosjekter')
            } else if (isNewProject) {
                await createProject(formData)
                // createProject redirects server-side
            } else {
                await updateProject(project.id, formData)
                setFeedback(status === 'published' ? 'Prosjekt publisert' : 'Prosjekt lagret')
                router.refresh()
                router.push('/admin/prosjekter')
            }

            setLastSavedAt(new Date().toISOString())
        } catch (error) {
            console.error('Error saving project:', error)
            alert('Kunne ikke lagre prosjektet')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form action={onSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
                <Card className="bg-surface shadow-sm pt-6">
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="title" className="text-sm font-medium">Prosjekttittel</label>
                            <Input 
                                name="title" 
                                id="title" 
                                required 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="slug" className="text-sm font-medium">URL Slug</label>
                            <Input 
                                name="slug" 
                                id="slug" 
                                value={slug} 
                                onChange={handleSlugChange}
                            />
                            {isNewProject && (
                                <p className="text-xs text-muted-foreground">Genereres automatisk fra tittel hvis tom.</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="excerpt" className="text-sm font-medium">Kort beskrivelse</label>
                            <Textarea name="excerpt" id="excerpt" rows={4} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="content" className="text-sm font-medium">Prosjektbeskrivelse</label>
                            <Textarea
                                name="content"
                                id="content"
                                rows={6}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Skriv en mer utfyllende beskrivelse som vises på prosjektsiden."
                            />
                        </div>

                        {/* Gallery Section */}
                        <div className="space-y-4 pt-4 border-t">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium flex items-center gap-2">
                                    <ImageIcon className="h-4 w-4" />
                                    Bildegalleri
                                </h3>
                                <div className="relative">
                                    <Input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="hidden"
                                        id="gallery-upload"
                                        name={isNewProject ? "gallery_upload" : undefined}
                                        onChange={handleGalleryUpload}
                                        disabled={uploading}
                                    />
                                    <Button type="button" variant="outline" size="sm" asChild disabled={uploading}>
                                        <label
                                            htmlFor="gallery-upload"
                                            className="cursor-pointer flex w-full items-center justify-center gap-2 px-2"
                                        >
                                            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                            <span>{isNewProject ? "Velg bilder" : "Last opp bilder"}</span>
                                        </label>
                                    </Button>
                                </div>
                            </div>

                            {isNewProject && galleryPreviews.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {galleryPreviews.map((src, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border bg-muted">
                                            <Image src={src} alt="Gallery preview" fill className="object-cover" />
                                        </div>
                                    ))}
                                </div>
                            ) : gallery.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {gallery.map((path, idx) => (
                                        <div key={idx} className="group relative aspect-square rounded-lg overflow-hidden border bg-muted">
                                            <Image
                                                src={getImageUrl(path) || ''}
                                                alt="Gallery image"
                                                fill
                                                className="object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeGalleryImage(path)}
                                                className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive/90 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 border-2 border-dashed rounded-lg text-center text-muted-foreground text-sm">
                                    Ingen bilder i galleriet.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
                {(feedback || lastSavedAt) && (
                    <div className="space-y-2">
                        {feedback && (
                            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-xs text-green-700">
                                {feedback}
                            </div>
                        )}
                        {lastSavedAt && (
                            <div className="rounded-lg border border-border/60 bg-surface-muted/40 px-4 py-3 text-xs text-muted-foreground">
                                Utkast lagret {new Date(lastSavedAt).toLocaleTimeString("no-NO", { hour: "2-digit", minute: "2-digit" })}
                            </div>
                        )}
                    </div>
                )}
                <Card className="bg-surface shadow-sm pt-6">
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Status</label>
                            <select
                                name="status"
                                value={status}
                                onChange={(e) => {
                                    setStatus(e.target.value)
                                    if (e.target.value === 'draft') {
                                        setCategoryError(null)
                                    }
                                }}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <option value="published">Publisert</option>
                                <option value="draft">Kladd</option>
                                <option value="archived">Arkivert</option>
                            </select>
                        </div>

                        {authors.length > 0 && (
                            <div className="space-y-2">
                                <label htmlFor="created_by_override" className="text-sm font-medium">Forfatter</label>
                                <select
                                    name="created_by_override"
                                    id="created_by_override"
                                    value={authorId}
                                    onChange={(e) => setAuthorId(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    <option value="">Bruk innlogget</option>
                                    {authors.map((author) => {
                                        const label = author.full_name || author.display_name || author.email || 'Ukjent bruker'
                                        return (
                                            <option key={author.id} value={author.id}>{label}</option>
                                        )
                                    })}
                                </select>
                                <p className="text-xs text-muted-foreground">Kan endres av admin/editor.</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label htmlFor="category_id" className="text-sm font-medium">Kategori</label>
                            <select
                                name="category_id"
                                value={categoryId}
                                onChange={(e) => {
                                    setCategoryId(e.target.value)
                                    setCategoryError(null)
                                }}
                                className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 ${categoryError ? 'border-destructive focus-visible:ring-destructive' : 'border-input focus-visible:ring-ring'}`}
                            >
                                <option value="">Velg kategori</option>
                                {categoryOptions.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            {categoryError && (
                                <p className="text-xs text-destructive">{categoryError}</p>
                            )}
                        </div>

                        <div className="space-y-4 rounded-lg border border-border/60 bg-surface-muted/40 p-4 text-sm">
                            <p className="text-sm font-semibold">Administrer kategorier</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">Ny kategori</label>
                                    <Input
                                        placeholder="Navn"
                                        value={newCategoryName}
                                        onChange={(e) => {
                                            setNewCategoryName(e.target.value)
                                            setCategoryError(null)
                                        }}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">Rekkefølge</label>
                                    <Input
                                        placeholder="1"
                                        type="number"
                                        value={newCategoryOrder}
                                        onChange={(e) => setNewCategoryOrder(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-end">
                                    <Button type="button" variant="outline" className="w-full" onClick={handleCreateCategory} disabled={isSavingCategory}>
                                        {isSavingCategory ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Legg til'}
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">Rekkefølge for valgt</label>
                                    <Input
                                        placeholder="1"
                                        type="number"
                                        value={selectedCategoryOrder}
                                        onChange={(e) => setSelectedCategoryOrder(e.target.value)}
                                        disabled={!categoryId}
                                    />
                                </div>
                                <div className="sm:col-span-2 flex items-end">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="w-full justify-center"
                                        onClick={handleUpdateCategoryOrder}
                                        disabled={!categoryId || isSavingCategory}
                                    >
                                        {isSavingCategory ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Oppdater rekkefølge'}
                                    </Button>
                                </div>
                            </div>

                            {categoryMessage && (
                                <p className="text-xs text-muted-foreground">{categoryMessage}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="year" className="text-sm font-medium">Årstall</label>
                            <Input name="year" id="year" type="number" value={year} onChange={(e) => setYear(e.target.value)} />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="location" className="text-sm font-medium">Lokasjon</label>
                            <Input name="location" id="location" type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="F.eks. Gjøvik" />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="area_sqm" className="text-sm font-medium">Areal (kvm)</label>
                            <Input name="area_sqm" id="area_sqm" type="number" value={areaSqm} onChange={(e) => setAreaSqm(e.target.value)} placeholder="F.eks. 1200" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-surface shadow-sm pt-6">
                    <CardContent className="space-y-4">
                        <h3 className="text-sm font-medium">Fremhevet bilde</h3>

                        <div className="space-y-3">
                            {coverImage || coverPreview ? (
                                <div className="relative aspect-video w-full rounded-lg overflow-hidden border bg-muted">
                                    <Image
                                        src={coverPreview || getImageUrl(coverImage) || ''}
                                        alt="Cover image"
                                        fill
                                        className="object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCoverImage(null)
                                            setCoverPreview(null)
                                        }}
                                        className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive/90 text-white"
                                    >
                                        <Trash className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="aspect-video w-full rounded-lg border-2 border-dashed flex items-center justify-center bg-muted/30">
                                    <p className="text-xs text-muted-foreground">Ingen bilde valgt</p>
                                </div>
                            )}

                            <div className="relative">
                                <Input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    id="cover-upload"
                                    name={isNewProject ? "cover_upload" : undefined}
                                    onChange={handleCoverUpload}
                                    disabled={uploading}
                                />
                                <Button type="button" variant="outline" className="w-full" asChild disabled={uploading}>
                                    <label
                                        htmlFor="cover-upload"
                                        className="cursor-pointer flex w-full items-center justify-center gap-2"
                                    >
                                        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                        <span>{isNewProject ? "Velg bilde" : "Last opp bilde"}</span>
                                    </label>
                                </Button>
                                {!projectId && (
                                    <p className="text-xs text-center text-muted-foreground mt-2">
                                        Bildene lastes opp når du lagrer prosjektet.
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="pt-2">
                    <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                        Lagre endringer
                    </Button>
                </div>
            </div>
        </form>
    )
}
