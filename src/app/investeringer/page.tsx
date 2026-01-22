import { Container } from "@/components/ui/container"
import { TrendingUp, Scale, BarChart3, Globe } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Reveal } from "@/components/motion/reveal"

export default function InvestmentsPage() {
    return (
        <div className="py-24 md:py-32 bg-background min-h-screen">
            <Container>
                <Reveal variant="fadeUp">
                    <div className="max-w-3xl mb-20">
                        <div className="flex items-center gap-2 text-primary mb-6">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                            <span className="font-semibold tracking-wide uppercase text-sm">Investeringer</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-8 text-foreground">
                            Strategiske investeringer med fokus på langsiktig verdiskapning
                        </h1>
                        <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                            Topp Group investerer i selskaper og markeder med solid vekstpotensial.
                            Vi er en aktiv eier som bidrar med kapital, kompetanse og nettverk
                            for å realisere verdier over tid.
                        </p>
                    </div>
                </Reveal>

                <div className="grid md:grid-cols-3 gap-8">
                    <Reveal variant="fadeUp" index={0} stagger={60}>
                        <Card className="motion-card bg-surface border-border/50 hover:border-primary/20 shadow-sm hover:shadow-md hover:-translate-y-0.5">
                        <CardHeader className="pt-8 px-8">
                            <div className="h-14 w-14 rounded-xl bg-primary/5 flex items-center justify-center text-primary mb-4">
                                <Scale className="h-7 w-7" />
                            </div>
                            <CardTitle className="text-xl font-bold">Aktivt Eierskap</CardTitle>
                        </CardHeader>
                        <CardContent className="px-8 pb-8">
                            <p className="text-muted-foreground leading-relaxed">
                                Vi tror på tett oppfølging av våre investeringer. Gjennom styreplasser og
                                strategisk rådgivning jobber vi sammen med ledelsen for å oppnå felles mål.
                            </p>
                        </CardContent>
                        </Card>
                    </Reveal>

                    <Reveal variant="fadeUp" index={1} stagger={60}>
                        <Card className="motion-card bg-surface border-border/50 hover:border-primary/20 shadow-sm hover:shadow-md hover:-translate-y-0.5">
                        <CardHeader className="pt-8 px-8">
                            <div className="h-14 w-14 rounded-xl bg-primary/5 flex items-center justify-center text-primary mb-4">
                                <Globe className="h-7 w-7" />
                            </div>
                            <CardTitle className="text-xl font-bold">Diversifisert Portefølje</CardTitle>
                        </CardHeader>
                        <CardContent className="px-8 pb-8">
                            <p className="text-muted-foreground leading-relaxed">
                                Vår investeringsstrategi sprer risiko på tvers av bransjer og markeder,
                                fra eiendomsteknologi til tradisjonell industri og service.
                            </p>
                        </CardContent>
                        </Card>
                    </Reveal>

                    <Reveal variant="fadeUp" index={2} stagger={60}>
                        <Card className="motion-card bg-surface border-border/50 hover:border-primary/20 shadow-sm hover:shadow-md hover:-translate-y-0.5">
                        <CardHeader className="pt-8 px-8">
                            <div className="h-14 w-14 rounded-xl bg-primary/5 flex items-center justify-center text-primary mb-4">
                                <BarChart3 className="h-7 w-7" />
                            </div>
                            <CardTitle className="text-xl font-bold">Kapitalbase</CardTitle>
                        </CardHeader>
                        <CardContent className="px-8 pb-8">
                            <p className="text-muted-foreground leading-relaxed">
                                Med en solid kapitalbase har vi evnen til å handle raskt når de rette
                                mulighetene byr seg, samtidig som vi har utholdenhet til å stå i langsiktige løp.
                            </p>
                        </CardContent>
                        </Card>
                    </Reveal>
                </div>
            </Container>
        </div>
    )

}
