import { useState, useEffect, useCallback } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { useCurrentUser } from "../utils/auth"
import { EmpresaNavbar } from "@/components/EmpresaNavbar"
import api from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { 
  Mail, 
  Send, 
  Loader2,
  UserPlus,
  Users,
  Shield,
  AlertCircle,
  RefreshCw,
  BarChart3,
  Briefcase,
  MapPin,
  Phone,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { getReclutadores } from "@/services/empresa"
import { getVacantes, type Vacante } from "@/services/vacante"
import { getPostulacionesByEmpresaVacante, type Postulacion } from "@/services/postulacion"

interface Reclutador {
  id: string
  usuario: {
    id: string
    name: string
    lastname: string
    correo: string
  }
  posicion?: string
  activo: boolean
  _count?: {
    vacantes: number
  }
}

export default function AdminEmpresa() {
  const { isAuthenticated, isReclutador, isEmpresaAdmin, empresaId } = useCurrentUser()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [email, setEmail] = useState("")
  const [reclutadores, setReclutadores] = useState<Reclutador[]>([])
  const [activeTab, setActiveTab] = useState("invitar")

  // Postulaciones state
  const [vacantes, setVacantes] = useState<Vacante[]>([])
  const [selectedVacante, setSelectedVacante] = useState<string | null>(null)
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([])
  const [loadingPostulaciones, setLoadingPostulaciones] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalPostulaciones, setTotalPostulaciones] = useState(0)

  useEffect(() => {
    if (empresaId) {
      loadData()
    }
  }, [empresaId])

  useEffect(() => {
    if (selectedVacante) {
      loadPostulaciones(selectedVacante, 1)
    }
  }, [selectedVacante])

  useEffect(() => {
    if (selectedVacante) {
      loadPostulaciones(selectedVacante, currentPage)
    }
  }, [currentPage])

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!isReclutador) {
    return <Navigate to="/dashboard-candidato" replace />
  }

  if (!isEmpresaAdmin) {
    return <Navigate to="/dashboard-empresa" replace />
  }

  const loadData = async () => {
    if (!empresaId) return
    try {
      setRefreshing(true)
      const [reclutadoresData, vacantesData] = await Promise.all([
        getReclutadores(empresaId),
        getVacantes({ empresaId })
      ])
      const transformados: Reclutador[] = reclutadoresData.map((rec: any) => ({
        id: rec.id,
        usuario: {
          id: rec.usuario?.id || rec.usuarioId,
          name: rec.usuario.name,
          lastname: rec.usuario.lastname,
          correo: rec.usuario.correo,
        },
        posicion: rec.posicion || "Reclutador",
        activo: rec.activo ?? true,
        _count: rec._count
      }))
      setReclutadores(transformados)
      const vacs = Array.isArray(vacantesData) ? vacantesData : (vacantesData.data || [])
      setVacantes(vacs)
      if (vacs.length > 0 && !selectedVacante) {
        setSelectedVacante(vacs[0].id)
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error("Error al cargar los datos")
    } finally {
      setRefreshing(false)
    }
  }

  const loadPostulaciones = async (vacanteId: string, page: number) => {
    try {
      setLoadingPostulaciones(true)
      const res = await getPostulacionesByEmpresaVacante(vacanteId, page, 10)
      setPostulaciones(res.data)
      setTotalPages(res.pagination.totalPages)
      setTotalPostulaciones(res.pagination.total)
    } catch (error) {
      console.error('Error al cargar postulaciones:', error)
      toast.error("Error al cargar las postulaciones")
    } finally {
      setLoadingPostulaciones(false)
    }
  }

  const handleInvitar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !email.includes("@")) {
      toast.error("Ingresa un correo válido")
      return
    }
    if (!empresaId) {
      toast.error("No se pudo identificar la empresa")
      return
    }
    try {
      setLoading(true)
      await api.post('/auth/invitar/reclutador', { email, empresaId })
      toast.success(`Invitación enviada a ${email}`)
      setEmail("")
      loadData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al enviar la invitación")
    } finally {
      setLoading(false)
    }
  }

  const formatearFecha = useCallback((fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
  }, [])

  const obtenerIniciales = useCallback((postulacion: Postulacion) => {
    const { name, lastname } = postulacion.candidato?.usuario || {}
    return `${name?.[0]?.toUpperCase() || ''}${lastname?.[0]?.toUpperCase() || ''}` || '??'
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <EmpresaNavbar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight">Panel de Administración</h1>
              </div>
              <p className="text-muted-foreground text-lg">
                Invita a tu equipo, revisa métricas y visualiza postulaciones
              </p>
            </div>
            <Button onClick={loadData} variant="outline" size="sm" disabled={refreshing} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>

          {/* Stats rápidas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{reclutadores.length}</p>
                    <p className="text-sm text-muted-foreground">Reclutadores</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{vacantes.length}</p>
                    <p className="text-sm text-muted-foreground">Vacantes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate(`/empresa/${empresaId}/analytics`)}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Analytics</p>
                    <p className="text-xs text-muted-foreground">Ver métricas completas →</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-lg grid-cols-3">
              <TabsTrigger value="invitar" className="gap-2">
                <UserPlus className="h-4 w-4" />
                Invitar
              </TabsTrigger>
              <TabsTrigger value="equipo" className="gap-2">
                <Users className="h-4 w-4" />
                Equipo
              </TabsTrigger>
              <TabsTrigger value="postulaciones" className="gap-2">
                <Briefcase className="h-4 w-4" />
                Postulaciones
              </TabsTrigger>
            </TabsList>

            {/* Tab: Invitar */}
            <TabsContent value="invitar" className="space-y-6">
              <Card className="border-2">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary rounded-lg">
                      <Mail className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <CardTitle>Invitar Nuevo Reclutador</CardTitle>
                      <CardDescription>
                        Envía una invitación por correo electrónico para expandir tu equipo
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleInvitar} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-base">Correo Electrónico del Reclutador</Label>
                      <div className="flex gap-3">
                        <div className="flex-1 relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="ejemplo@empresa.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            className="h-11 pl-10"
                          />
                        </div>
                        <Button type="submit" disabled={loading} size="lg" className="gap-2 px-8">
                          {loading ? (
                            <><Loader2 className="h-4 w-4 animate-spin" />Enviando...</>
                          ) : (
                            <><Send className="h-4 w-4" />Enviar Invitación</>
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-900 dark:text-blue-100">
                        <p className="font-medium mb-1">Información importante:</p>
                        <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                          <li>• El reclutador recibirá un enlace único de registro</li>
                          <li>• La invitación expira automáticamente en 7 días</li>
                        </ul>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Equipo */}
            <TabsContent value="equipo" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Equipo de Reclutamiento</CardTitle>
                      <CardDescription>{reclutadores.length} reclutadores registrados</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {refreshing ? (
                    <div className="space-y-3">
                      {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
                    </div>
                  ) : reclutadores.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p>No hay reclutadores registrados. Invita a tu equipo.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {reclutadores.map((rec) => (
                        <div key={rec.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                          <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-semibold text-primary">
                              {rec.usuario.name[0]}{rec.usuario.lastname[0]}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium">{rec.usuario.name} {rec.usuario.lastname}</p>
                            <p className="text-sm text-muted-foreground truncate">{rec.usuario.correo}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            {rec.posicion && <Badge variant="secondary">{rec.posicion}</Badge>}
                            <Badge variant="outline">
                              <Briefcase className="h-3 w-3 mr-1" />
                              {rec._count?.vacantes || 0}
                            </Badge>
                            <span className={`text-xs font-medium ${rec.activo ? 'text-green-600' : 'text-muted-foreground'}`}>
                              {rec.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Postulaciones */}
            <TabsContent value="postulaciones" className="space-y-6">
              {vacantes.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12 text-muted-foreground">
                    No hay vacantes publicadas aún.
                  </CardContent>
                </Card>
              ) : (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Seleccionar Vacante</CardTitle>
                      <CardDescription>Elige una vacante para ver sus postulaciones</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {vacantes.map((v) => (
                          <Button
                            key={v.id}
                            variant={selectedVacante === v.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => { setSelectedVacante(v.id); setCurrentPage(1) }}
                            className="gap-2"
                          >
                            {v.titulo}
                            <Badge variant={selectedVacante === v.id ? "secondary" : "outline"} className="ml-1">
                              {v._count?.postulaciones || 0}
                            </Badge>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>
                        Postulaciones ({loadingPostulaciones ? '...' : totalPostulaciones})
                      </CardTitle>
                      <CardDescription>
                        {vacantes.find(v => v.id === selectedVacante)?.titulo || ''}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loadingPostulaciones ? (
                        <div className="space-y-4">
                          {[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}
                        </div>
                      ) : postulaciones.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No hay postulaciones para esta vacante aún.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {postulaciones.map((postulacion) => (
                            <Card key={postulacion.id} className="hover:shadow-md transition-shadow">
                              <CardContent className="pt-4">
                                <div className="flex flex-col sm:flex-row items-start gap-4">
                                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-semibold text-lg flex-shrink-0">
                                    {obtenerIniciales(postulacion)}
                                  </div>
                                  <div className="flex-1 space-y-2 w-full">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                      <div>
                                        <h3 className="font-semibold text-base">
                                          {postulacion.candidato?.usuario.name} {postulacion.candidato?.usuario.lastname}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                          {postulacion.candidato?.titulo || 'Sin título profesional'}
                                        </p>
                                      </div>
                                      {postulacion.puntuacion_compatibilidad && (
                                        <Badge variant="outline" className="text-base px-3 py-1 self-start">
                                          {Math.round(postulacion.puntuacion_compatibilidad * 100)}% match
                                        </Badge>
                                      )}
                                    </div>
                                    <Separator />
                                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                                      {postulacion.candidato?.usuario.correo && (
                                        <div className="flex items-center gap-1">
                                          <Mail className="h-3.5 w-3.5" />
                                          <span>{postulacion.candidato.usuario.correo}</span>
                                        </div>
                                      )}
                                      {postulacion.candidato?.usuario.telefono && (
                                        <div className="flex items-center gap-1">
                                          <Phone className="h-3.5 w-3.5" />
                                          <span>{postulacion.candidato.usuario.telefono}</span>
                                        </div>
                                      )}
                                      {postulacion.candidato?.ubicacion && (
                                        <div className="flex items-center gap-1">
                                          <MapPin className="h-3.5 w-3.5" />
                                          <span>{postulacion.candidato.ubicacion}</span>
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-muted-foreground">
                                        Postulado el {formatearFecha(postulacion.creado_en)}
                                      </span>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => navigate(`/perfil-candidato/${postulacion.candidato?.id}`)}
                                      >
                                        Ver perfil
                                      </Button>
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
                            variant="outline" size="sm"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="gap-1"
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Anterior
                          </Button>
                          <span className="text-sm text-muted-foreground">
                            Página {currentPage} de {totalPages}
                          </span>
                          <Button
                            variant="outline" size="sm"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="gap-1"
                          >
                            Siguiente
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
