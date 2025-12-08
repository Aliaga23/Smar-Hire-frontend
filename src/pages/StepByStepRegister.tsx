import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Camera, 
  Upload, 
  ArrowRight, 
  ArrowLeft, 
  Check,
  Briefcase,
  Brain,
  FileText,
  Sparkles
} from "lucide-react"
import GoogleAuthButton from "@/components/GoogleAuthButton"
import { registerCandidato, completeCandidatoOAuth } from "@/services/auth"
import { parseCvWithAI } from "@/services/candidato"

interface StepData {
  // Paso 1: Información personal
  name: string
  lastname: string
  correo: string
  telefono: string
  
  // Paso 2: Seguridad
  password: string
  confirmPassword: string
  
  // Paso 3: Perfil profesional
  titulo: string
  bio: string
  ubicacion: string
  
  // Paso 4: Foto de perfil
  profileImage: File | null
  profileImageUrl: string
  
  // Paso 5: Experiencia y habilidades
  experienceMethod: 'manual' | 'ocr' | ''
}

export default function StepByStepRegister() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [processingCV, setProcessingCV] = useState(false)
  const [formData, setFormData] = useState<StepData>({
    name: '',
    lastname: '',
    correo: '',
    telefono: '',
    password: '',
    confirmPassword: '',
    titulo: '',
    bio: '',
    ubicacion: '',
    profileImage: null,
    profileImageUrl: '',
    experienceMethod: ''
  })

  useEffect(() => {
    const fromGoogle = searchParams.get('fromGoogle')
    const name = searchParams.get('name')
    const lastname = searchParams.get('lastname')
    const correo = searchParams.get('correo')
    const picture = searchParams.get('picture')
    
    if (fromGoogle === 'true') {
      setFormData(prev => ({
        ...prev,
        name: name || '',
        lastname: lastname || '',
        correo: correo || '',
        profileImageUrl: picture || ''
      }))
      
      if (name && lastname && correo) {
        setCurrentStep(2)
      }
    }
  }, [searchParams])

  const totalSteps = 5
  const progress = (currentStep / totalSteps) * 100

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      setFormData(prev => ({ ...prev, profileImage: file, profileImageUrl: imageUrl }))
    }
  }

  const handleCVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo (imagen)
    if (!file.type.startsWith("image/")) {
      toast.error("Archivo no válido", {
        description: "Por favor sube una imagen de tu CV (JPG, PNG, etc.)",
      });
      return;
    }

    // Verificar que el candidato esté creado (debe tener token y userType)
    const token = localStorage.getItem('token')
    const userType = localStorage.getItem('userType')
    
    if (!token || userType !== 'candidato') {
      toast.error("Error de autenticación", {
        description: "Debes completar el registro antes de procesar tu CV",
      });
      return;
    }

    setProcessingCV(true);

    try {
      // Convertir imagen a base64
      const reader = new FileReader();
      
      const imageDataPromise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const imageData = await imageDataPromise;

      // Ahora sí tenemos las credenciales de candidato para usar el endpoint
      await parseCvWithAI(imageData);

      toast.success("¡CV procesado con éxito!", {
        description: "La información de tu CV ha sido extraída. Ya puedes continuar al dashboard.",
      });
      
    } catch (error) {
      toast.error("Error al procesar CV", {
        description: "No se pudo analizar el archivo. Verifica que contenga información válida.",
      });
    } finally {
      setProcessingCV(false);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.name && formData.lastname && formData.correo && formData.telefono)
      case 2:
        return !!(formData.password && formData.confirmPassword && 
                 formData.password === formData.confirmPassword && 
                 formData.password.length >= 6)
      case 3:
        return !!(formData.titulo && formData.bio && formData.ubicacion)
      case 4:
        return true // Foto es opcional pero requerimos continuar
      case 5:
        return !!formData.experienceMethod
      default:
        return false
    }
  }

  const nextStep = () => {
      if (validateStep(currentStep)) {
        if (currentStep < totalSteps) {
          if (currentStep === 4) {
          handleCandidateCreation()
        } else {
          setCurrentStep(currentStep + 1)
        }
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

  const handleCandidateCreation = async () => {
    setIsLoading(true)
    
    try {
      const { confirmPassword, profileImage, profileImageUrl, experienceMethod, ...dataToSend } = formData
      
      const fromGoogle = searchParams.get('fromGoogle') === 'true'
      
      let result
      if (fromGoogle) {
        const oauthToken = localStorage.getItem('oauthToken') || localStorage.getItem('token')
        
        if (!oauthToken) {
          toast.error('Error: No se encontró el token de autenticación de Google')
          return
        }
        
        result = await completeCandidatoOAuth(dataToSend)
      } else {
        result = await registerCandidato(dataToSend)
      }
      
      localStorage.setItem('token', result.token)
      localStorage.setItem('user', JSON.stringify(result.usuario))
      localStorage.setItem('userType', result.tipoUsuario)
      
      if (fromGoogle) {
        localStorage.removeItem('attemptingRegister')
        localStorage.removeItem('oauthToken')
      }
      
      toast.success('¡Candidato creado exitosamente! Ahora puedes agregar tu experiencia')
      
      setCurrentStep(5)
      
    } catch (error: any) {
      const fromGoogle = searchParams.get('fromGoogle') === 'true'
      if (fromGoogle && error.response?.status === 409) {
        toast.error('Ya tienes una cuenta. Intenta iniciar sesión en lugar de registrarte.')
      } else {
        toast.error(error.response?.data?.message || 'Error al crear la cuenta')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(5)) {
      toast.error("Por favor selecciona cómo quieres agregar tu experiencia")
      return
    }

    const experienceMethod = formData.experienceMethod
    
    toast.success('¡Registro completado exitosamente!')
    
    if (experienceMethod === 'manual') {
      navigate('/dashboard-candidato?setup=manual')
    } else if (experienceMethod === 'ocr') {
      navigate('/dashboard-candidato?setup=ocr')
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2 mb-6">
              <User className="h-12 w-12 text-primary mx-auto" />
              <h3 className="text-xl font-semibold">Información Personal</h3>
              <p className="text-muted-foreground">Cuéntanos sobre ti</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Juan"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastname">Apellido *</Label>
                <Input
                  id="lastname"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleInputChange}
                  placeholder="Pérez"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="correo">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="correo"
                  name="correo"
                  type="email"
                  value={formData.correo}
                  onChange={handleInputChange}
                  placeholder="juan@ejemplo.com"
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
          </div>
        )

      case 2:
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

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2 mb-6">
              <Briefcase className="h-12 w-12 text-primary mx-auto" />
              <h3 className="text-xl font-semibold">Perfil Profesional</h3>
              <p className="text-muted-foreground">Destaca tu experiencia</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="titulo">Título Profesional *</Label>
              <Input
                id="titulo"
                name="titulo"
                value={formData.titulo}
                onChange={handleInputChange}
                placeholder="Desarrollador Full Stack"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio">Biografía Profesional *</Label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Describe tu experiencia, logros y objetivos profesionales..."
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ubicacion">Ubicación *</Label>
              <Input
                id="ubicacion"
                name="ubicacion"
                value={formData.ubicacion}
                onChange={handleInputChange}
                placeholder="Ciudad de México, México"
              />
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2 mb-6">
              <Camera className="h-12 w-12 text-primary mx-auto" />
              <h3 className="text-xl font-semibold">Foto de Perfil</h3>
              <p className="text-muted-foreground">Agrega una foto profesional</p>
            </div>
            
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-32 w-32">
                <AvatarImage src={formData.profileImageUrl} />
                <AvatarFallback className="bg-muted text-2xl">
                  {formData.name && formData.lastname 
                    ? `${formData.name[0]}${formData.lastname[0]}`.toUpperCase()
                    : <User className="h-12 w-12" />
                  }
                </AvatarFallback>
              </Avatar>
              
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('photo-upload')?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Subir Foto
                </Button>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              
              <p className="text-sm text-muted-foreground text-center">
                Sube una foto clara y profesional. <br />
                JPG, PNG o GIF (máximo 5MB)
              </p>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2 mb-6">
              <Brain className="h-12 w-12 text-primary mx-auto" />
              <h3 className="text-xl font-semibold">Experiencia y Habilidades</h3>
              <p className="text-muted-foreground">Elige cómo completar tu perfil</p>
            </div>
            
            <div className="grid gap-4">
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  formData.experienceMethod === 'manual' ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setFormData(prev => ({ ...prev, experienceMethod: 'manual' }))}
              >
                <CardContent className="flex items-start gap-4 p-6">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    formData.experienceMethod === 'manual' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2">Agregar Manualmente</h4>
                    <p className="text-sm text-muted-foreground">
                      Completa tu experiencia laboral y habilidades paso a paso
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">Recomendado</Badge>
                      <span className="text-xs text-muted-foreground">5-10 min</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  formData.experienceMethod === 'ocr' ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setFormData(prev => ({ ...prev, experienceMethod: 'ocr' }))}
              >
                <CardContent className="flex items-start gap-4 p-6">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    formData.experienceMethod === 'ocr' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      Cargar con IA y OCR
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        IA
                      </Badge>
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Sube tu CV y nuestra IA extraerá automáticamente tu información
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">Rápido</Badge>
                      <span className="text-xs text-muted-foreground">1-2 min</span>
                    </div>
                    
                    {formData.experienceMethod === 'ocr' && (
                      <div className="mt-4 pt-4 border-t" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <label htmlFor="cv-upload-step">
                            <Button 
                              variant="default" 
                              size="sm" 
                              disabled={processingCV}
                              className="cursor-pointer"
                              asChild
                            >
                              <span>
                                <FileText className="h-4 w-4 mr-2" />
                                {processingCV ? "Procesando..." : "Cargar CV con IA"}
                              </span>
                            </Button>
                          </label>
                          <Input
                            id="cv-upload-step"
                            type="file"
                            accept="image/*"
                            onChange={handleCVUpload}
                            disabled={processingCV}
                            className="hidden"
                          />
                        </div>
                        {processingCV && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                            <div className="w-3 h-3 border border-primary border-r-transparent rounded-full animate-spin"></div>
                            <span>Nuestro OCR está analizando tu CV...</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h5 className="font-medium text-sm">¿No tienes tiempo ahora?</h5>
                  <p className="text-xs text-muted-foreground">
                    Puedes completar esta información después desde tu panel de control
                  </p>
                </div>
              </div>
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
                <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
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
                    {isLoading ? "Creando cuenta..." : (
                      <>
                        <Check className="h-4 w-4" />
                        Crear Cuenta
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

              {currentStep === 1 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <div className="text-center text-sm text-muted-foreground">
                      O regístrate con
                    </div>
                    <GoogleAuthButton type="register" userType="candidato" />
                  </div>
                </>
              )}
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