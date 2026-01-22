'use client'

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Container } from "@/components/ui/container"
import { AlertCircle, Loader2 } from "lucide-react"

export function CompleteAccountForm() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const supabase = createClient()

    const initialEmail = useMemo(() => searchParams.get("email") ?? "", [searchParams])
    const [email, setEmail] = useState(initialEmail)
    const [code, setCode] = useState("")
    const [password, setPassword] = useState("")
    const [confirm, setConfirm] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [ready, setReady] = useState(true)
    const [showOtpFields, setShowOtpFields] = useState(true)

    useEffect(() => {
        const init = async () => {
            setError(null)

            const codeParam = searchParams.get("code")
            if (codeParam) {
                const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(codeParam)
                if (exchangeError) {
                    setError("Lenken er ugyldig eller utløpt. Be om ny invitasjon.")
                }
                setShowOtpFields(false)
                setReady(true)
                return
            }

            const tokenParam = searchParams.get("token")
            const typeParam = searchParams.get("type")
            const emailParam = searchParams.get("email")

            if (tokenParam && typeParam) {
                if (typeParam === "magiclink" && emailParam) {
                    const { error: verifyError } = await supabase.auth.verifyOtp({
                        token: tokenParam,
                        type: "magiclink",
                        email: emailParam,
                    })
                    if (verifyError) {
                        setError("Lenken er ugyldig eller utløpt. Be om ny invitasjon.")
                    }
                    setShowOtpFields(false)
                    setReady(true)
                    return
                }

                if (typeParam === "email" && emailParam) {
                    const { error: verifyError } = await supabase.auth.verifyOtp({
                        token: tokenParam,
                        type: "email",
                        email: emailParam,
                    })
                    if (verifyError) {
                        setError("Lenken er ugyldig eller utløpt. Be om ny invitasjon.")
                    }
                    setShowOtpFields(false)
                    setReady(true)
                    return
                }

                const { error: verifyHashError } = await supabase.auth.verifyOtp({
                    token_hash: tokenParam,
                    type: typeParam === "recovery" ? "recovery" : "magiclink",
                })
                if (verifyHashError) {
                    setError("Lenken er ugyldig eller utløpt. Be om ny invitasjon.")
                }
                setShowOtpFields(false)
                setReady(true)
                return
            }

            if (typeof window !== "undefined") {
                const hash = window.location.hash.replace(/^#/, "")
                const params = new URLSearchParams(hash)
                const accessToken = params.get("access_token")
                const refreshToken = params.get("refresh_token")

                if (accessToken && refreshToken) {
                    const { error: setErrorSession } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken,
                    })
                    if (setErrorSession) {
                        setError("Lenken er ugyldig eller utløpt. Be om ny invitasjon.")
                    }
                    setShowOtpFields(false)
                    setReady(true)
                    return
                }
            }

            setReady(true)
        }

        init()
    }, [searchParams, supabase])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (showOtpFields) {
            if (!email.trim()) {
                setError("E-post mangler")
                setLoading(false)
                return
            }

            if (!code.trim()) {
                setError("Engangskode mangler")
                setLoading(false)
                return
            }
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
            if (showOtpFields) {
                const { error: verifyError } = await supabase.auth.verifyOtp({
                    email: email.trim(),
                    token: code.trim(),
                    type: "email",
                })

                if (verifyError) {
                    setError(verifyError.message)
                    return
                }
            } else {
                const { data } = await supabase.auth.getSession()
                if (!data.session) {
                    setError("Lenken er ugyldig eller utløpt. Be om ny invitasjon.")
                    return
                }
            }

            const { error: updateError } = await supabase.auth.updateUser({ password })
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
                            {showOtpFields
                                ? "Skriv inn engangskoden fra e-post og velg et passord."
                                : "Velg et passord for å fullføre kontoen din."}
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
                            {showOtpFields && (
                                <>
                                    <div className="space-y-2">
                                        <label htmlFor="email" className="text-sm font-medium leading-none">
                                            E-post
                                        </label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="code" className="text-sm font-medium leading-none">
                                            Engangskode
                                        </label>
                                        <Input
                                            id="code"
                                            inputMode="numeric"
                                            placeholder="123456"
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            required
                                        />
                                    </div>
                                </>
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
