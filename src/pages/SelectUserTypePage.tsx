import { User, Building2, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function SelectUserTypePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-4xl">
        <div className="text-center space-y-4 mb-12">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
            Únete a SmartHire
          </Badge>
          <h1 className="text-4xl font-bold">
            ¿Cómo quieres registrarte?
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Selecciona el tipo de cuenta que mejor se adapte a tus necesidades y comienza tu experiencia en SmartHire
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Candidato Card */}
          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl group">
            <CardHeader className="space-y-4 pb-6">
              <div className="flex items-center justify-between">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20">
                  Gratis
                </Badge>
              </div>
              <div>
                <CardTitle className="text-2xl mb-2">Candidato</CardTitle>
                <CardDescription className="text-base">
                  Busco oportunidades laborales y quiero destacar mi perfil profesional
                </CardDescription>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span>Acceso a miles de ofertas laborales</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span>Perfil profesional completo</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span>Postulación con un clic</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span>Alertas personalizadas</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span>Comunicación directa con empresas</span>
                </div>
              </div>
              
              <Button asChild className="w-full h-12 group-hover:bg-primary/90 transition-colors">
                <Link to="/signup/candidato" className="flex items-center gap-2">
                  Registrarme como Candidato
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          {/* Empresa Card */}
          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl group">
            <CardHeader className="space-y-4 pb-6">
              <div className="flex items-center justify-between">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20">
                  Gratis
                </Badge>
              </div>
              <div>
                <CardTitle className="text-2xl mb-2">Empresa</CardTitle>
                <CardDescription className="text-base">
                  Busco talento para mi empresa y quiero publicar ofertas laborales
                </CardDescription>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span>Publicación ilimitada de vacantes</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span>Acceso a candidatos calificados</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span>Gestión de postulaciones</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span>Análisis y reportes</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span>Soporte prioritario</span>
                </div>
              </div>
              
              <Button asChild className="w-full h-12 group-hover:bg-primary/90 transition-colors">
                <Link to="/register-empresa" className="flex items-center gap-2">
                  Registrar mi Empresa
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="text-center mt-8">
          <p className="text-muted-foreground">
            ¿Ya tienes una cuenta?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}