import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, Mail, Send, CheckCircle2, Briefcase } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { forgotPassword } from "../services/auth"

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error("Por favor ingresa tu correo electrónico")
      return
    }

    setIsLoading(true)
    
    try {
      const response = await forgotPassword(email)
      toast.success(response.message || "Si el correo existe, recibirás un enlace de recuperación")
      setEmailSent(true)
    } catch (error: any) {
      console.error('Error al solicitar recuperación:', error)
      toast.error(error.response?.data?.message || "Error al enviar el correo de recuperación")
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
              Recupera tu cuenta con SmartHire
            </h1>
            <p className="text-lg text-muted-foreground">
              Te ayudaremos a restablecer tu contraseña de forma rápida y segura.
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
                  Proceso seguro
                </h3>
                <p className="text-muted-foreground">
                  Enviamos un enlace de recuperación único a tu correo electrónico
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  Enlace temporal
                </h3>
                <p className="text-muted-foreground">
                  El enlace expira en 1 hora por tu seguridad
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  Sin complicaciones
                </h3>
                <p className="text-muted-foreground">
                  Solo necesitas tu correo electrónico registrado
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {emailSent ? (
            <>
              {/* Header - Email Sent */}
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 mb-4">
                  <Send className="h-10 w-10 text-green-500" />
                </div>
                <h2 className="text-3xl font-bold">
                  Correo Enviado
                </h2>
                <p className="text-muted-foreground">
                  Revisa tu bandeja de entrada
                </p>
              </div>

              {/* Success Message */}
              <div className="space-y-6">
                <div className="p-6 bg-muted rounded-lg space-y-3">
                  <p className="text-sm text-muted-foreground text-center">
                    Si el correo <strong className="text-foreground">{email}</strong> está registrado en nuestro sistema, 
                    recibirás un enlace para restablecer tu contraseña.
                  </p>
                  <p className="text-xs text-muted-foreground text-center">
                    El enlace expirará en 1 hora por seguridad.
                  </p>
                </div>

                <Button 
                  className="w-full" 
                  onClick={() => window.location.href = '/login'}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver al Login
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Header */}
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
                  <Mail className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-3xl font-bold">
                  Recuperar Contraseña
                </h2>
                <p className="text-muted-foreground">
                  Ingresa tu correo para recibir instrucciones
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Correo Electrónico
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="tu@ejemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Te enviaremos un enlace para restablecer tu contraseña
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    'Enviando...'
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Enviar Enlace de Recuperación
                    </>
                  )}
                </Button>
              </form>

              {/* Footer Links */}
              <div className="space-y-4 text-center text-sm">
                <Link 
                  to="/login" 
                  className="text-primary hover:text-primary/80 font-medium inline-flex items-center justify-center"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Volver al Login
                </Link>
                
                <p className="text-muted-foreground">
                  ¿No tienes cuenta?{" "}
                  <Link to="/signup" className="text-primary hover:text-primary/80 font-medium">
                    Regístrate aquí
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
