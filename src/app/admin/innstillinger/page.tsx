import { Container } from "@/components/ui/container"

export default function AdminSettingsPage() {
    return (
        <Container className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Innstillinger</h1>
                <p className="text-muted-foreground">Basisinnstillinger for administrasjon.</p>
            </div>

            <div className="rounded-xl border border-border bg-surface p-6 text-sm text-muted-foreground">
                Innstillinger er under oppsett. Dette området er klart for videre konfigurasjon.
            </div>
        </Container>
    )
}
