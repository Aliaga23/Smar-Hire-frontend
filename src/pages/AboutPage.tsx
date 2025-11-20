import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Link } from "react-router-dom"
import { Sparkles, Target, Lightbulb, Heart, ArrowRight, Bot, Users2, Zap } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5 -z-10"></div>
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] -z-10"></div>
        
        <div className="container mx-auto max-w-5xl text-center space-y-8">
          <Badge variant="outline" className="text-sm font-semibold px-4 py-1">SOBRE NOSOTROS</Badge>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Transformando el{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              futuro del reclutamiento
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Conectamos talento excepcional con oportunidades únicas usando el poder de la inteligencia artificial
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Nuestra Misión</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                  Haciendo el match perfecto
                </h2>
              </div>
              <div className="space-y-4">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  En SmartHire, creemos que encontrar el trabajo ideal o el candidato perfecto no debería ser complicado. 
                  Utilizamos <span className="font-semibold text-foreground">inteligencia artificial</span> y algoritmos de <span className="font-semibold text-foreground">machine learning</span> para 
                  hacer coincidir candidatos con vacantes de manera precisa y eficiente.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Nuestra plataforma no solo conecta personas con empleos, sino que ayuda a los candidatos a <span className="font-semibold text-foreground">desarrollar 
                  sus habilidades</span> mediante recomendaciones personalizadas de cursos.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8 space-y-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Bot className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-2xl mb-1">IA Avanzada</h3>
                    <p className="text-sm text-muted-foreground">Matching inteligente con GPT-4</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8 space-y-4">
                  <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <div>
                    <h3 className="font-bold text-2xl mb-1">Rápido</h3>
                    <p className="text-sm text-muted-foreground">Resultados en segundos</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8 space-y-4">
                  <div className="h-12 w-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <Users2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-2xl mb-1">Preciso</h3>
                    <p className="text-sm text-muted-foreground">Matches personalizados</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8 space-y-4">
                  <div className="h-12 w-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-2xl mb-1">Innovador</h3>
                    <p className="text-sm text-muted-foreground">Tecnología de punta</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl space-y-16">
          <div className="text-center space-y-4">
            <Badge variant="outline" className="text-sm font-semibold px-4 py-1">NUESTROS VALORES</Badge>
            <h2 className="text-4xl md:text-5xl font-bold">Principios que nos guían</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Los valores fundamentales que impulsan cada decisión y acción en SmartHire
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="group hover:shadow-2xl hover:border-primary/50 transition-all duration-300">
              <CardContent className="p-10 space-y-6">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Lightbulb className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold">Innovación</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Utilizamos las últimas tecnologías de IA y machine learning para transformar 
                    el proceso de reclutamiento y hacerlo más eficiente.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl hover:border-primary/50 transition-all duration-300">
              <CardContent className="p-10 space-y-6">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Target className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold">Transparencia</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Creemos en procesos claros y honestos tanto para candidatos como para empresas, 
                    construyendo confianza en cada interacción.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl hover:border-primary/50 transition-all duration-300">
              <CardContent className="p-10 space-y-6">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-pink-500/20 to-pink-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Heart className="h-8 w-8 text-pink-600 dark:text-pink-400" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold">Compromiso</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Nos dedicamos a ayudar a las personas a encontrar oportunidades que 
                    transformen sus vidas y carreras profesionales.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <Card className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground border-0 shadow-2xl">
            <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
            <CardContent className="relative p-12 md:p-16 text-center space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold">¿Listo para comenzar?</h2>
                <p className="text-xl md:text-2xl opacity-95 max-w-2xl mx-auto leading-relaxed">
                  Únete a SmartHire y descubre una mejor forma de conectar talento con oportunidades
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button size="lg" variant="secondary" className="h-14 px-8 text-base font-semibold shadow-xl hover:shadow-2xl transition-shadow" asChild>
                  <Link to="/signup">
                    Buscar Empleo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 text-base font-semibold bg-transparent border-2 border-primary-foreground/30 hover:bg-primary-foreground/10 text-primary-foreground" asChild>
                  <Link to="/register-empresa">Registrar Empresa</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4 mt-auto">
        <div className="container mx-auto max-w-6xl text-center text-sm text-muted-foreground">
          <p>© 2025 SmartHire. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
