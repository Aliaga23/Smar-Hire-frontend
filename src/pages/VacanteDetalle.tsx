import { useEffect, useState, useCallback } from "react"
import { useParams, Navigate, useNavigate } from "react-router-dom"
import { useCurrentUser } from "../utils/auth"
import { getVacante, type Vacante } from "@/services/vacante"
import { getPostulacionesByVacante, type Postulacion } from "@/services/postulacion"
import api from "@/lib/axios"
import { toast } from "sonner"
import { EmpresaNavbar } from "@/components/EmpresaNavbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  ArrowLeft, 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Clock, 
  Users,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from "lucide-react"

export default function VacanteDetalle() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated, isReclutador } = useCurrentUser()
  const [vacante, setVacante] = useState<Vacante | null>(null)
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadingPostulaciones, setLoadingPostulaciones] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalPostulaciones, setTotalPostulaciones] = useState(0)
  const [isProcessingMatching, setIsProcessingMatching] = useState(false)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!isReclutador) {
    return <Navigate to="/dashboard-candidato" replace />
  }

  useEffect(() => {
    const fetchVacante = async () => {
      if (!id) return

      try {
        setIsLoading(true)
        const vacanteData = await getVacante(id)
        setVacante(vacanteData)
      } catch (error) {
        console.error('Error al cargar vacante:', error)
        toast.error('Error al cargar la vacante')
      } finally {
        setIsLoading(false)
      }
    }

    fetchVacante()
  }, [id])

  useEffect(() => {
    const fetchPostulaciones = async () => {
      if (!id) return

      try {
        setLoadingPostulaciones(true)
        const postulacionesResponse = await getPostulacionesByVacante(id, currentPage, 10)
        setPostulaciones(postulacionesResponse.data)
        setTotalPages(postulacionesResponse.pagination.totalPages)
        setTotalPostulaciones(postulacionesResponse.pagination.total)
      } catch (error) {
        console.error('Error al cargar postulaciones:', error)
        toast.error('Error al cargar las postulaciones')
      } finally {
        setLoadingPostulaciones(false)
      }
    }

    fetchPostulaciones()
  }, [id, currentPage])

  const formatearFecha = useCallback((fecha: string) => {
    const date = new Date(fecha)
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }, [])

  const formatearSalario = useCallback((min?: number, max?: number) => {
    if (!min && !max) return 'A convenir'
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`
    if (min) return `Desde $${min.toLocaleString()}`
    return `Hasta $${max?.toLocaleString()}`
  }, [])

  const obtenerIniciales = useCallback((postulacion: Postulacion) => {
    const { name, lastname } = postulacion.candidato?.usuario || {}
    const inicialNombre = name?.[0]?.toUpperCase() || ''
    const inicialApellido = lastname?.[0]?.toUpperCase() || ''
    return `${inicialNombre}${inicialApellido}` || '??'
  }, [])

  const procesarMatching = async () => {
    if (!id) return
    
    try {
      setIsProcessingMatching(true)
      await api.post(`/matching/vacante/${id}/process`)
      toast.success('Compatibilidad calculada exitosamente')
      
      // Recargar postulaciones para ver los nuevos scores
      const postulacionesResponse = await getPostulacionesByVacante(id, currentPage, 10)
      setPostulaciones(postulacionesResponse.data)
      setTotalPages(postulacionesResponse.pagination.totalPages)
      setTotalPostulaciones(postulacionesResponse.pagination.total)
    } catch (error) {
      console.error('Error al procesar matching:', error)
      toast.error('Error al calcular la compatibilidad')
    } finally {
      setIsProcessingMatching(false)
    }
  }

  if (!vacante && !isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <EmpresaNavbar />
        <main className="container mx-auto p-6">
          <div className="text-center py-12">Vacante no encontrada</div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <EmpresaNavbar />
      
      <main className="container mx-auto p-6 space-y-6">
        {/* Header con navegación */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/dashboard-empresa')}
            className="flex-shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <>
                <Skeleton className="h-9 w-full max-w-96 mb-2" />
                <Skeleton className="h-5 w-full max-w-64" />
              </>
            ) : (
              <>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight break-words">{vacante?.titulo}</h1>
                <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                  Publicada el {formatearFecha(vacante?.creado_en || '')}
                </p>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {!isLoading && totalPostulaciones > 0 && (
              <Button
                onClick={procesarMatching}
                disabled={isProcessingMatching}
                className="gap-2 flex-1 sm:flex-initial"
                size="sm"
              >
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">{isProcessingMatching ? 'Procesando...' : 'Calcular Compatibilidad'}</span>
                <span className="sm:hidden">{isProcessingMatching ? 'Procesando...' : 'Calcular'}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Info de la vacante */}
        <Card>
          <CardHeader>
            <CardTitle>Detalles de la Vacante</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <>
                <div>
                  <Skeleton className="h-5 w-24 mb-2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full mt-1" />
                  <Skeleton className="h-4 w-3/4 mt-1" />
                </div>
                <Separator />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" />
                      <div className="flex-1">
                        <Skeleton className="h-3 w-16 mb-1" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">Descripción</h3>
                    <p className="text-muted-foreground">{vacante?.descripcion}</p>
                  </div>
                  <Badge variant={vacante?.estado === "ABIERTA" ? "default" : "secondary"} className="flex-shrink-0">
                    {vacante?.estado}
                  </Badge>
                </div>

                <Separator />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Salario</p>
                      <p className="font-medium">{formatearSalario(vacante?.salario_minimo, vacante?.salario_maximo)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Modalidad</p>
                      <p className="font-medium">{vacante?.modalidad?.nombre || 'No especificado'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Horario</p>
                      <p className="font-medium">{vacante?.horario?.nombre || 'No especificado'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Postulaciones</p>
                      <p className="font-medium">{vacante?._count?.postulaciones || 0}</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Postulaciones */}
        <Card>
          <CardHeader>
            <CardTitle>Postulaciones ({loadingPostulaciones ? '...' : totalPostulaciones})</CardTitle>
            <CardDescription>
              Candidatos que aplicaron a esta vacante
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingPostulaciones ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <Skeleton className="h-16 w-16 rounded-full flex-shrink-0" />
                        <div className="flex-1 space-y-3">
                          <div>
                            <Skeleton className="h-6 w-48 mb-2" />
                            <Skeleton className="h-4 w-64" />
                          </div>
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <Separator />
                          <div className="flex gap-4">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                          <div className="flex gap-2">
                            <Skeleton className="h-6 w-20" />
                            <Skeleton className="h-6 w-20" />
                            <Skeleton className="h-6 w-20" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : postulaciones.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay postulaciones aún
              </div>
            ) : (
              <div className="space-y-4">
                {postulaciones.map((postulacion) => (
                  <Card key={postulacion.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-4 sm:pt-6">
                      <div className="flex flex-col sm:flex-row items-start gap-4">
                        {/* Avatar */}
                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-semibold text-lg flex-shrink-0 self-center sm:self-start">
                          {obtenerIniciales(postulacion)}
                        </div>

                        {/* Info del candidato */}
                        <div className="flex-1 space-y-3 w-full min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-base sm:text-lg break-words">
                                {postulacion.candidato?.usuario.name} {postulacion.candidato?.usuario.lastname}
                              </h3>
                              <p className="text-sm text-muted-foreground break-words">
                                {postulacion.candidato?.titulo || 'Sin título profesional'}
                              </p>
                            </div>
                            {postulacion.puntuacion_compatibilidad && (
                              <Badge variant="outline" className="text-base sm:text-lg px-3 py-1 self-start">
                                {Math.round(postulacion.puntuacion_compatibilidad * 100)}% match
                              </Badge>
                            )}
                          </div>

                          {/* Bio */}
                          {postulacion.candidato?.bio && (
                            <p className="text-sm text-muted-foreground">
                              {postulacion.candidato.bio}
                            </p>
                          )}

                          <Separator />

                          {/* Contacto */}
                          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
                            {postulacion.candidato?.usuario.correo && (
                              <div className="flex items-center gap-2 min-w-0">
                                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span className="truncate">{postulacion.candidato.usuario.correo}</span>
                              </div>
                            )}
                            {postulacion.candidato?.usuario.telefono && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span>{postulacion.candidato.usuario.telefono}</span>
                              </div>
                            )}
                            {postulacion.candidato?.ubicacion && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span>{postulacion.candidato.ubicacion}</span>
                              </div>
                            )}
                          </div>

                          <Separator />

                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <span className="text-xs text-muted-foreground">
                              Postulado el {formatearFecha(postulacion.creado_en)}
                            </span>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigate(`/perfil-candidato/${postulacion.id}`)}
                                className="cursor-pointer w-full sm:w-auto"
                              >
                                Ver perfil completo
                              </Button>
                              <Button size="sm" className="cursor-pointer w-full sm:w-auto">
                                Contactar
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            {!loadingPostulaciones && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Anterior</span>
                </Button>
                <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="gap-1"
                >
                  <span className="hidden sm:inline">Siguiente</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
