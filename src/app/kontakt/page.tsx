import { Container } from "@/components/ui/container"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Mail, MapPin, Phone, Building } from "lucide-react"

export default function ContactPage() {
    return (
        <div className="bg-background min-h-screen">
            <section className="py-24 md:py-32">
                <Container>
                    <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
                        <div className="space-y-10">
                            <div>
                                <Badge variant="secondary" className="mb-6 px-4 py-1.5">Kontakt oss</Badge>
                                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                                    Vi hører gjerne <br />fra deg
                                </h1>
                                <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                                    Har du spørsmål om våre prosjekter, eller ønsker du å diskutere en investeringsmulighet? Ta kontakt for en hyggelig prat.
                                </p>
                            </div>

                            <div className="space-y-8">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-lg bg-surface border shadow-sm shrink-0">
                                        <MapPin className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg mb-1">Besøksadresse</h3>
                                        <p className="text-muted-foreground">
                                            Stortingsgata 12 <br />
                                            0161 Oslo
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-lg bg-surface border shadow-sm shrink-0">
                                        <Mail className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg mb-1">E-post</h3>
                                        <a href="mailto:post@toppgroup.no" className="text-muted-foreground hover:text-primary transition-colors">
                                            post@toppgroup.no
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-lg bg-surface border shadow-sm shrink-0">
                                        <Phone className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg mb-1">Telefon</h3>
                                        <a href="tel:+4722334455" className="text-muted-foreground hover:text-primary transition-colors">
                                            +47 22 33 44 55
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-surface p-8 md:p-10 rounded-3xl border border-border/50 shadow-xl shadow-black/5">
                            <h3 className="text-2xl font-bold mb-6">Send oss en melding</h3>
                            <form className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="name" className="text-sm font-medium">Navn</label>
                                        <Input id="name" placeholder="Ditt navn" className="bg-background" />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="email" className="text-sm font-medium">E-post</label>
                                        <Input id="email" type="email" placeholder="Din e-post" className="bg-background" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="subject" className="text-sm font-medium">Emne</label>
                                    <Input id="subject" placeholder="Hva gjelder det?" className="bg-background" />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="message" className="text-sm font-medium">Melding</label>
                                    <textarea
                                        id="message"
                                        rows={5}
                                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Skriv din melding her..."
                                    />
                                </div>
                                <Button size="lg" className="w-full rounded-lg">Send melding</Button>
                            </form>
                        </div>
                    </div>
                </Container>
            </section>
        </div>
    )
}
