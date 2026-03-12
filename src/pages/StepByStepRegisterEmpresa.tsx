import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { 
  Building2, 
  Mail, 
  Phone, 
  Lock, 
  Camera, 
  Upload, 
  ArrowRight, 
  ArrowLeft, 
  Check,
  User
} from "lucide-react"
import { registerEmpresa, completeEmpresaOAuth } from '@/services/auth'

interface EmpresaStepData {
  nombreEmpresa: string
  descripcionEmpresa: string
  areaEmpresa: string
  name: string
  lastname: string
  correo: string
  telefono: string
  posicion: string
  password: string
  confirmPassword: string
  logoImage: File | null
  logoImageUrl: string
}

export default function StepByStepRegisterEmpresa() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<EmpresaStepData>(() => {
    try {
      const savedData = localStorage.getItem('empresaStepData')
      if (savedData) {
        return JSON.parse(savedData)
      }
    } catch (error) {
      console.error('Error al cargar datos guardados:', error)
    }
    
    return {
      nombreEmpresa: '',
      descripcionEmpresa: '',
      areaEmpresa: '',
      name: '',
      lastname: '',
      correo: '',
      telefono: '',
      posicion: '',
      password: '',
      confirmPassword: '',
      logoImage: null,
      logoImageUrl: ''
    }
  })

  useEffect(() => {
    return () => {
      const fromGoogle = searchParams.get('fromGoogle')
      if (fromGoogle !== 'true') {
        const currentUrl = window.location.pathname
        if (!currentUrl.includes('/dashboard')) {
          localStorage.removeItem('empresaStepData')
        }
      }
    }
  }, [searchParams])

  useEffect(() => {
    const fromGoogle = searchParams.get('fromGoogle')
    if (fromGoogle !== 'true') {
      localStorage.setItem('empresaStepData', JSON.stringify(formData))
    }
  }, [formData, searchParams])

  useEffect(() => {
    const fromGoogle = searchParams.get('fromGoogle')
    const name = searchParams.get('name')
    const lastname = searchParams.get('lastname')
    const correo = searchParams.get('correo')
    const picture = searchParams.get('picture')
    
    if (fromGoogle === 'true') {
      setFormData(prev => {
        const newData = {
          ...prev, // Preservar TODOS los datos existentes
          name: name || prev.name,
          lastname: lastname || prev.lastname,
          correo: correo || prev.correo,
          logoImageUrl: picture || prev.logoImageUrl
        }
        return newData
      })
    }
  }, [searchParams])

  const totalSteps = 4
  const progress = (currentStep / totalSteps) * 100

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      setFormData(prev => ({ ...prev, logoImage: file, logoImageUrl: imageUrl }))
    }
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.nombreEmpresa && formData.descripcionEmpresa && formData.areaEmpresa)
      case 2:
        return !!(formData.name && formData.lastname && formData.correo && formData.telefono && formData.posicion)
      case 3:
        return !!(formData.password && formData.confirmPassword && 
                 formData.password === formData.confirmPassword && 
                 formData.password.length >= 6)
      case 4:
        return true // Logo es opcional
      default:
        return false
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1)
      }
    } else {
      toast.error("Por favor completa todos los campos requeridos")
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    
    try {
      const { confirmPassword, logoImage, logoImageUrl, ...dataToSend } = formData
      
      if (!dataToSend.nombreEmpresa || !dataToSend.name || !dataToSend.lastname || 
          !dataToSend.correo || !dataToSend.password || !dataToSend.telefono || 
          !dataToSend.posicion) {
        toast.error('Por favor completa todos los campos requeridos')
        return
      }
      
      const fromGoogle = searchParams.get('fromGoogle') === 'true'
      let result
      
      if (fromGoogle) {
        const oauthToken = localStorage.getItem('oauthToken') || localStorage.getItem('token')
        
        if (!oauthToken) {
          toast.error('Error: No se encontró el token de autenticación de Google')
          return
        }
        
        result = await completeEmpresaOAuth(dataToSend)
      } else {
        result = await registerEmpresa(dataToSend)
      }
      
      localStorage.setItem('token', result.token)
      localStorage.setItem('user', JSON.stringify(result.usuario))
      localStorage.setItem('userType', result.tipoUsuario)
      localStorage.setItem('userRole', 'admin-empresa')
      localStorage.setItem('isAdmin', 'true')
      
      localStorage.removeItem('empresaStepData')
      localStorage.removeItem('oauthToken') // Limpiar token temporal de OAuth
      
      toast.success('¡Empresa registrada exitosamente!')
      navigate('/dashboard-empresa')
      
    } catch (error: any) {
      console.error('Error al registrar empresa:', error)
      console.error('Respuesta del servidor:', error.response?.data)
      
      let errorMessage = 'Error al registrar la empresa'
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (Array.isArray(error.response?.data)) {
        errorMessage = error.response.data.join(', ')
      }
      
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2 mb-6">
              <Building2 className="h-12 w-12 text-primary mx-auto" />
              <h3 className="text-xl font-semibold">Información de la Empresa</h3>
              <p className="text-muted-foreground">Cuéntanos sobre tu empresa</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nombreEmpresa">Nombre de la Empresa *</Label>
              <Input
                id="nombreEmpresa"
                name="nombreEmpresa"
                value={formData.nombreEmpresa}
                onChange={handleInputChange}
                placeholder="TechCorp Solutions"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="descripcionEmpresa">Descripción de la Empresa *</Label>
              <textarea
                id="descripcionEmpresa"
                name="descripcionEmpresa"
                value={formData.descripcionEmpresa}
                onChange={handleInputChange}
                placeholder="Describe qué hace tu empresa, su misión y valores..."
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="areaEmpresa">Sector/Industria *</Label>
              <Input
                id="areaEmpresa"
                name="areaEmpresa"
                value={formData.areaEmpresa}
                onChange={handleInputChange}
                placeholder="Tecnología, Salud, Finanzas, etc."
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2 mb-6">
              <User className="h-12 w-12 text-primary mx-auto" />
              <h3 className="text-xl font-semibold">Administrador de la Cuenta</h3>
              <p className="text-muted-foreground">Información del responsable</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Carlos"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastname">Apellido *</Label>
                <Input
                  id="lastname"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleInputChange}
                  placeholder="López"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="correo">Email Corporativo *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="correo"
                  name="correo"
                  type="email"
                  value={formData.correo}
                  onChange={handleInputChange}
                  placeholder="carlos@techcorp.com"
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  placeholder="+52 555 1234567"
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="posicion">Cargo/Posición *</Label>
              <Input
                id="posicion"
                name="posicion"
                value={formData.posicion}
                onChange={handleInputChange}
                placeholder="HR Manager, CEO, Reclutador..."
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2 mb-6">
              <Lock className="h-12 w-12 text-primary mx-auto" />
              <h3 className="text-xl font-semibold">Seguridad de la Cuenta</h3>
              <p className="text-muted-foreground">Crea una contraseña segura</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Mínimo 6 caracteres"
              />
              <p className="text-xs text-muted-foreground">
                Debe contener al menos 6 caracteres
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Repite tu contraseña"
              />
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-red-500">Las contraseñas no coinciden</p>
              )}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2 mb-6">
              <Camera className="h-12 w-12 text-primary mx-auto" />
              <h3 className="text-xl font-semibold">Logo de la Empresa</h3>
              <p className="text-muted-foreground">Agrega el logo de tu empresa</p>
            </div>
            
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-32 w-32 rounded-xl">
                <AvatarImage src={formData.logoImageUrl} />
                <AvatarFallback className="bg-muted text-2xl rounded-xl">
                  {formData.nombreEmpresa 
                    ? formData.nombreEmpresa.slice(0, 2).toUpperCase()
                    : <Building2 className="h-12 w-12" />
                  }
                </AvatarFallback>
              </Avatar>
              
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('logo-upload')?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Subir Logo
                </Button>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              
              <p className="text-sm text-muted-foreground text-center">
                Sube el logo de tu empresa en alta calidad. <br />
                JPG, PNG o SVG (máximo 5MB)
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/20">
      <div className="w-full max-w-2xl">
        <Card className="shadow-2xl">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Registrar Empresa</CardTitle>
                <CardDescription>
                  Paso {currentStep} de {totalSteps}
                </CardDescription>
              </div>
              <Badge className="bg-green-500/10 text-green-600">Gratis</Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progreso</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {renderStep()}

            <div className="flex flex-col gap-4">
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Anterior
                </Button>

                {currentStep === totalSteps ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading || !validateStep(currentStep)}
                    className="flex items-center gap-2"
                  >
                    {isLoading ? "Registrando..." : (
                      <>
                        <Check className="h-4 w-4" />
                        Registrar Empresa
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={nextStep}
                    disabled={!validateStep(currentStep)}
                    className="flex items-center gap-2"
                  >
                    Siguiente
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-muted-foreground text-sm">
            ¿Ya tienes cuenta?{" "}
            <Button variant="link" asChild className="p-0">
              <a href="/login">Inicia sesión aquí</a>
            </Button>
          </p>
        </div>
      </div>
    </div>
  )
}