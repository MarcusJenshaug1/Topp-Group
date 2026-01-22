import Link from "next/link"
import { ArrowRight, Building2, TrendingUp, History, Key, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Container } from "@/components/ui/container"
import { Badge } from "@/components/ui/badge"
import { BusinessAreaCard } from "@/components/domain/business-area-card"
import { Reveal } from "@/components/motion/reveal"

export default function Home() {
  return (
    <div className="flex flex-col gap-0 pb-16">
      {/* Hero Section */}
      <section className="relative flex flex-col justify-center items-center text-center pt-32 pb-40 md:pt-48 md:pb-52 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-100 via-background to-background opacity-70"></div>
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>

        <Container className="relative z-10 flex flex-col items-center gap-8 max-w-4xl">
          <Reveal variant="fadeUp">
            <Badge variant="secondary" className="px-4 py-1.5 text-sm font-medium bg-surface-muted hover:bg-surface-muted cursor-default border-border/50">
              Etablert 2004
            </Badge>
          </Reveal>

          <Reveal variant="fadeUp" delay={80}>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-primary">
              Topp Group
            </h1>
          </Reveal>

          <Reveal variant="fadeUp" delay={160}>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl leading-relaxed">
              Langsiktig verdiskapning gjennom strategiske investeringer og eiendomsutvikling.
            </p>
          </Reveal>

          <Reveal variant="fadeUp" delay={240}>
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Link href="/eiendom">
                <Button size="lg" className="btn-arrow rounded-full px-8 h-12 text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                  Se eiendomsprosjekter
                  <ArrowRight className="btn-arrow-icon ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/portal/login">
                <Button variant="outline" size="lg" className="rounded-full px-8 h-12 text-base bg-surface hover:bg-surface-muted shadow-sm">
                  <Key className="mr-2 h-4 w-4" />
                  Dokumentportal
                </Button>
              </Link>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Business Areas */}
      <section className="py-24 bg-surface-muted/30 border-y border-border/40">
        <Container>
          <div className="flex flex-col gap-12">
            <Reveal variant="fadeUp">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4 max-w-2xl">
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-primary">Forretningsområder</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Vi opererer innenfor to hovedsegmenter med fokus på kvalitet og varig verdi.
                  </p>
                </div>
              </div>
            </Reveal>

            <div className="grid md:grid-cols-2 gap-8">
              <Reveal variant="fadeUp" index={0} stagger={60}>
                <BusinessAreaCard
                  title="Eiendom"
                  description="Utvikling av bolig, næring og fritidseiendom med høy arkitektonisk kvalitet."
                  href="/eiendom"
                  icon={Building2}
                  tags={["Bolig", "Næring", "Hotell"]}
                  pattern="building"
                />
              </Reveal>

              <Reveal variant="fadeUp" index={1} stagger={60}>
                <BusinessAreaCard
                  title="Investeringer"
                  description="Strategiske posisjoner i vekstselskaper og markeder med solid potensial."
                  href="/investeringer"
                  icon={TrendingUp}
                  tags={["Kapital", "Kompetanse", "Nettverk"]}
                  pattern="chart"
                />
              </Reveal>
            </div>
          </div>
        </Container>
      </section>

      {/* History / Stats */}
      <section className="py-24 md:py-32">
        <Container>
          <div className="bg-surface-dark rounded-3xl p-8 md:p-16 lg:p-20 text-white shadow-2xl overflow-hidden relative">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

            <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
              <Reveal variant="fadeUp">
                <div className="space-y-8">
                  <div className="flex items-center gap-3 text-gray-300">
                    <div className="p-2 rounded-lg bg-white/10">
                      <History className="h-5 w-5" />
                    </div>
                    <span className="font-semibold tracking-wide uppercase text-sm">Vår historie</span>
                  </div>

                  <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                    20 år med <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">verdiskapning</span>
                  </h2>

                  <p className="text-lg text-gray-400 leading-relaxed max-w-md">
                    Topp Group ble etablert i 2004 og har siden den gang gjennomført over 50 eiendomsprosjekter
                    og bygget en solid portefølje av investeringer. Vi bygger stein på stein med fokus på kvalitet.
                  </p>

                  <div className="pt-4">
                    <Link href="/om">
                      <Button variant="outline" className="border-white/20 text-white bg-white/5 hover:bg-white/10 hover:text-white hover:border-white/30 rounded-full px-8">
                        Les mer om oss
                      </Button>
                    </Link>
                  </div>
                </div>
              </Reveal>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <Reveal variant="fadeUp" index={0} stagger={60}>
                  <Card className="motion-card bg-white/5 border-white/10 shadow-none backdrop-blur-sm hover:-translate-y-0.5 hover:shadow-lg">
                    <CardContent className="p-8 text-center flex flex-col items-center justify-center h-full">
                      <p className="text-5xl font-bold text-white mb-2 tracking-tight">20+</p>
                      <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Års erfaring</p>
                    </CardContent>
                  </Card>
                </Reveal>
                <Reveal variant="fadeUp" index={1} stagger={60}>
                  <Card className="motion-card bg-white/5 border-white/10 shadow-none backdrop-blur-sm hover:-translate-y-0.5 hover:shadow-lg">
                    <CardContent className="p-8 text-center flex flex-col items-center justify-center h-full">
                      <p className="text-5xl font-bold text-white mb-2 tracking-tight">50+</p>
                      <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Prosjekter</p>
                    </CardContent>
                  </Card>
                </Reveal>
                <Reveal variant="fadeUp" index={2} stagger={60}>
                  <Card className="motion-card bg-white/5 border-white/10 shadow-none backdrop-blur-sm hover:-translate-y-0.5 hover:shadow-lg">
                    <CardContent className="p-8 text-center flex flex-col items-center justify-center h-full">
                      <p className="text-5xl font-bold text-white mb-2 tracking-tight">100k</p>
                      <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Kvm utviklet</p>
                    </CardContent>
                  </Card>
                </Reveal>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  )
}
