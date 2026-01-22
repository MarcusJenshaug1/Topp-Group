import Image from "next/image"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { Container } from "@/components/ui/container"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createUserSilently, sendInviteEmail, updateUserRole, updateUserName, deleteUser, uploadUserAvatar } from "@/app/admin/users-actions"

export default async function AdminUsersPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/portal/login")
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

    if (!profile || profile.role !== "admin") {
        redirect("/admin")
    }

    const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email, role, created_at, full_name, avatar_url")
        .order("created_at", { ascending: false })

    let users = [] as Array<{
        id: string
        email: string | null
        full_name: string | null
        avatar_url: string | null
        role: string | null
        created_at: string
        last_sign_in_at?: string | null
        invited_at?: string | null
    }>

    let adminError: string | null = null

    try {
        const admin = createAdminClient()
        const { data } = await admin.auth.admin.listUsers({ perPage: 200 })
        const usersMap = new Map(data?.users?.map((u) => [u.id, u]) || [])

        users = (profiles || []).map((profile) => {
            const authUser = usersMap.get(profile.id)
            const profileName = (profile as any).full_name || (profile as any).name || (profile as any).display_name || null
            const metadataName = authUser?.user_metadata?.full_name || authUser?.user_metadata?.name || null
            return {
                id: profile.id,
                email: (profile as any).email || authUser?.email || null,
                full_name: profileName || metadataName || null,
                avatar_url: profile.avatar_url || null,
                role: profile.role || "viewer",
                created_at: profile.created_at,
                last_sign_in_at: authUser?.last_sign_in_at || null,
                invited_at: authUser?.invited_at || null,
            }
        })
    } catch (error) {
        adminError = error instanceof Error ? error.message : "Kunne ikke laste brukere"
        users = profiles || []
    }

    const getAvatarUrl = (path: string | null) => {
        if (!path) return null
        if (path.startsWith("http")) return path
        return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/toppgroup/${path}`
    }

    return (
        <Container className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold">Brukere</h1>
                <p className="text-muted-foreground">Administrer brukere, roller og profilbilder.</p>
            </div>

            {adminError && (
                <div className="rounded-lg border border-border bg-surface-muted p-4 text-sm text-muted-foreground">
                    {adminError}
                </div>
            )}

            <Card className="bg-surface">
                <CardHeader>
                    <CardTitle className="text-base">Legg til bruker</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={sendInviteEmail} className="grid gap-4 lg:grid-cols-[2fr,2fr,1fr,auto]">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">E-post</label>
                            <Input name="email" type="email" placeholder="E-post" required />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">Navn</label>
                            <Input name="full_name" type="text" placeholder="Navn" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">Rolle</label>
                            <select
                                name="role"
                                className="h-11 rounded-lg border border-input bg-background px-3 text-sm"
                                defaultValue="viewer"
                            >
                                <option value="viewer">Viewer</option>
                                <option value="editor">Editor</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <Button type="submit" className="whitespace-nowrap">Send invitasjon</Button>
                        </div>
                    </form>
                    <p className="mt-3 text-xs text-muted-foreground">
                        Inviterte brukere verifiserer e-post og fullfører konto med engangskode.
                    </p>
                </CardContent>
            </Card>

            <div className="space-y-4">
                {users.length === 0 ? (
                    <div className="rounded-lg border border-border bg-surface-muted p-6 text-sm text-muted-foreground">
                        Ingen brukere funnet.
                    </div>
                ) : (
                    users.map((user) => (
                        <Card key={user.id} className="bg-surface">
                            <CardContent className="p-6 space-y-6">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        {getAvatarUrl(user.avatar_url) ? (
                                            <div className="h-12 w-12 rounded-full overflow-hidden border bg-surface-muted">
                                                <Image
                                                    src={getAvatarUrl(user.avatar_url) || ""}
                                                    alt={user.full_name || user.email || "Profil"}
                                                    width={48}
                                                    height={48}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-12 w-12 rounded-full bg-surface-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
                                                {user.email?.slice(0, 2).toUpperCase() || "??"}
                                            </div>
                                        )}
                                        <div>
                                            <div className="font-medium text-foreground">
                                                {user.full_name || "Ukjent navn"}
                                            </div>
                                            <div className="text-sm text-muted-foreground">{user.email || "-"}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {!user.last_sign_in_at && user.email && (
                                            <form action={sendInviteEmail}>
                                                <input type="hidden" name="email" value={user.email} />
                                                <input type="hidden" name="full_name" value={user.full_name || ""} />
                                                <input type="hidden" name="role" value={user.role || "viewer"} />
                                                <Button variant="secondary" size="sm">
                                                    {user.invited_at ? "Send invitasjon på nytt" : "Send invitasjon"}
                                                </Button>
                                            </form>
                                        )}
                                        <Badge variant="secondary" className="uppercase text-[10px] tracking-wide">{user.role}</Badge>
                                        <form action={deleteUser}>
                                            <input type="hidden" name="user_id" value={user.id} />
                                            <Button variant="destructive" size="sm">Fjern</Button>
                                        </form>
                                    </div>
                                </div>

                                <div className="grid gap-4 lg:grid-cols-3">
                                    <form action={updateUserName} className="rounded-lg border border-border/60 bg-surface-muted/40 p-4 flex flex-col gap-2">
                                        <input type="hidden" name="user_id" value={user.id} />
                                        <label className="text-xs font-medium text-muted-foreground">Navn</label>
                                        <div className="flex gap-2">
                                            <Input
                                                name="full_name"
                                                type="text"
                                                defaultValue={user.full_name || ""}
                                                placeholder="Oppdater navn"
                                            />
                                            <Button type="submit" variant="outline" size="sm">Lagre</Button>
                                        </div>
                                    </form>

                                    <form action={updateUserRole} className="rounded-lg border border-border/60 bg-surface-muted/40 p-4 flex flex-col gap-2">
                                        <input type="hidden" name="user_id" value={user.id} />
                                        <label className="text-xs font-medium text-muted-foreground">Rolle</label>
                                        <div className="flex gap-2">
                                            <select
                                                name="role"
                                                className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
                                                defaultValue={user.role || "viewer"}
                                            >
                                                <option value="viewer">Viewer</option>
                                                <option value="editor">Editor</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                            <Button type="submit" variant="outline" size="sm">Oppdater</Button>
                                        </div>
                                    </form>

                                    <form
                                        action={uploadUserAvatar}
                                        className="rounded-lg border border-border/60 bg-surface-muted/40 p-4 flex flex-col gap-3"
                                    >
                                        <input type="hidden" name="user_id" value={user.id} />
                                        <label className="text-xs font-medium text-muted-foreground">Profilbilde</label>
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                            <input
                                                name="avatar"
                                                type="file"
                                                accept="image/*"
                                                className="w-full rounded-md border border-dashed border-border bg-background px-3 py-2 text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-surface file:px-3 file:py-2 file:text-sm file:font-medium file:text-foreground hover:border-primary/40"
                                            />
                                            <Button type="submit" variant="outline" size="sm" className="sm:ml-auto">Last opp</Button>
                                        </div>
                                    </form>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </Container>
    )
}
