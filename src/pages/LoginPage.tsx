import { Briefcase, CheckCircle2, Eye, EyeOff, User, Mail, Lock } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login } from "../services/auth"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    correo: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.correo || !formData.password) {
      toast.error("Por favor completa todos los campos")
      return
    }

    setIsLoading(true)
    
    try {
      const response = await login(formData.correo, formData.password)
      
      // Determinar rol específico para reclutadores
      let userRole = response.tipoUsuario
      let isAdmin = false
      
      if (response.tipoUsuario === 'reclutador' && response.usuario.reclutador) {
        // Verificar si es administrador de la empresa
        const userId = response.usuario.id
        const creadorId = response.usuario.reclutador.empresa.creadorId
        isAdmin = userId === creadorId
        userRole = isAdmin ? 'admin-empresa' : 'reclutador'
      }
      
      // Guardar datos en localStorage
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.usuario))
      localStorage.setItem('userType', response.tipoUsuario)
      localStorage.setItem('userRole', userRole)
      localStorage.setItem('isAdmin', isAdmin.toString())
      
      toast.success(`Bienvenido ${isAdmin ? 'Administrador' : response.tipoUsuario === 'candidato' ? 'Candidato' : 'Reclutador'}`)
      
      // Redirigir según el tipo de usuario
      if (response.tipoUsuario === 'candidato') {
        navigate('/dashboard-candidato')
      } else if (response.tipoUsuario === 'reclutador') {
        navigate('/dashboard-empresa')
      }
      
    } catch (error: any) {
      console.error('Error en login:', error)
      toast.error(error.response?.data?.message || "Error al iniciar sesión")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Info Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 p-16 flex-col justify-center">
        <div className="max-w-lg mx-auto space-y-12">
          {/* Logo/Icon */}
          <div className="flex justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-xl">
              <Briefcase className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>
          
          {/* Main Title */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">
              Encuentra tu trabajo ideal con SmartHire
            </h1>
            <p className="text-lg text-muted-foreground">
              Conecta con las mejores oportunidades laborales y empresas que buscan tu talento profesional.
            </p>
          </div>
          
          {/* Features List */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  Miles de ofertas actualizadas
                </h3>
                <p className="text-muted-foreground">
                  Accede a nuevas oportunidades laborales cada día en todas las industrias
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  Postulación instantánea
                </h3>
                <p className="text-muted-foreground">
                  Aplica a múltiples ofertas con un solo clic y gestiona tus aplicaciones fácilmente
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  Conexión directa con empresas
                </h3>
                <p className="text-muted-foreground">
                  Comunícate directamente con reclutadores y recibe respuestas más rápidas
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
              <User className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-3xl font-bold">
              Bienvenido de nuevo
            </h2>
            <p className="text-muted-foreground">
              Ingresa tus credenciales para acceder a tu cuenta
            </p>
          </div>
          
          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Correo electrónico
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  id="email"
                  name="correo"
                  type="email"
                  value={formData.correo}
                  onChange={handleInputChange}
                  placeholder="tu@ejemplo.com"
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Usa tu correo registrado para acceder
              </p>
            </div>
            
            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">
                  Contraseña
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-primary hover:text-primary/80"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground h-full"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
          </form>
          
          {/* Sign up link */}
          <div className="text-center text-sm">
            <span className="text-muted-foreground">¿No tienes una cuenta? </span>
            <Link
              to="/signup"
              className="font-semibold text-primary hover:text-primary/80"
            >
              Regístrate
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
