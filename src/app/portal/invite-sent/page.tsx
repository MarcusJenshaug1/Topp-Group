import { Container } from "@/components/ui/container"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function InviteSentPage() {
    return (
        <div className="flex-1 flex items-center justify-center py-24 bg-surface/50">
            <Container className="max-w-md">
                <Card>
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold">Sjekk e‑posten din</CardTitle>
                        <CardDescription>
                            Vi har sendt en lenke for å fullføre registreringen. Åpne lenken på enheten din for å sette passord.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        Hvis du ikke mottar e‑posten innen et par minutter, sjekk søppelpost.
                    </CardContent>
                </Card>
            </Container>
        </div>
    )
}
