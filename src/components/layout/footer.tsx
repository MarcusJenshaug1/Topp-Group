import Link from "next/link"
import { Container } from "@/components/ui/container"
import { Logo } from "@/components/layout/logo"

export function Footer() {
    return (
        <footer className="border-t border-border/60 bg-surface-muted/60">
            <Container className="py-14 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                    <div className="md:col-span-5 space-y-4">
                        <Logo />
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                            Målrettet investering og eiendomsutvikling med fokus på langsiktig verdiskapning og kvalitet.
                        </p>
                    </div>

                    <div className="md:col-span-3 space-y-4">
                        <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-foreground">Lenker</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/investeringer" className="link-underline hover:text-[var(--color-hover-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">Investeringer</Link></li>
                            <li><Link href="/eiendom" className="link-underline hover:text-[var(--color-hover-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">Eiendomsprosjekter</Link></li>
                            <li><Link href="/om" className="link-underline hover:text-[var(--color-hover-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">Om oss</Link></li>
                            <li><Link href="/kontakt" className="link-underline hover:text-[var(--color-hover-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">Kontakt</Link></li>
                        </ul>
                    </div>

                    <div className="md:col-span-4 space-y-4">
                        <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-foreground">Juridisk</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/personvern" className="link-underline hover:text-[var(--color-hover-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">Personvern</Link></li>
                            <li><Link href="/vilkar" className="link-underline hover:text-[var(--color-hover-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">Vilkår</Link></li>
                            <li><Link href="/portal/login" className="link-underline hover:text-[var(--color-hover-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">Ansatt innlogging</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-border/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-muted-foreground">
                    <p>© 2026 Topp Group. Alle rettigheter reservert.</p>
                    <Link href="#top" className="link-underline hover:text-[var(--color-hover-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">Til toppen</Link>
                </div>
            </Container>
        </footer>
    )
}
