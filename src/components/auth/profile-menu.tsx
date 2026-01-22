'use client'

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { User } from "@supabase/supabase-js"
import { LogOut, Shield, FileText, ChevronDown, User as UserIcon } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { useOnClickOutside } from "@/lib/hooks/use-on-click-outside"

interface ProfileMenuProps {
    user: User
    role: string | null
    avatarUrl: string | null
    fullName: string | null
}

export function ProfileMenu({ user, role, avatarUrl, fullName }: ProfileMenuProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    const menuRef = React.useRef<HTMLDivElement>(null)
    const buttonRef = React.useRef<HTMLButtonElement>(null)
    const router = useRouter()
    const supabase = createClient()

    const isAdminOrEditor = role === 'admin' || role === 'editor'
    const preferredName = fullName
        || user.user_metadata?.full_name
        || user.user_metadata?.name
        || user.email?.split('@')[0]
        || "Ukjent bruker"

    const displayName = preferredName.replace(/\b\w/g, (char: string) => char.toUpperCase())

    const initials = (preferredName || user.email || "??")
        .split(/\s|@/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase()

    const resolvedAvatarUrl = React.useMemo(() => {
        if (!avatarUrl) return null
        if (avatarUrl.startsWith("http")) return avatarUrl
        const base = process.env.NEXT_PUBLIC_SUPABASE_URL
        return base ? `${base}/storage/v1/object/public/toppgroup/${avatarUrl}` : avatarUrl
    }, [avatarUrl])

    // Toggle menu
    const toggleMenu = () => setIsOpen(!isOpen)

    useOnClickOutside(menuRef, () => setIsOpen(false), isOpen)

    // Close on Escape
    React.useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsOpen(false)
                buttonRef.current?.focus()
            }
        }

        if (isOpen) {
            document.addEventListener("keydown", handleEscape)
        }
        return () => {
            document.removeEventListener("keydown", handleEscape)
        }
    }, [isOpen])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        setIsOpen(false)
        router.refresh()
        router.push('/')
    }

    return (
        <div className="relative inline-block text-left">
            <button
                ref={buttonRef}
                type="button"
                className={cn(
                    "motion-button flex h-9 items-center gap-2 rounded-full border border-border/60 bg-surface-muted/60 pl-1.5 pr-2.5 text-foreground shadow-none",
                    "hover:bg-hover-dark hover:text-white hover:border-hover-dark focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 group"
                )}
                onClick={toggleMenu}
                aria-haspopup="true"
                aria-expanded={isOpen}
                aria-label="User menu"
            >
                {resolvedAvatarUrl ? (
                    <div className="h-7 w-7 overflow-hidden rounded-full bg-white/70">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={resolvedAvatarUrl}
                            alt={displayName}
                            className="h-full w-full object-cover"
                        />
                    </div>
                ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/70 text-foreground group-hover:bg-white/20 group-hover:text-white">
                        <span className="text-[11px] font-semibold tracking-wide">{initials}</span>
                    </div>
                )}
                <span className="text-sm font-medium hidden lg:block max-w-24 truncate">
                    {displayName}
                </span>
                <ChevronDown className="h-3.5 w-3.5 opacity-50 ml-auto" />
            </button>

            {isOpen && (
                <div
                    ref={menuRef}
                    className={cn(
                        "motion-dropdown absolute right-0 mt-3 w-72 origin-top-right rounded-2xl bg-surface p-2 shadow-xl ring-1 ring-black/5 focus:outline-none z-50"
                    )}
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                    tabIndex={-1}
                >
                    <div className="px-3 py-2 text-sm border-b border-border/60 mb-1">
                        <p className="text-muted-foreground text-xs font-medium">Innlogget som</p>
                        <p className="font-medium truncate text-foreground" title={user.email}>{user.email}</p>
                    </div>

                    <div className="py-1">
                        <Link
                            href="/profil"
                            className="group flex items-center rounded-lg px-3 py-2 text-sm text-foreground hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            role="menuitem"
                            onClick={() => setIsOpen(false)}
                        >
                            <UserIcon className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                            Profil
                        </Link>

                        <Link
                            href="/portal"
                            className="group flex items-center rounded-lg px-3 py-2 text-sm text-foreground hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            role="menuitem"
                            onClick={() => setIsOpen(false)}
                        >
                            <FileText className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                            Dokumentportal
                        </Link>

                        {isAdminOrEditor && (
                            <Link
                                href="/admin"
                                className="group flex items-center justify-between rounded-lg px-3 py-2 text-sm text-foreground hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                role="menuitem"
                                onClick={() => setIsOpen(false)}
                            >
                                <div className="flex items-center">
                                    <Shield className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                                    Adminpanel
                                </div>
                                <span className="inline-flex items-center rounded-full bg-surface-muted px-1.5 py-0.5 text-xs font-medium text-foreground border border-border/60">
                                    Admin
                                </span>
                            </Link>
                        )}
                    </div>

                    <div className="my-1 border-t border-border/60" />

                    <div className="py-1">
                        <button
                            type="button"
                            className="group flex w-full items-center rounded-lg px-3 py-2 text-sm text-foreground hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            role="menuitem"
                            onClick={handleSignOut}
                        >
                            <LogOut className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                            Logg ut
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
