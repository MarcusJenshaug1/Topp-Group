import { createClient } from "@/lib/supabase/server"
import { ProjectEditForm } from "@/components/admin/project-edit-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function NewProjectPage() {
    const supabase = await createClient()
    const { data: categories } = await supabase
        .from('project_categories')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true })

    const { data: authors } = await supabase
        .from('profiles')
        .select('id, full_name, display_name, email')
        .in('role', ['admin', 'editor'])
        .order('display_name', { ascending: true })

    // Initial empty project structure
    const newProject = {
        id: '',
        title: '',
        slug: '',
        category_id: '',
        year: new Date().getFullYear(),
        status: 'published',
        excerpt: '',
        content: '',
        location: '',
        area_sqm: null,
        cover_image_path: null,
        gallery: [],
        created_by: null,
        updated_by: null
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/prosjekter">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold tracking-tight">Nytt prosjekt</h1>
            </div>

            <ProjectEditForm project={newProject} categories={categories || []} authors={authors || []} />
        </div>
    )
}
