import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Container } from "@/components/ui/container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { updateProfileName, uploadProfileAvatar } from "./actions"

export default async function ProfilePage() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/portal/login")
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, role, created_at")
        .eq("id", user.id)
        .single()

    const getAvatarUrl = (path: string | null) => {
        if (!path) return null
        if (path.startsWith("http")) return path
        return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/toppgroup/${path}`
    }

    const avatarUrl = getAvatarUrl(profile?.avatar_url || null)
    const displayName = profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Bruker"

    return (
        <Container className="space-y-8 py-8">
            <div>
                <h1 className="text-2xl font-bold">Profil</h1>
                <p className="text-muted-foreground">Administrer ditt navn og profilbilde.</p>
            </div>

            <Card className="bg-surface">
                <CardHeader className="flex flex-row items-center gap-4">
                    {avatarUrl ? (
                        <div className="h-16 w-16 overflow-hidden rounded-full border bg-surface-muted">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                        </div>
                    ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-muted text-lg font-semibold text-muted-foreground">
                            {(displayName || "BR").slice(0, 2).toUpperCase()}
                        </div>
                    )}
                    <div className="space-y-1">
                        <div className="text-lg font-semibold text-foreground">{displayName}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                        <Badge variant="secondary" className="uppercase text-[10px] tracking-wide">
                            {profile?.role || "viewer"}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="grid gap-6 lg:grid-cols-2">
                    <form action={updateProfileName} className="rounded-lg border border-border/60 bg-surface-muted/40 p-4 space-y-3">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">Navn</label>
                            <Input
                                name="full_name"
                                type="text"
                                defaultValue={profile?.full_name || ""}
                                placeholder="Ditt navn"
                            />
                        </div>
                        <Button type="submit" variant="outline" className="w-full sm:w-auto">
                            Lagre navn
                        </Button>
                    </form>

                    <form
                        action={uploadProfileAvatar}
                        encType="multipart/form-data"
                        className="rounded-lg border border-border/60 bg-surface-muted/40 p-4 space-y-3"
                    >
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">Profilbilde</label>
                            <input
                                name="avatar"
                                type="file"
                                accept="image/*"
                                className="w-full rounded-md border border-dashed border-border bg-background px-3 py-2 text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-surface file:px-3 file:py-2 file:text-sm file:font-medium file:text-foreground hover:border-primary/40"
                            />
                        </div>
                        <Button type="submit" variant="outline" className="w-full sm:w-auto">
                            Oppdater bilde
                        </Button>
                        <p className="text-xs text-muted-foreground">Støtter PNG og JPG. Bildet skaleres automatisk.</p>
                    </form>
                </CardContent>
            </Card>
        </Container>
    )
}
