'use client'

import * as React from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { usePathname } from "next/navigation"
import { User } from "@supabase/supabase-js"

import { Container } from "@/components/ui/container"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/layout/logo"
import { cn } from "@/lib/utils"
import { ProfileMenu } from "@/components/auth/profile-menu"

interface HeaderClientProps {
    user: User | null
    role: string | null
    avatarUrl: string | null
    fullName: string | null
}

const navigation = [
    { name: "Investeringer", href: "/investeringer" },
    { name: "Eiendom", href: "/eiendom" },
    { name: "Om oss", href: "/om" },
]

export function HeaderClient({ user, role, avatarUrl, fullName }: HeaderClientProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    const [isScrolled, setIsScrolled] = React.useState(false)
    const pathname = usePathname()

    // Close mobile menu on route change
    React.useEffect(() => {
        setIsOpen(false)
    }, [pathname])

    React.useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 8)
        handleScroll()
        window.addEventListener("scroll", handleScroll, { passive: true })
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <header
            className={cn(
                "motion-header sticky top-0 z-50 w-full border-b border-border/60 bg-surface/85 backdrop-blur supports-backdrop-filter:bg-surface/75",
                isScrolled ? "shadow-sm" : "shadow-none"
            )}
        >
            <Container>
                <div className="relative flex h-16 items-center">
                    <div className="flex flex-1 items-center">
                        <Logo className="text-foreground" />
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8">
                        {navigation.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "text-sm font-medium py-1 link-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                    pathname === item.href
                                        ? "text-foreground is-active"
                                        : "text-muted-foreground hover:text-hover-dark"
                                )}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Actions */}
                    <div className="ml-auto flex items-center gap-3">
                        {user ? (
                            <ProfileMenu user={user} role={role} avatarUrl={avatarUrl} fullName={fullName} />
                        ) : (
                            <Link href="/portal/login" className="hidden md:inline-flex">
                                <Button size="sm" className="btn-arrow h-9 rounded-full px-5">
                                    Logg inn
                                </Button>
                            </Link>
                        )}

                        <button
                            className="md:hidden p-2 -mr-2 text-muted-foreground hover:text-foreground"
                            onClick={() => setIsOpen(!isOpen)}
                            aria-label="Toggle menu"
                            aria-expanded={isOpen}
                        >
                            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            </Container>

            {/* Mobile Navigation */}
            {isOpen && (
                <div className="md:hidden border-t border-border/60 bg-surface/95 backdrop-blur motion-dropdown">
                    <Container className="py-4 space-y-3">
                        {navigation.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "block text-sm font-medium py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                    pathname === item.href
                                        ? "text-foreground"
                                        : "text-muted-foreground hover:text-hover-dark"
                                )}
                            >
                                {item.name}
                            </Link>
                        ))}
                        {!user && (
                            <Link href="/portal/login" className="block pt-2">
                                <Button className="w-full h-10 rounded-full">Logg inn</Button>
                            </Link>
                        )}
                    </Container>
                </div>
            )}
        </header>
    )
}
