import { useCurrentUser } from "../utils/auth"
import { Navigate, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EmpresaNavbar } from "@/components/EmpresaNavbar"
import { 
  Briefcase, 
  Users, 
  Clock, 
  Eye,
  Plus,
  FileText,
  Edit,
  MoreVertical,
  Trash2
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { useState, useEffect, useMemo, useCallback } from "react"
import { getVacantes, deleteVacante, updateEstadoVacante, type Vacante } from "@/services/vacante"
import { toast } from "sonner"

export default function DashboardEmpresa() {
  const { isAuthenticated, isReclutador, empresaId } = useCurrentUser()
  const navigate = useNavigate()
  const [vacantes, setVacantes] = useState<Vacante[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  if (!isReclutador) {
    return <Navigate to="/dashboard-candidato" replace />
  }

  // Cargar vacantes de la empresa
  useEffect(() => {
    const fetchVacantes = async () => {
      if (!empresaId) return
      
      try {
        setIsLoading(true)
        const data = await getVacantes({ empresaId })
        setVacantes(data)
      } catch (error) {
        console.error('Error al cargar vacantes:', error)
        toast.error('Error al cargar las vacantes')
      } finally {
        setIsLoading(false)
      }
    }

    fetchVacantes()
  }, [empresaId])

  // Calcular estadísticas
  const stats = useMemo(() => ({
    vacantesActivas: vacantes.filter(v => v.estado === 'ABIERTA').length,
    candidatosTotal: vacantes.reduce((acc, v) => acc + (v._count?.postulaciones || 0), 0),
    postulacionesPendientes: vacantes.reduce((acc, v) => acc + (v._count?.postulaciones || 0), 0)
  }), [vacantes])

  // Formatear fecha
  const formatearFecha = useCallback((fecha: string) => {
    const ahora = new Date()
    const fechaVacante = new Date(fecha)
    const diffTime = Math.abs(ahora.getTime() - fechaVacante.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Hace 1 día'
    if (diffDays < 7) return `Hace ${diffDays} días`
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`
    return `Hace ${Math.floor(diffDays / 30)} meses`
  }, [])

  // Formatear salario
  const formatearSalario = useCallback((min?: number, max?: number) => {
    if (!min && !max) return 'A convenir'
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`
    if (min) return `Desde $${min.toLocaleString()}`
    return `Hasta $${max?.toLocaleString()}`
  }, [])

  // Navegar a página de crear vacante
  const handleNuevaVacante = () => {
    navigate('/vacante/crear')
  }

  // Navegar a página de editar vacante
  const handleEditarVacante = (vacanteId: string) => {
    navigate(`/vacante/editar/${vacanteId}`)
  }

  // Eliminar vacante
  const handleEliminarVacante = async (vacanteId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta vacante?')) return
    
    try {
      await deleteVacante(vacanteId)
      toast.success('Vacante eliminada correctamente')
      // Recargar vacantes
      if (empresaId) {
        const data = await getVacantes({ empresaId })
        setVacantes(data)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar la vacante')
    }
  }

  // Cambiar estado de vacante
  const handleCambiarEstado = async (vacanteId: string, nuevoEstado: 'ABIERTA' | 'CERRADA' | 'PAUSADA') => {
    try {
      await updateEstadoVacante(vacanteId, nuevoEstado)
      toast.success(`Vacante ${nuevoEstado.toLowerCase()} correctamente`)
      // Recargar vacantes
      if (empresaId) {
        const data = await getVacantes({ empresaId })
        setVacantes(data)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cambiar el estado')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <EmpresaNavbar />
      
      <main className="container mx-auto p-6 space-y-6">
        {/* Header con acciones */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Panel de Control</h1>
            <p className="text-muted-foreground mt-1">
              Gestiona tus vacantes y encuentra el talento ideal
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              Reportes
            </Button>
            <Button size="lg" className="gap-2" onClick={handleNuevaVacante}>
              <Plus className="h-4 w-4" />
              Nueva Vacante
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Vacantes Activas
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Briefcase className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stats.vacantesActivas}</div>
              )}
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Candidatos
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stats.candidatosTotal}</div>
              )}
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Por Revisar
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Clock className="h-4 w-4 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stats.postulacionesPendientes}</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-7">
          {/* Vacantes Recientes - Ocupa más espacio */}
          <Card className="lg:col-span-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Vacantes Activas</CardTitle>
                  <CardDescription>
                    Gestiona y monitorea el progreso de tus ofertas
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="gap-1">
                  Ver todas
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <>              
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-5 w-48" />
                            <div className="flex items-center gap-3">
                              <Skeleton className="h-4 w-24" />
                              <Skeleton className="h-4 w-20" />
                              <Skeleton className="h-4 w-32" />
                            </div>
                          </div>
                        </div>
                        <Skeleton className="h-3 w-32" />
                      </div>
                    ))}
                  </>
                ) : vacantes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay vacantes activas
                  </div>
                ) : (
                  vacantes.slice(0, 3).map((vacante) => (
                    <div
                      key={vacante.id}
                      className="group p-4 border rounded-lg hover:border-primary hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div 
                          className="space-y-1 flex-1 cursor-pointer"
                          onClick={() => navigate(`/vacante/${vacante.id}`)}
                        >
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-base group-hover:text-primary transition-colors">
                              {vacante.titulo}
                            </p>
                            <Badge variant={vacante.estado === "ABIERTA" ? "default" : "secondary"} className="text-xs">
                              {vacante.estado}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" />
                              {vacante._count?.postulaciones || 0} candidatos
                            </span>
                            <Separator orientation="vertical" className="h-4" />
                            <span>{vacante.modalidad?.nombre || 'Sin modalidad'}</span>
                            <Separator orientation="vertical" className="h-4" />
                            <span className="font-medium text-foreground">
                              {formatearSalario(vacante.salario_minimo, vacante.salario_maximo)}
                            </span>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/vacante/${vacante.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditarVacante(vacante.id)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {vacante.estado !== 'ABIERTA' && (
                              <DropdownMenuItem onClick={() => handleCambiarEstado(vacante.id, 'ABIERTA')}>
                                Abrir vacante
                              </DropdownMenuItem>
                            )}
                            {vacante.estado !== 'PAUSADA' && (
                              <DropdownMenuItem onClick={() => handleCambiarEstado(vacante.id, 'PAUSADA')}>
                                Pausar vacante
                              </DropdownMenuItem>
                            )}
                            {vacante.estado !== 'CERRADA' && (
                              <DropdownMenuItem onClick={() => handleCambiarEstado(vacante.id, 'CERRADA')}>
                                Cerrar vacante
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleEliminarVacante(vacante.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatearFecha(vacante.creado_en)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Sidebar con métricas y acciones */}
          <div className="lg:col-span-3 space-y-6">
            {/* Acciones Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Acciones Rápidas</CardTitle>
                <CardDescription className="text-xs">
                  Gestiona tu proceso de reclutamiento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start gap-2" variant="outline" onClick={handleNuevaVacante}>
                  <Plus className="h-4 w-4" />
                  Nueva Vacante
                </Button>
                <Button className="w-full justify-start gap-2" variant="outline">
                  <Users className="h-4 w-4" />
                  Ver Candidatos
                </Button>
                <Button className="w-full justify-start gap-2" variant="outline">
                  <FileText className="h-4 w-4" />
                  Generar Reporte
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}