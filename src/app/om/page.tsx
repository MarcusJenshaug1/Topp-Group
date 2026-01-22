import { Container } from "@/components/ui/container"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, History, Target, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function AboutPage() {
    return (
        <div className="bg-background min-h-screen">
            {/* Hero Section */}
            <section className="relative py-24 md:py-32 overflow-hidden bg-surface-muted/30 border-b">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />

                <Container className="relative z-10">
                    <div className="max-w-3xl">
                        <Badge variant="outline" className="mb-6 bg-surface/50 backdrop-blur-sm border-primary/20 text-primary px-4 py-1.5">
                            Om Topp Group
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-8 text-foreground leading-tight">
                            Vi bygger verdier for <br />
                            <span className="text-primary">fremtiden</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl">
                            Siden 2004 har vi kombinert langsiktig tankegang med handlekraft.
                            Vår lidenskap er å utvikle eiendom og selskaper som setter spor.
                        </p>
                    </div>
                </Container>
            </section>

            {/* Values Section */}
            <section className="py-24">
                <Container>
                    <div className="grid md:grid-cols-3 gap-12">
                        <div className="space-y-4">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <History className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold">Langsiktighet</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Vi tenker ikke i kvartaler, men i generasjoner. Våre investeringer skal stå seg over tid og skape varige verdier for samfunnet.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Target className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold">Kvalitet</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Vi går aldri på akkord med kvalitet. Enten det er arkitektur, materialvalg eller forretningsdrift, skal det holde høy standard.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Users className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold">Partnerskap</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Vi tror på kraften i gode samarbeid. Vi jobber tett med leietakere, partnere og lokalsamfunn for å finne de beste løsningene.
                            </p>
                        </div>
                    </div>
                </Container>
            </section>

            {/* Image / Story Section */}
            <section className="py-24 bg-surface-dark text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                <Container className="relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="relative aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden bg-white/10">
                            {/* Placeholder for office/team image */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-50" />
                            <div className="absolute inset-0 flex items-center justify-center text-white/50 font-medium">
                                Bilde av hovedkontoret / teamet
                            </div>
                        </div>
                        <div className="space-y-8">
                            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Vår historie</h2>
                            <p className="text-xl text-gray-300 leading-relaxed">
                                Det startet med en enkel visjon: å skape noe eget. Fra det første eiendomskjøpet i 2004 har Topp Group vokst stein for stein.
                            </p>
                            <p className="text-lg text-gray-400 leading-relaxed">
                                I dag forvalter vi en betydelig eiendomsportefølje og har eierinteresser i en rekke spennende selskaper. Til tross for veksten er vi fortsatt tro mot våre røtter – vi er jordnære, arbeidsomme og opptatt av å levere det vi lover.
                            </p>
                            <div className="pt-4">
                                <Link href="/kontakt">
                                    <Button size="lg" className="bg-white text-black hover:bg-gray-100 rounded-full px-8">
                                        Kom i kontakt
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>
        </div>
    )
}
