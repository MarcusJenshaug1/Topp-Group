'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Container } from "@/components/ui/container"
import { AlertCircle, Loader2 } from "lucide-react"

export function CompleteAccountForm() {
    const router = useRouter()
    const supabase = createClient()

    const [password, setPassword] = useState("")
    const [confirm, setConfirm] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [ready, setReady] = useState(false)

    useEffect(() => {
        const init = async () => {
            const { data } = await supabase.auth.getSession()
            if (!data.session) {
                setError("Du må logge inn med midlertidig passord før du kan velge nytt passord.")
                setReady(false)
                return
            }
            setReady(true)
        }

        init()
    }, [supabase])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (!ready) {
            setError("Du må logge inn før du kan velge nytt passord.")
            setLoading(false)
            return
        }

        if (password.length < 8) {
            setError("Passordet må være minst 8 tegn")
            setLoading(false)
            return
        }

        if (password !== confirm) {
            setError("Passordene er ikke like")
            setLoading(false)
            return
        }

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password,
                data: { has_password: true, must_change_password: false },
            })
            if (updateError) {
                setError(updateError.message)
                return
            }

            router.refresh()
            router.push("/portal")
        } catch {
            setError("Noe gikk galt. Prøv igjen.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex-1 flex items-center justify-center py-24 bg-surface/50">
            <Container className="max-w-md">
                <Card>
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold">Fullfør konto</CardTitle>
                        <CardDescription>
                            Velg et nytt passord for å fullføre kontoen din.
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            {error && (
                                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    {error}
                                </div>
                            )}
                            <div className="space-y-2">
                                <label htmlFor="password" className="text-sm font-medium leading-none">
                                    Passord
                                </label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="confirm" className="text-sm font-medium leading-none">
                                    Bekreft passord
                                </label>
                                <Input
                                    id="confirm"
                                    type="password"
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                    required
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" className="w-full" disabled={loading || !ready}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Sett passord
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </Container>
        </div>
    )
}
