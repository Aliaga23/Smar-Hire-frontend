import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import { registerCandidato } from "@/services/auth"
import { toast } from "sonner"

export default function SignupPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    lastname: '',
    correo: '',
    password: '',
    confirmPassword: '',
    telefono: '',
    titulo: '',
    bio: '',
    ubicacion: ''
  })
  const [acceptTerms, setAcceptTerms] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!acceptTerms) {
      toast.error('Debes aceptar los términos de servicio')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    if (formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setIsLoading(true)
    
    try {
      const { confirmPassword, ...dataToSend } = formData
      const result = await registerCandidato(dataToSend)
      
      // Guardar token y datos del usuario
      localStorage.setItem('token', result.token)
      localStorage.setItem('user', JSON.stringify(result.usuario))
      localStorage.setItem('userType', result.tipoUsuario)
      
      toast.success('¡Cuenta creada exitosamente!')
      navigate('/dashboard-candidato')
    } catch (error: any) {
      console.error('Error al registrar candidato:', error)
      const errorMessage = error.response?.data?.message || 'Error al crear la cuenta'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-6xl grid md:grid-cols-5 gap-12 items-center">
        {/* Left side - Form */}
        <Card className="w-full shadow-2xl order-2 md:order-1 md:col-span-3">
          <CardHeader className="space-y-3 pb-6">
            <div className="flex items-center gap-3">
              <CardTitle className="text-3xl font-bold">Crear cuenta</CardTitle>
              <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20 font-semibold">Gratis</Badge>
            </div>
            <CardDescription className="text-base">
              Únete a +500,000 profesionales que encontraron su empleo ideal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input 
                  id="name" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Juan" 
                  className="h-11" 
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastname">Apellido</Label>
                <Input 
                  id="lastname" 
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleInputChange}
                  placeholder="Pérez" 
                  className="h-11" 
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="correo">Email profesional</Label>
              <Input 
                id="correo" 
                name="correo"
                value={formData.correo}
                onChange={handleInputChange}
                type="email" 
                placeholder="tu@email.com" 
                className="h-11" 
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono (opcional)</Label>
              <Input 
                id="telefono" 
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                type="tel" 
                placeholder="+52-555-1234" 
                className="h-11" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="titulo">Título profesional (opcional)</Label>
              <Input 
                id="titulo" 
                name="titulo"
                value={formData.titulo}
                onChange={handleInputChange}
                placeholder="Desarrollador Full Stack" 
                className="h-11" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input 
                id="password" 
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                type="password" 
                placeholder="Mínimo 6 caracteres" 
                className="h-11" 
                required
              />
              <p className="text-xs text-muted-foreground">Debe contener al menos 6 caracteres</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <Input 
                id="confirmPassword" 
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                type="password" 
                placeholder="••••••••" 
                className="h-11" 
                required
              />
            </div>
            
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="terms" 
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                className="mt-1" 
              />
              <label
                htmlFor="terms"
                className="text-sm leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Acepto los{" "}
                <Link to="/terms" className="text-primary hover:underline font-medium">
                  Términos de servicio
                </Link>{" "}
                y la{" "}
                <Link to="/privacy" className="text-primary hover:underline font-medium">
                  Política de privacidad
                </Link>
              </label>
            </div>
            
            <Button 
              type="submit"
              className="w-full h-11" 
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
            </Button>
            </form>
            
            <Separator className="my-4" />
            
            <div className="text-center text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{" "}
              <Link to="/login" className="text-primary font-semibold hover:underline">
                Inicia sesión
              </Link>
            </div>
          </CardContent>
        </Card>
        
        {/* Right side - Benefits */}
        <div className="space-y-8 order-1 md:order-2 md:col-span-2">
          <div className="space-y-4">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">Comienza en 2 minutos</Badge>
            <h1 className="text-5xl font-bold leading-tight">
              Tu carrera comienza aquí
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Crea tu cuenta gratis y accede a miles de oportunidades laborales
            </p>
          </div>
          
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="pt-6 space-y-5">
              <h3 className="font-semibold text-xl">Todo incluido:</h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-primary/20 mt-0.5">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Acceso ilimitado a empleos</p>
                    <p className="text-sm text-muted-foreground">Explora miles de oportunidades</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-primary/20 mt-0.5">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Perfil profesional</p>
                    <p className="text-sm text-muted-foreground">Destaca tus habilidades y experiencia</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-primary/20 mt-0.5">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Alertas personalizadas</p>
                    <p className="text-sm text-muted-foreground">Recibe notificaciones de empleos relevantes</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-primary/20 mt-0.5">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Aplicación con un clic</p>
                    <p className="text-sm text-muted-foreground">Postula rápidamente a tus empleos favoritos</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-primary/20 mt-0.5">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Soporte 24/7</p>
                    <p className="text-sm text-muted-foreground">Estamos aquí para ayudarte</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>500K+ usuarios activos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span>10K+ empresas confían en nosotros</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
