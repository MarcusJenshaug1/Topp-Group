import { Container } from "@/components/ui/container"
import { DocumentVersionPanel } from "@/components/admin/document-version-panel"

export const dynamic = "force-dynamic"
export const revalidate = 0

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function DocumentVersionPage({ params }: PageProps) {
    const { id } = await params
    const documentId = decodeURIComponent(id)

    return (
        <Container className="py-10 space-y-6">
            <DocumentVersionPanel documentId={documentId} />
        </Container>
    )
}
