import { useCurrentUser } from "../utils/auth"
import { Navigate, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EmpresaNavbar } from "@/components/EmpresaNavbar"
import { 
  Briefcase, 
  Users, 
  Eye,
  Plus,
  FileText,
  Edit,
  MoreVertical,
  Trash2,
  TrendingUp
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

export default function DashboardReclutador() {
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

  const stats = useMemo(() => ({
    vacantesActivas: vacantes.filter(v => v.estado === 'ABIERTA').length,
    totalVacantes: vacantes.length,
    candidatosTotal: vacantes.reduce((acc, v) => acc + (v._count?.postulaciones || 0), 0),
  }), [vacantes])

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

  const formatearSalario = useCallback((min?: number, max?: number) => {
    if (!min && !max) return 'A convenir'
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`
    if (min) return `Desde $${min.toLocaleString()}`
    return `Hasta $${max?.toLocaleString()}`
  }, [])

  const handleNuevaVacante = () => {
    navigate('/vacante/crear')
  }

  const handleEditarVacante = (vacanteId: string) => {
    navigate(`/vacante/editar/${vacanteId}`)
  }

  const handleVerVacante = (vacanteId: string) => {
    navigate(`/vacante/${vacanteId}`)
  }

  const handleEliminarVacante = async (vacanteId: string) => {
    if (!window.confirm('¿Estás seguro de eliminar esta vacante?')) return
    
    try {
      await deleteVacante(vacanteId)
      setVacantes(vacantes.filter(v => v.id !== vacanteId))
      toast.success('Vacante eliminada exitosamente')
    } catch (error) {
      console.error('Error al eliminar vacante:', error)
      toast.error('Error al eliminar la vacante')
    }
  }

  const handleCambiarEstado = async (vacanteId: string, nuevoEstado: string) => {
    try {
      await updateEstadoVacante(vacanteId, nuevoEstado)
      setVacantes(vacantes.map(v => 
        v.id === vacanteId ? { ...v, estado: nuevoEstado as 'ABIERTA' | 'CERRADA' | 'PAUSADA' } : v
      ))
      toast.success(`Vacante ${nuevoEstado.toLowerCase()} exitosamente`)
    } catch (error) {
      console.error('Error al cambiar estado:', error)
      toast.error('Error al cambiar el estado de la vacante')
    }
  }

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      ABIERTA: { variant: "default", label: "Abierta" },
      CERRADA: { variant: "destructive", label: "Cerrada" },
      PAUSADA: { variant: "secondary", label: "Pausada" }
    }
    const config = variants[estado] || variants.ABIERTA
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <div className="min-h-screen bg-background">
      <EmpresaNavbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Dashboard de Reclutamiento</h1>
              <p className="text-muted-foreground mt-2">
                Gestiona tus vacantes y postulaciones
              </p>
            </div>
            <Button onClick={handleNuevaVacante} size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Nueva Vacante
            </Button>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Vacantes Activas
                </CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.vacantesActivas}</div>
                <p className="text-xs text-muted-foreground">
                  De {stats.totalVacantes} totales
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Postulaciones
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.candidatosTotal}</div>
                <p className="text-xs text-muted-foreground">
                  Candidatos interesados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Promedio por Vacante
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalVacantes > 0 
                    ? Math.round(stats.candidatosTotal / stats.totalVacantes) 
                    : 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Postulaciones promedio
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Vacantes */}
          <Card>
            <CardHeader>
              <CardTitle>Vacantes Publicadas</CardTitle>
              <CardDescription>
                Gestiona y revisa tus ofertas de empleo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : vacantes.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay vacantes</h3>
                  <p className="text-muted-foreground mb-6">
                    Comienza creando tu primera oferta de empleo
                  </p>
                  <Button onClick={handleNuevaVacante}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primera Vacante
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {vacantes.map((vacante) => (
                    <div 
                      key={vacante.id} 
                      className="border rounded-lg p-6 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-xl font-semibold mb-1">
                                {vacante.titulo}
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {vacante.descripcion}
                              </p>
                            </div>
                            {getEstadoBadge(vacante.estado)}
                          </div>

                          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Briefcase className="h-4 w-4" />
                              {formatearSalario(vacante.salario_minimo, vacante.salario_maximo)}
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              {vacante._count?.postulaciones || 0} postulaciones
                            </div>
                            <div>
                              {formatearFecha(vacante.creado_en)}
                            </div>
                          </div>

                          <Separator />

                          <div className="flex items-center gap-2">
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => handleVerVacante(vacante.id)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Candidatos
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditarVacante(vacante.id)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </Button>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {vacante.estado === 'ABIERTA' && (
                                  <DropdownMenuItem 
                                    onClick={() => handleCambiarEstado(vacante.id, 'PAUSADA')}
                                  >
                                    Pausar vacante
                                  </DropdownMenuItem>
                                )}
                                {vacante.estado === 'PAUSADA' && (
                                  <DropdownMenuItem 
                                    onClick={() => handleCambiarEstado(vacante.id, 'ABIERTA')}
                                  >
                                    Reactivar vacante
                                  </DropdownMenuItem>
                                )}
                                {vacante.estado !== 'CERRADA' && (
                                  <DropdownMenuItem 
                                    onClick={() => handleCambiarEstado(vacante.id, 'CERRADA')}
                                  >
                                    Cerrar vacante
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleEliminarVacante(vacante.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
