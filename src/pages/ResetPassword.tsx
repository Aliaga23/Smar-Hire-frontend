import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { CheckCircle, CheckCircle2, Eye, EyeOff, Lock, Briefcase } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { resetPassword } from "../services/auth"

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [formData, setFormData] = useState({
    nuevaPassword: '',
    confirmarPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [passwordReset, setPasswordReset] = useState(false)

  if (!token) {
    return (
      <div className="min-h-screen flex">
        {/* Left side - Info Section */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 p-16 flex-col justify-center">
          <div className="max-w-lg mx-auto text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-xl">
                <Briefcase className="h-12 w-12 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-4xl font-bold">
              Token Inválido
            </h1>
            <p className="text-lg text-muted-foreground">
              El enlace de recuperación no es válido o ha expirado.
            </p>
          </div>
        </div>

        {/* Right side - Error */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 mb-4">
                <Lock className="h-10 w-10 text-destructive" />
              </div>
              <h2 className="text-3xl font-bold">
                Token Inválido
              </h2>
              <p className="text-muted-foreground">
                El enlace de recuperación no es válido o ha expirado.
              </p>
            </div>
            <Link to="/forgot-password">
              <Button className="w-full">
                Solicitar Nuevo Enlace
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nuevaPassword || !formData.confirmarPassword) {
      toast.error("Por favor completa todos los campos")
      return
    }

    if (formData.nuevaPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres")
      return
    }

    if (formData.nuevaPassword !== formData.confirmarPassword) {
      toast.error("Las contraseñas no coinciden")
      return
    }

    setIsLoading(true)
    
    try {
      const response = await resetPassword(token, formData.nuevaPassword)
      toast.success(response.message || "Contraseña actualizada exitosamente")
      setPasswordReset(true)
      
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (error: any) {
      console.error('Error al restablecer contraseña:', error)
      toast.error(error.response?.data?.message || "Token inválido o expirado")
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
              Crea tu nueva contraseña
            </h1>
            <p className="text-lg text-muted-foreground">
              Asegura tu cuenta con una contraseña fuerte y única.
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
                  Mínimo 6 caracteres
                </h3>
                <p className="text-muted-foreground">
                  Usa una combinación de letras, números y símbolos
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  Contraseña segura
                </h3>
                <p className="text-muted-foreground">
                  Combina mayúsculas, minúsculas y caracteres especiales
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  Protege tu información
                </h3>
                <p className="text-muted-foreground">
                  Evita usar información personal fácilmente identificable
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {passwordReset ? (
            <>
              {/* Header - Success */}
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 mb-4">
                  <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
                <h2 className="text-3xl font-bold">
                  ¡Contraseña Actualizada!
                </h2>
                <p className="text-muted-foreground">
                  Tu contraseña ha sido restablecida exitosamente
                </p>
              </div>

              {/* Success Message */}
              <div className="space-y-6">
                <div className="p-6 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground text-center">
                    Serás redirigido al login en unos segundos...
                  </p>
                </div>

                <Button 
                  className="w-full" 
                  onClick={() => navigate('/login')}
                >
                  Ir al Login
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Header */}
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
                  <Lock className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-3xl font-bold">
                  Nueva Contraseña
                </h2>
                <p className="text-muted-foreground">
                  Ingresa tu nueva contraseña
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nueva Contraseña */}
                <div className="space-y-2">
                  <Label htmlFor="nuevaPassword">
                    Nueva Contraseña
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      id="nuevaPassword"
                      name="nuevaPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      value={formData.nuevaPassword}
                      onChange={handleInputChange}
                      className="pl-10 pr-10"
                      required
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

                {/* Confirmar Contraseña */}
                <div className="space-y-2">
                  <Label htmlFor="confirmarPassword">
                    Confirmar Contraseña
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      id="confirmarPassword"
                      name="confirmarPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Repite tu contraseña"
                      value={formData.confirmarPassword}
                      onChange={handleInputChange}
                      className="pl-10 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground h-full"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    'Actualizando...'
                  ) : (
                    'Restablecer Contraseña'
                  )}
                </Button>
              </form>

              {/* Footer Links */}
              <div className="text-center text-sm">
                <Link 
                  to="/login" 
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Volver al Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
