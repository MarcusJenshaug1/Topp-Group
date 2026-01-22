import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Protect Portal and Admin routes
    if (
        request.nextUrl.pathname.startsWith('/portal') ||
        request.nextUrl.pathname.startsWith('/admin') ||
        request.nextUrl.pathname.startsWith('/profil')
    ) {
        // Allow login page
        if (
            request.nextUrl.pathname === '/portal/login' ||
            request.nextUrl.pathname === '/portal/reset' ||
            request.nextUrl.pathname === '/portal/complete'
        ) {
            if (user) {
                // Redirect to portal if already logged in
                const url = request.nextUrl.clone()
                url.pathname = '/portal'
                return NextResponse.redirect(url)
            }
            return supabaseResponse
        }

        if (!user) {
            const url = request.nextUrl.clone()
            url.pathname = '/portal/login'
            return NextResponse.redirect(url)
        }

        const hasPassword = Boolean(user.user_metadata?.has_password)
        const isCompleteRoute = request.nextUrl.pathname.startsWith('/portal/complete')
        const isResetRoute = request.nextUrl.pathname.startsWith('/portal/reset')

        if (!hasPassword && !isCompleteRoute && !isResetRoute) {
            const url = request.nextUrl.clone()
            url.pathname = '/portal/complete'
            return NextResponse.redirect(url)
        }
    }

    return supabaseResponse
}

export const config = {
    // Skip API routes so API calls don't get redirected by auth middleware
    matcher: [
        '/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
