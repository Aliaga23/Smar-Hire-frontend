import { Check } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { registerEmpresa } from "@/services/auth"
import { toast } from "sonner"

export default function RegisterEmpresaPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    nombreEmpresa: '',
    descripcionEmpresa: '',
    areaEmpresa: '',
    name: '',
    lastname: '',
    correo: '',
    telefono: '',
    password: '',
    confirmPassword: '',
    posicion: ''
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
      const result = await registerEmpresa(dataToSend)
      
      // Guardar token y datos del usuario
      localStorage.setItem('token', result.token)
      localStorage.setItem('user', JSON.stringify(result.usuario))
      localStorage.setItem('userType', result.tipoUsuario)
      
      toast.success('¡Empresa registrada exitosamente!')
      navigate('/dashboard-empresa')
    } catch (error: any) {
      console.error('Error al registrar empresa:', error)
      const errorMessage = error.response?.data?.message || 'Error al registrar la empresa'
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
              <CardTitle className="text-3xl font-bold">Registra tu empresa</CardTitle>
              <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20 font-semibold">Gratis</Badge>
            </div>
            <CardDescription className="text-base">
              Únete a +10,000 empresas que encontraron su talento ideal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground">Datos de la empresa</h3>
              
              <div className="space-y-2">
                <Label htmlFor="nombreEmpresa">Nombre de la empresa</Label>
                <Input 
                  id="nombreEmpresa" 
                  name="nombreEmpresa"
                  value={formData.nombreEmpresa}
                  onChange={handleInputChange}
                  placeholder="TechCorp Solutions" 
                  className="h-11" 
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="descripcionEmpresa">Descripción (opcional)</Label>
                <Input 
                  id="descripcionEmpresa" 
                  name="descripcionEmpresa"
                  value={formData.descripcionEmpresa}
                  onChange={handleInputChange}
                  placeholder="Empresa líder en desarrollo de software..." 
                  className="h-11" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="areaEmpresa">Sector (opcional)</Label>
                <Input 
                  id="areaEmpresa" 
                  name="areaEmpresa"
                  value={formData.areaEmpresa}
                  onChange={handleInputChange}
                  placeholder="Tecnología" 
                  className="h-11" 
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground">Datos del administrador</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input 
                    id="name" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Carlos" 
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
                    placeholder="López" 
                    className="h-11" 
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="correo">Correo electrónico</Label>
                <Input 
                  id="correo" 
                  name="correo"
                  value={formData.correo}
                  onChange={handleInputChange}
                  type="email" 
                  placeholder="carlos@techcorp.com" 
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
              
              <div className="space-y-2">
                <Label htmlFor="posicion">Cargo (opcional)</Label>
                <Input 
                  id="posicion" 
                  name="posicion"
                  value={formData.posicion}
                  onChange={handleInputChange}
                  placeholder="HR Manager" 
                  className="h-11" 
                />
              </div>
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
              {isLoading ? 'Registrando...' : 'Registrar empresa'}
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
              Encuentra el mejor talento
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Regístrate gratis y accede a miles de candidatos calificados
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
                    <p className="font-medium">Publicación ilimitada de vacantes</p>
                    <p className="text-sm text-muted-foreground">Publica todas las ofertas laborales que necesites</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-primary/20 mt-0.5">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Acceso a candidatos calificados</p>
                    <p className="text-sm text-muted-foreground">Conecta con profesionales que coinciden con tus requisitos</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-primary/20 mt-0.5">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Gestión eficiente de postulaciones</p>
                    <p className="text-sm text-muted-foreground">Administra candidatos desde un solo panel</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-primary/20 mt-0.5">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Análisis y reportes</p>
                    <p className="text-sm text-muted-foreground">Obtén insights sobre tus procesos de contratación</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-primary/20 mt-0.5">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Soporte prioritario</p>
                    <p className="text-sm text-muted-foreground">Asistencia dedicada para tu empresa</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>10K+ empresas activas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span>500K+ candidatos disponibles</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
