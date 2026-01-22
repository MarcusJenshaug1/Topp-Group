
import { createClient } from "@/lib/supabase/server"
import { HeaderClient } from "./header-client"

export async function Header() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    let role = null
    let avatarUrl: string | null = null
    let fullName: string | null = null

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role, avatar_url, full_name')
            .eq('id', user.id)
            .single()
        
        role = profile?.role ?? 'viewer'
        avatarUrl = profile?.avatar_url ?? null
        fullName = profile?.full_name ?? null
    }

    return <HeaderClient user={user} role={role} avatarUrl={avatarUrl} fullName={fullName} />
}
