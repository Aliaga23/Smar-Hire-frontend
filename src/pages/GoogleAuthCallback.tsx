import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { handleGoogleCallback } from "@/services/auth"

export default function GoogleAuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const processGoogleAuth = async () => {
      // Evitar procesamiento doble
      const callbackId = searchParams.get('token')?.substring(-10) || 'unknown'
      const lastProcessed = sessionStorage.getItem('lastProcessedCallback')
      
      if (lastProcessed === callbackId) {
        return
      }
      
      sessionStorage.setItem('lastProcessedCallback', callbackId)
      
      const token = searchParams.get('token')
      const tipo = searchParams.get('tipo')
      const error = searchParams.get('error')
      
      // Verificar si es una redirección para completar registro
      const email = searchParams.get('email')
      const name = searchParams.get('name')
      const lastname = searchParams.get('lastname')
      const picture = searchParams.get('picture')

      if (error) {
        toast.error("Error en la autenticación con Google")
        navigate('/login', { replace: true })
        return
      }

      // NUEVO FLUJO: Si viene fromGoogle en la URL, el backend ya creó el usuario y envió el token
      const fromGoogle = searchParams.get('fromGoogle')
      const correo = searchParams.get('correo')
      
      if (fromGoogle === 'true' && token) {
        // El backend ya creó el usuario básico y nos envió el token
        localStorage.setItem('token', token)
        localStorage.setItem('oauthToken', token) // Token temporal para el registro
        
        const googleData = {
          name: name || '',
          lastname: lastname || '',
          correo: correo || email || '',
          picture: picture || '',
          fromGoogle: 'true'
        }
        
        const queryParams = new URLSearchParams(googleData).toString()
        
        // Determinar la ruta según el tipo de usuario
        const currentPath = window.location.pathname
        
        if (currentPath.includes('candidato') || tipo === 'candidato') {
          const targetRoute = `/signup/candidato?${queryParams}`
          navigate(targetRoute, { replace: true })
        } else {
          const targetRoute = `/register-empresa?${queryParams}`
          navigate(targetRoute, { replace: true })
        }
        
        toast.success("Completemos tu registro con los datos de Google")
        return
      }
      
      // FLUJO ANTIGUO: Si hay email pero no token (legacy)
      if (email && !token) {
        const googleData = {
          name: name || '',
          lastname: lastname || '',
          correo: email,
          picture: picture || '',
          fromGoogle: 'true'
        }
        
        const queryParams = new URLSearchParams(googleData).toString()
        
        // Determinar la ruta según la URL actual
        const currentPath = window.location.pathname
        
        if (currentPath.includes('candidato')) {
          const targetRoute = `/signup/candidato?${queryParams}`
          navigate(targetRoute, { replace: true })
        } else {
          const targetRoute = `/register-empresa?${queryParams}`
          navigate(targetRoute, { replace: true })
        }
        
        toast.success("Completemos tu registro con los datos de Google")
        return
      }

      if (!token || !tipo) {
        toast.error("Token o tipo de usuario no válido")
        navigate('/login', { replace: true })
        return
      }

      // DETECTAR SI VINO DE REGISTRO - con la nueva estructura de endpoints
      const isFromRegister = localStorage.getItem('attemptingRegister') === 'true'
      const registeringAs = localStorage.getItem('registeringAs')
      
      if (isFromRegister && tipo === 'usuario') {
        localStorage.removeItem('attemptingRegister')
        
        // Obtener datos básicos del usuario para el formulario
        try {
          localStorage.setItem('token', token)
          const userData = await handleGoogleCallback()
          // NO limpiar el token aquí - lo necesitamos para el registro step-by-step
          
          const googleData = {
            name: userData.name || '',
            lastname: userData.lastname || '',
            correo: userData.correo || '',
            picture: '',
            fromGoogle: 'true'
          }
          
          const queryParams = new URLSearchParams(googleData).toString()
          
          // Usar registeringAs para determinar la ruta correcta
          const targetRoute = registeringAs === 'candidato'
            ? `/signup/candidato?${queryParams}`
            : `/register-empresa?${queryParams}`
          
          localStorage.removeItem('registeringAs') // Solo limpiar esta flag
          sessionStorage.removeItem('lastProcessedCallback') // Limpiar procesamiento
          navigate(targetRoute, { replace: true })
          toast.info("Completa tu perfil para continuar")
          return
          
        } catch (error) {
          // Mantener el token para el registro
          localStorage.setItem('token', token)
          const googleData = { fromGoogle: 'true' }
          const queryParams = new URLSearchParams(googleData).toString()
          
          const fallbackRoute = registeringAs === 'empresa' 
            ? `/register-empresa?${queryParams}`
            : `/signup/candidato?${queryParams}`
          
          localStorage.removeItem('registeringAs')
          sessionStorage.removeItem('lastProcessedCallback')
          navigate(fallbackRoute, { replace: true })
          toast.info("Completa tu registro")
          return
        }
      }

      try {
        // Guardar el token temporalmente para hacer la petición
        localStorage.setItem('token', token)
        
        // Obtener datos completos del usuario
        const userData = await handleGoogleCallback()
        
        // Es un login existente - procesar normalmente
        let userRole = tipo
        let isAdmin = false
        
        // Corregir tipo si viene como "usuario"
        if (tipo === 'usuario') {
          if (userData.candidato) {
            userRole = 'candidato'
          } else if (userData.reclutador) {
            userRole = 'reclutador'
            const userId = userData.id
            const creadorId = userData.reclutador.empresa?.creadorId
            isAdmin = userId === creadorId
            userRole = isAdmin ? 'admin-empresa' : 'reclutador'
          }
        }
        
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('userType', userRole === 'admin-empresa' ? 'reclutador' : userRole)
        localStorage.setItem('userRole', userRole)
        localStorage.setItem('isAdmin', isAdmin.toString())
        
        // Limpiar todas las flags de registro
        localStorage.removeItem('attemptingRegister')
        localStorage.removeItem('registeringAs')
        sessionStorage.removeItem('lastProcessedCallback')
        
        toast.success(`¡Bienvenido! Inicio de sesión exitoso con Google`)
        
        if (userRole === 'candidato') {
          navigate('/dashboard-candidato', { replace: true })
        } else if (userRole === 'reclutador' || userRole === 'admin-empresa') {
          navigate('/dashboard-empresa', { replace: true })
        } else {
          navigate('/dashboard-candidato', { replace: true })
        }
        
      } catch (error: any) {
        toast.error("Error al obtener datos del usuario")
        localStorage.removeItem('token')
        localStorage.removeItem('attemptingRegister')
        localStorage.removeItem('registeringAs')
        sessionStorage.removeItem('lastProcessedCallback')
        navigate('/login', { replace: true })
      }
    }

    processGoogleAuth()
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <h2 className="text-xl font-semibold">Procesando autenticación...</h2>
        <p className="text-muted-foreground">
          Estamos completando tu inicio de sesión con Google
        </p>
      </div>
    </div>
  )
}