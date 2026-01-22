"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash } from "lucide-react"

interface DeleteDocumentButtonProps {
    documentId: string
}

export function DeleteDocumentButton({ documentId }: DeleteDocumentButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const router = useRouter()

    return (
        <Button
            variant="destructive"
            size="sm"
            className="gap-2 cursor-pointer hover:opacity-90"
            aria-label="Slett dokument"
            type="button"
            disabled={isDeleting}
            onClick={async () => {
                const ok = window.confirm("Er du sikker på at du vil slette dokumentet? Dette kan ikke angres.")
                if (!ok) return

                setIsDeleting(true)
                try {
                    const response = await fetch(`/api/admin/documents/${documentId}`, {
                        method: "DELETE",
                    })

                    if (!response.ok) {
                        const payload = await response.json().catch(() => ({}))
                        throw new Error(payload.error || "Kunne ikke slette dokumentet.")
                    }

                    router.refresh()
                } catch (error) {
                    console.error(error)
                    alert(error instanceof Error ? error.message : "Kunne ikke slette dokumentet.")
                } finally {
                    setIsDeleting(false)
                }
            }}
        >
            <Trash className="h-4 w-4" />
            Slett
        </Button>
    )
}
