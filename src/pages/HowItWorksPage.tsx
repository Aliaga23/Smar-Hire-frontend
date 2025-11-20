import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserPlus, FileText, Brain, Target, CheckCircle2, ArrowRight } from "lucide-react"

export default function HowItWorksPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto max-w-4xl text-center space-y-6">
          <Badge variant="outline" className="text-sm font-semibold px-4 py-1">CÓMO FUNCIONA</Badge>
          <h1 className="text-5xl md:text-6xl font-bold">Simple, Rápido y Efectivo</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Descubre cómo SmartHire utiliza inteligencia artificial para conectar talento con oportunidades
          </p>
        </div>
      </section>

      {/* For Candidates */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">Para Candidatos</h2>
            <p className="text-lg text-muted-foreground">
              4 pasos sencillos para encontrar tu próximo empleo
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="relative">
              <CardContent className="p-8 space-y-4">
                <div className="absolute -top-4 left-8">
                  <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
                    1
                  </div>
                </div>
                <UserPlus className="h-12 w-12 text-primary mt-6" />
                <h3 className="text-xl font-bold">Crea tu Perfil</h3>
                <p className="text-muted-foreground">
                  Regístrate y completa tu perfil profesional con tus habilidades, experiencia y educación.
                </p>
              </CardContent>
            </Card>

            <Card className="relative">
              <CardContent className="p-8 space-y-4">
                <div className="absolute -top-4 left-8">
                  <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
                    2
                  </div>
                </div>
                <FileText className="h-12 w-12 text-primary mt-6" />
                <h3 className="text-xl font-bold">Escanea tu CV</h3>
                <p className="text-muted-foreground">
                  Sube tu CV y nuestra IA lo analizará automáticamente para completar tu perfil.
                </p>
              </CardContent>
            </Card>

            <Card className="relative">
              <CardContent className="p-8 space-y-4">
                <div className="absolute -top-4 left-8">
                  <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
                    3
                  </div>
                </div>
                <Brain className="h-12 w-12 text-primary mt-6" />
                <h3 className="text-xl font-bold">Matching Inteligente</h3>
                <p className="text-muted-foreground">
                  Nuestro algoritmo K-Means calcula tu compatibilidad con vacantes disponibles.
                </p>
              </CardContent>
            </Card>

            <Card className="relative">
              <CardContent className="p-8 space-y-4">
                <div className="absolute -top-4 left-8">
                  <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
                    4
                  </div>
                </div>
                <Target className="h-12 w-12 text-primary mt-6" />
                <h3 className="text-xl font-bold">Postúlate y Mejora</h3>
                <p className="text-muted-foreground">
                  Aplica a empleos y recibe recomendaciones de cursos para mejorar tus habilidades.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* For Companies */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">Para Empresas</h2>
            <p className="text-lg text-muted-foreground">
              Encuentra el talento perfecto para tu organización
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-8 space-y-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-xl font-bold">Publica Vacantes</h3>
                <p className="text-muted-foreground">
                  Define requisitos detallados: habilidades, idiomas, experiencia y salario.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Modalidad de trabajo
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Horario flexible
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Habilidades requeridas
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8 space-y-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="text-xl font-bold">Matching Automático</h3>
                <p className="text-muted-foreground">
                  El sistema calcula automáticamente la compatibilidad de cada candidato.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Score de compatibilidad
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Ranking automático
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Gaps de habilidades
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8 space-y-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-xl font-bold">Selecciona y Contrata</h3>
                <p className="text-muted-foreground">
                  Revisa perfiles completos y contacta a los mejores candidatos.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Perfiles detallados
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Historial laboral
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Contacto directo
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-12 space-y-8">
              <div className="text-center space-y-4">
                <Badge variant="outline" className="text-sm font-semibold px-4 py-1">TECNOLOGÍA</Badge>
                <h2 className="text-4xl font-bold">Powered by AI</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Utilizamos las tecnologías más avanzadas para ofrecerte los mejores resultados
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-primary">K-Means</div>
                  <p className="text-sm text-muted-foreground">Algoritmo de clustering para matching preciso</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-primary">GPT-4</div>
                  <p className="text-sm text-muted-foreground">IA para recomendaciones personalizadas</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-primary">OCR</div>
                  <p className="text-sm text-muted-foreground">Escaneo automático de CVs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center space-y-8">
          <h2 className="text-4xl font-bold">Comienza Ahora</h2>
          <p className="text-xl text-muted-foreground">
            Únete a SmartHire y experimenta el futuro del reclutamiento
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/signup">
                Buscar Empleo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/register-empresa">Registrar Empresa</Link>
            </Button>
          </div>
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
