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
  BarChart3
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useState, useEffect, useCallback } from "react"
import { getVacantes, type Vacante } from "@/services/vacante"
import { toast } from "sonner"
import api from "@/lib/axios"

export default function DashboardEmpresa() {
  const { isAuthenticated, isReclutador, isEmpresaAdmin, empresaId } = useCurrentUser()
  const navigate = useNavigate()
  const [vacantes, setVacantes] = useState<Vacante[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    vacantesActivas: 0,
    candidatosTotal: 0,
    totalReclutadores: 0
  })

  // Cargar vacantes de la empresa y estadísticas
  useEffect(() => {
    const fetchData = async () => {
      if (!empresaId) return
      
      try {
        setIsLoading(true)
        
        // Cargar vacantes
        const data = await getVacantes({ empresaId })
        const vacantesData = Array.isArray(data) ? data : data.data || []
        setVacantes(vacantesData)
        
        // Cargar postulaciones para calcular total de candidatos
        const { data: response } = await api.get('/postulaciones/empresa/candidatos?limit=9999')
        const postulaciones = response.data || []
        
        // Cargar reclutadores de la empresa
        const { data: dashboardData } = await api.get(`/empresas/${empresaId}/dashboard`)
        const reclutadores = dashboardData?.reclutadores || []
        
        // Calcular estadísticas
        setStats({
          vacantesActivas: vacantesData.filter((v: any) => v.estado === 'ABIERTA').length,
          candidatosTotal: postulaciones.length,
          totalReclutadores: reclutadores.length
        })
      } catch (error) {
        console.error('Error al cargar datos:', error)
        toast.error('Error al cargar los datos')
        setVacantes([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [empresaId])

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

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!isReclutador) {
    return <Navigate to="/dashboard-candidato" replace />
  }

  if (!isEmpresaAdmin) {
    return <Navigate to="/dashboard-reclutador" replace />
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
              Monitorea el estado de las vacantes y el equipo de reclutamiento
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => navigate(`/empresa/${empresaId}/analytics`)}>
              <BarChart3 className="h-4 w-4" />
              Analytics
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
                Total Reclutadores
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stats.totalReclutadores}</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div>
          {/* Vacantes Recientes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Vacantes Activas</CardTitle>
                  <CardDescription>
                    Monitorea el progreso de tus ofertas
                  </CardDescription>
                </div>
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
                ) : !Array.isArray(vacantes) || vacantes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay vacantes activas
                  </div>
                ) : (
                  vacantes.map((vacante) => (
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
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => navigate(`/vacante/${vacante.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
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
        </div>
      </main>
    </div>
  )
}