import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Send, MapPin, Phone } from "lucide-react"

export default function ContactPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí iría la lógica para enviar el formulario
    alert("Mensaje enviado. Nos pondremos en contacto contigo pronto.")
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto max-w-4xl text-center space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold">Contáctanos</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            ¿Tienes preguntas? Estamos aquí para ayudarte
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-4">Información de Contacto</h2>
                <p className="text-muted-foreground mb-8">
                  Visítanos o comunícate con nosotros por cualquiera de estos medios
                </p>
              </div>

              <Card>
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Dirección</h3>
                    <p className="text-muted-foreground">
                      Calle Vallegrande esquina Senda #923<br />
                      Santa Cruz, Bolivia
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Teléfono</h3>
                    <p className="text-muted-foreground">
                      +591 75372221
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6">Envíanos un Mensaje</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre completo</Label>
                      <Input
                        id="name"
                        placeholder="Juan Pérez"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Correo electrónico</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="juan@ejemplo.com"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Asunto</Label>
                      <Input
                        id="subject"
                        placeholder="¿En qué podemos ayudarte?"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Mensaje</Label>
                      <Textarea
                        id="message"
                        placeholder="Escribe tu mensaje aquí..."
                        rows={6}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full" size="lg">
                      <Send className="mr-2 h-4 w-4" />
                      Enviar Mensaje
                    </Button>
                  </form>
                </CardContent>
              </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold">Preguntas Frecuentes</h2>
            <p className="text-muted-foreground">
              Encuentra respuestas rápidas a las preguntas más comunes
            </p>
          </div>

          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">¿Cuánto tiempo tarda el proceso de registro?</h3>
                <p className="text-muted-foreground text-sm">
                  El registro toma aproximadamente 2-3 minutos. Puedes completar tu perfil después.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">¿Es gratis usar la plataforma?</h3>
                <p className="text-muted-foreground text-sm">
                  Sí, SmartHire es completamente gratuito para candidatos. Las empresas tienen planes especiales.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">¿Cómo funciona el matching de IA?</h3>
                <p className="text-muted-foreground text-sm">
                  Utilizamos algoritmos de machine learning que analizan tus habilidades, experiencia e intereses para conectarte con las vacantes más adecuadas.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">¿Puedo editar mi perfil después de crearlo?</h3>
                <p className="text-muted-foreground text-sm">
                  Sí, puedes actualizar tu perfil en cualquier momento desde tu dashboard.
                </p>
              </CardContent>
            </Card>
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
