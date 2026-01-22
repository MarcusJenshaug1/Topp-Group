import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Container } from "@/components/ui/container"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, LogOut } from "lucide-react"
import { DocumentList } from "@/components/domain/document-list"
import { Reveal } from "@/components/motion/reveal"

export default async function PortalPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return redirect("/portal/login")
    }

    // Fetch Documents
    const { data: documents } = await supabase
        .from('documents')
        .select('*, document_categories(name)')
        .order('created_at', { ascending: false })

    // Handle logout via Server Action or Client Component? 
    // For simplicity here, usually logout is Client side.
    // I will make a logout button client component or form action.

    return (
        <div className="py-12">
            <Container>
                <Reveal variant="fadeUp">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight mb-2">Dokumentportal</h1>
                            <p className="text-muted-foreground">
                                Velkommen, {user.email}. Her finner du dine tilgjengelige dokumenter.
                            </p>
                        </div>

                        <form action="/auth/signout" method="post">
                            {/* Note: I need to implement /auth/signout route or use a client component for SignOut */}
                            <Button variant="outline">
                                <LogOut className="mr-2 h-4 w-4" />
                                Logg ut
                            </Button>
                        </form>
                    </div>
                </Reveal>

                <Reveal variant="fadeUp" delay={80}>
                    <div className="flex flex-col md:flex-row gap-4 mb-8">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Søk i dokumenter..." className="pl-9" />
                        </div>
                        {/* Add Category Filters later if needed */}
                    </div>
                </Reveal>

                <Reveal variant="fadeUp" delay={140}>
                    <DocumentList documents={documents} />
                </Reveal>
            </Container>
        </div>
    )
}
