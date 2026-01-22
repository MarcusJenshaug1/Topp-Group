'use client'

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Container } from "@/components/ui/container"
import { AlertCircle, Loader2 } from "lucide-react"

export function LoginForm() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [stage, setStage] = useState<"email" | "password" | "invite">("email")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [info, setInfo] = useState<string | null>(null)

    const router = useRouter()
    const searchParams = useSearchParams()
    const supabase = createClient()

    useEffect(() => {
        const emailParam = searchParams.get("email")
        const inviteParam = searchParams.get("invite")

        if (emailParam) {
            setEmail(emailParam)
        }

        if (inviteParam === "1") {
            setStage("invite")
            setInfo("E-posten din er verifisert. Klikk Fullfør konto for å få tilsendt en lenke.")
        }
    }, [searchParams])

    const handleEmailCheck = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setInfo(null)

        try {
            const response = await fetch("/api/auth/lookup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            })

            if (!response.ok) {
                throw new Error("Kunne ikke sjekke e-post. Prøv igjen.")
            }

            const data = (await response.json()) as { status?: "not_found" | "invited" | "active" }

            if (data.status === "not_found") {
                setError("Fant ingen bruker med denne e-posten.")
                setStage("email")
                return
            }

            if (data.status === "invited") {
                setStage("invite")
                setInfo("Du er invitert. Vi sender en lenke til e-posten din.")
                return
            }

            setStage("password")
        } catch (err) {
            setError(err instanceof Error ? err.message : "Noe gikk galt. Prøv igjen.")
        } finally {
            setLoading(false)
        }
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                setError(error.message)
            } else {
                router.refresh()
                router.push("/portal")
            }
        } catch {
            setError("Noe gikk galt. Prøv igjen.")
        } finally {
            setLoading(false)
        }
    }

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/portal/complete?email=${encodeURIComponent(email)}`,
                },
            })

            if (error) {
                setError(error.message)
                return
            }

            router.push(`/portal/invite-sent?email=${encodeURIComponent(email)}`)
        } catch {
            setError("Noe gikk galt. Prøv igjen.")
        } finally {
            setLoading(false)
        }
    }

    const handleResetPassword = async () => {
        if (!email) {
            setError("Skriv inn e-post først")
            return
        }

        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/portal/reset?email=${encodeURIComponent(email)}`,
            })

            if (error) {
                setError(error.message)
                return
            }

            setInfo("Vi har sendt en e-post med lenke for å sette nytt passord.")
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
                        <CardTitle className="text-2xl font-bold">
                            {stage === "invite" ? "Fullfør konto" : "Logg inn"}
                        </CardTitle>
                        <CardDescription>
                            {stage === "email" && "Skriv inn e-posten din for å fortsette."}
                            {stage === "password" && "Skriv inn passordet ditt for å få tilgang til portalen."}
                            {stage === "invite" && "Vi sender deg en lenke for å fullføre registreringen."}
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={stage === "password" ? handleLogin : stage === "invite" ? handleInvite : handleEmailCheck}>
                        <CardContent className="space-y-4">
                            {error && (
                                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    {error}
                                </div>
                            )}
                            {info && (
                                <div className="bg-surface-muted text-sm p-3 rounded-md">
                                    {info}
                                </div>
                            )}
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    E-post
                                </label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="navn@bedrift.no"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    readOnly={stage !== "email"}
                                    required
                                />
                            </div>
                            {stage !== "email" && (
                                <div className="flex items-center justify-between text-sm">
                                    <button
                                        type="button"
                                        className="text-primary hover:underline"
                                        onClick={() => {
                                            setStage("email")
                                            setPassword("")
                                            setError(null)
                                            setInfo(null)
                                        }}
                                    >
                                        Bytt e-post
                                    </button>
                                </div>
                            )}

                            {stage === "password" && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            Passord
                                        </label>
                                        <button
                                            type="button"
                                            className="text-sm text-primary hover:underline"
                                            onClick={handleResetPassword}
                                        >
                                            Glemt passord?
                                        </button>
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {stage === "email" && "Fortsett"}
                                {stage === "password" && "Logg inn"}
                                {stage === "invite" && "Fullfør konto"}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </Container>
        </div>
    )
}
