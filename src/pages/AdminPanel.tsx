import { useState, useEffect } from "react"
import { Navigate } from "react-router-dom"
import { useCurrentUser } from "../utils/auth"
import { EmpresaNavbar } from "@/components/EmpresaNavbar"
import api from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { 
  Mail, 
  Send, 
  Loader2,
  UserPlus,
  Users,
  CheckCircle2,
  Clock,
  X,
  Shield,
  TrendingUp,
  Calendar,
  UserCheck,
  AlertCircle,
  Search,
  Filter,
  Download,
  RefreshCw
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Invitacion {
  id: string
  email: string
  estado: "PENDIENTE" | "ACEPTADA" | "EXPIRADA"
  fechaEnvio: string
  fechaExpiracion: string
}

interface Reclutador {
  id: string
  usuario: {
    name: string
    lastname: string
    correo: string
  }
  posicion?: string
  fechaRegistro: string
}

export default function AdminPanel() {
  const { isAuthenticated, isReclutador, isEmpresaAdmin, empresaId } = useCurrentUser()
  
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [email, setEmail] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEstado, setFilterEstado] = useState<string>("all")
  const [invitaciones, setInvitaciones] = useState<Invitacion[]>([])
  const [reclutadores, setReclutadores] = useState<Reclutador[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedInvitacion, setSelectedInvitacion] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!isReclutador) {
    return <Navigate to="/dashboard-candidato" replace />
  }

  if (!isEmpresaAdmin) {
    return <Navigate to="/dashboard-empresa" replace />
  }

  useEffect(() => {
    if (empresaId) {
      loadData()
    }
  }, [empresaId])

  const loadData = async () => {
    if (!empresaId) return
    
    try {
      setRefreshing(true)
      
      // Llamada al endpoint del dashboard de empresa
      const { data } = await api.get(`/empresas/${empresaId}/dashboard`)
      
      // Transformar los datos del backend al formato del frontend
      const reclutadoresTransformados: Reclutador[] = data.reclutadores.map((rec: any) => ({
        id: rec.id,
        usuario: {
          name: rec.usuario.name,
          lastname: rec.usuario.lastname,
          correo: rec.usuario.correo,
        },
        posicion: rec.posicion || "Reclutador",
        fechaRegistro: rec.usuario.creado_en,
      }))

      setReclutadores(reclutadoresTransformados)
      
      // Las invitaciones pendientes por ahora solo tenemos el contador
      // Crear mock data basado en el contador de invitaciones pendientes
      const numInvitaciones = data.estadisticas.invitacionesPendientes || 0
      const mockInvitaciones: Invitacion[] = []
      
      // Si hay invitaciones pendientes, crear entradas mock
      for (let i = 0; i < numInvitaciones; i++) {
        mockInvitaciones.push({
          id: `pending-${i}`,
          email: `invitacion-${i + 1}@pendiente.com`,
          estado: "PENDIENTE",
          fechaEnvio: new Date().toISOString(),
          fechaExpiracion: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
        })
      }
      
      setInvitaciones(mockInvitaciones)
      
    } catch (error) {
      console.error('Error:', error)
      toast.error("Error al cargar los datos")
    } finally {
      setRefreshing(false)
    }
  }

  const handleInvitar = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      toast.error("Ingresa un correo electrónico")
      return
    }

    if (!email.includes("@")) {
      toast.error("Ingresa un correo válido")
      return
    }

    if (!empresaId) {
      toast.error("No se pudo identificar la empresa")
      return
    }

    try {
      setLoading(true)
      
      // Llamada al endpoint POST /auth/invitar/reclutador
      await api.post('/auth/invitar/reclutador', {
        email: email,
        empresaId: empresaId,
      })
      
      toast.success(`Invitación enviada a ${email}`)
      setEmail("")
      loadData()
    } catch (error: any) {
      toast.error(error.message || "Error al enviar la invitación")
    } finally {
      setLoading(false)
    }
  }

  const handleCancelarInvitacion = async () => {
    if (!selectedInvitacion) return

    try {
      setLoading(true)
      
      // Aquí iría la llamada al backend
      // await cancelarInvitacion(selectedInvitacion)
      
      toast.success("Invitación cancelada")
      setDeleteDialogOpen(false)
      setSelectedInvitacion(null)
      loadData()
    } catch (error) {
      toast.error("Error al cancelar la invitación")
    } finally {
      setLoading(false)
    }
  }

  const getEstadoBadge = (estado: string) => {
    const variants = {
      PENDIENTE: { 
        variant: "outline" as const, 
        icon: Clock, 
        text: "Pendiente",
        className: "border-yellow-500 text-yellow-700 dark:text-yellow-400"
      },
      ACEPTADA: { 
        variant: "outline" as const, 
        icon: CheckCircle2, 
        text: "Aceptada",
        className: "border-green-500 text-green-700 dark:text-green-400"
      },
      EXPIRADA: { 
        variant: "outline" as const, 
        icon: X, 
        text: "Expirada",
        className: "border-red-500 text-red-700 dark:text-red-400"
      }
    }
    const config = variants[estado as keyof typeof variants] || variants.PENDIENTE
    const Icon = config.icon
    return (
      <Badge variant={config.variant} className={`gap-1.5 ${config.className}`}>
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    )
  }

  const filteredInvitaciones = invitaciones.filter(inv => {
    const matchesSearch = inv.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterEstado === "all" || inv.estado === filterEstado
    return matchesSearch && matchesFilter
  })

  const filteredReclutadores = reclutadores.filter(rec => {
    const fullName = `${rec.usuario.name} ${rec.usuario.lastname}`.toLowerCase()
    const email = rec.usuario.correo.toLowerCase()
    const search = searchTerm.toLowerCase()
    return fullName.includes(search) || email.includes(search)
  })

  const stats = {
    totalReclutadores: reclutadores.length,
    pendientes: invitaciones.filter(i => i.estado === "PENDIENTE").length,
    aceptadas: invitaciones.filter(i => i.estado === "ACEPTADA").length,
    thisMonth: reclutadores.filter(r => {
      const registroDate = new Date(r.fechaRegistro)
      const now = new Date()
      return registroDate.getMonth() === now.getMonth() && 
             registroDate.getFullYear() === now.getFullYear()
    }).length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <EmpresaNavbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header con Estadísticas Destacadas */}
          <div className="flex flex-col gap-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h1 className="text-4xl font-bold tracking-tight">Panel de Administración</h1>
                </div>
                <p className="text-muted-foreground text-lg">
                  Gestiona y supervisa tu equipo de reclutamiento
                </p>
              </div>
              <Button
                onClick={loadData}
                variant="outline"
                size="sm"
                disabled={refreshing}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
            </div>

            {/* Cards de Estadísticas Mejoradas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-l-4 border-l-primary bg-gradient-to-br from-primary/5 to-transparent">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Reclutadores
                  </CardTitle>
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalReclutadores}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <p className="text-xs text-muted-foreground">
                      {stats.thisMonth} nuevos este mes
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-yellow-500 bg-gradient-to-br from-yellow-500/5 to-transparent">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Invitaciones Pendientes
                  </CardTitle>
                  <div className="p-2 bg-yellow-500/10 rounded-full">
                    <Clock className="h-4 w-4 text-yellow-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.pendientes}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Esperando aceptación
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-green-500/5 to-transparent">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Invitaciones Aceptadas
                  </CardTitle>
                  <div className="p-2 bg-green-500/10 rounded-full">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.aceptadas}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Últimos 30 días
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-500/5 to-transparent">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Tasa de Aceptación
                  </CardTitle>
                  <div className="p-2 bg-blue-500/10 rounded-full">
                    <UserCheck className="h-4 w-4 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {invitaciones.length > 0 
                      ? Math.round((stats.aceptadas / invitaciones.length) * 100)
                      : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    De todas las invitaciones
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Tabs para diferentes secciones */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="overview" className="gap-2">
                <UserPlus className="h-4 w-4" />
                Invitar
              </TabsTrigger>
              <TabsTrigger value="invitations" className="gap-2">
                <Mail className="h-4 w-4" />
                Invitaciones
              </TabsTrigger>
              <TabsTrigger value="team" className="gap-2">
                <Users className="h-4 w-4" />
                Equipo
              </TabsTrigger>
            </TabsList>

            {/* Tab: Invitar Nuevo Reclutador */}
            <TabsContent value="overview" className="space-y-6">
              <Card className="border-2">
                <CardHeader className="bg-muted/50">
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
                      <Label htmlFor="email" className="text-base">
                        Correo Electrónico del Reclutador
                      </Label>
                      <div className="flex gap-3">
                        <div className="flex-1 relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                        <Button 
                          type="submit" 
                          disabled={loading}
                          size="lg"
                          className="gap-2 px-8"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Enviando...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4" />
                              Enviar Invitación
                            </>
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
                          <li>• Podrás gestionar todas las invitaciones desde este panel</li>
                        </ul>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Resumen Rápido */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      Invitaciones Recientes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {invitaciones.slice(0, 3).length === 0 ? (
                      <p className="text-sm text-muted-foreground">No hay invitaciones recientes</p>
                    ) : (
                      <div className="space-y-3">
                        {invitaciones.slice(0, 3).map((inv) => (
                          <div key={inv.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{inv.email}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(inv.fechaEnvio).toLocaleDateString('es-ES')}
                              </p>
                            </div>
                            {getEstadoBadge(inv.estado)}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Equipo Activo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {reclutadores.slice(0, 3).length === 0 ? (
                      <p className="text-sm text-muted-foreground">No hay reclutadores registrados</p>
                    ) : (
                      <div className="space-y-3">
                        {reclutadores.slice(0, 3).map((rec) => (
                          <div key={rec.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-semibold text-primary">
                                {rec.usuario.name[0]}{rec.usuario.lastname[0]}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {rec.usuario.name} {rec.usuario.lastname}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {rec.posicion || "Reclutador"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tab: Invitaciones */}
            <TabsContent value="invitations" className="space-y-4">
              <Card>
                <CardHeader className="bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Gestión de Invitaciones
                      </CardTitle>
                      <CardDescription>
                        Todas las invitaciones enviadas y su estado actual
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {/* Barra de búsqueda y filtros */}
                  <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por correo electrónico..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Select value={filterEstado} onValueChange={setFilterEstado}>
                        <SelectTrigger className="w-[180px]">
                          <Filter className="h-4 w-4 mr-2" />
                          <SelectValue placeholder="Filtrar estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los estados</SelectItem>
                          <SelectItem value="PENDIENTE">Pendientes</SelectItem>
                          <SelectItem value="ACEPTADA">Aceptadas</SelectItem>
                          <SelectItem value="EXPIRADA">Expiradas</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Tabla de invitaciones */}
                  {filteredInvitaciones.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                      <Mail className="h-16 w-16 mx-auto mb-4 opacity-20" />
                      <p className="text-lg font-medium">No se encontraron invitaciones</p>
                      <p className="text-sm mt-1">
                        {searchTerm || filterEstado !== "all" 
                          ? "Intenta ajustar los filtros de búsqueda"
                          : "Envía tu primera invitación para comenzar"}
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-lg border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="font-semibold">Correo Electrónico</TableHead>
                            <TableHead className="font-semibold">Estado</TableHead>
                            <TableHead className="font-semibold">Fecha de Envío</TableHead>
                            <TableHead className="font-semibold">Fecha de Expiración</TableHead>
                            <TableHead className="text-right font-semibold">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredInvitaciones.map((inv, index) => (
                            <TableRow key={inv.id} className={index % 2 === 0 ? "bg-muted/20" : ""}>
                              <TableCell className="font-medium">{inv.email}</TableCell>
                              <TableCell>{getEstadoBadge(inv.estado)}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  {new Date(inv.fechaEnvio).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  {new Date(inv.fechaExpiracion).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                {inv.estado === "PENDIENTE" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedInvitacion(inv.id)
                                      setDeleteDialogOpen(true)
                                    }}
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Cancelar
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Equipo */}
            <TabsContent value="team" className="space-y-4">
              <Card>
                <CardHeader className="bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Equipo de Reclutamiento
                      </CardTitle>
                      <CardDescription>
                        Reclutadores activos en tu organización
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {/* Barra de búsqueda */}
                  <div className="flex gap-3 mb-6">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por nombre o correo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button variant="outline" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Tabla de reclutadores */}
                  {filteredReclutadores.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                      <Users className="h-16 w-16 mx-auto mb-4 opacity-20" />
                      <p className="text-lg font-medium">No se encontraron reclutadores</p>
                      <p className="text-sm mt-1">
                        {searchTerm 
                          ? "Intenta con otro término de búsqueda"
                          : "Invita a tu primer reclutador para comenzar"}
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-lg border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="font-semibold">Reclutador</TableHead>
                            <TableHead className="font-semibold">Correo Electrónico</TableHead>
                            <TableHead className="font-semibold">Posición</TableHead>
                            <TableHead className="font-semibold">Fecha de Registro</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredReclutadores.map((rec, index) => (
                            <TableRow key={rec.id} className={index % 2 === 0 ? "bg-muted/20" : ""}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <span className="text-sm font-semibold text-primary">
                                      {rec.usuario.name[0]}{rec.usuario.lastname[0]}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="font-medium">
                                      {rec.usuario.name} {rec.usuario.lastname}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{rec.usuario.correo}</TableCell>
                              <TableCell>
                                <Badge variant="secondary">
                                  {rec.posicion || "Reclutador"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  {new Date(rec.fechaRegistro).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Cancelar Invitación Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              ¿Cancelar invitación?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción cancelará la invitación pendiente y el enlace de registro dejará de funcionar.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Volver</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelarInvitacion}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Cancelando...
                </>
              ) : (
                "Cancelar Invitación"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
