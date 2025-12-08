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
  RefreshCw,
  Building2,
  Edit,
  Save,
  Briefcase
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { Textarea } from "@/components/ui/textarea"
import { updateReclutador, updateEmpresaInfo, getEmpresaById } from "@/services/empresa"

interface Empresa {
  id: string
  name: string
  area: string
  descripcion: string | null
}

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
    id: string
    name: string
    lastname: string
    correo: string
  }
  posicion?: string
  fechaRegistro: string
  _count?: {
    vacantes: number
  }
}

export default function AdminEmpresa() {
  const { isAuthenticated, isReclutador, isEmpresaAdmin, empresaId } = useCurrentUser()
  
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [email, setEmail] = useState("")
  const [invitaciones, setInvitaciones] = useState<Invitacion[]>([])
  const [reclutadores, setReclutadores] = useState<Reclutador[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedInvitacion, setSelectedInvitacion] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [empresa, setEmpresa] = useState<Empresa | null>(null)
  const [editingEmpresa, setEditingEmpresa] = useState(false)
  const [editingReclutador, setEditingReclutador] = useState<Reclutador | null>(null)
  const [empresaForm, setEmpresaForm] = useState({
    name: "",
    area: "",
    descripcion: ""
  })
  const [reclutadorForm, setReclutadorForm] = useState({
    name: "",
    lastname: "",
    correo: "",
    posicion: ""
  })

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
      
      // Cargar información de la empresa
      const empresaData = await getEmpresaById(empresaId)
      setEmpresa(empresaData)
      setEmpresaForm({
        name: empresaData.name || "",
        area: empresaData.area || "",
        descripcion: empresaData.descripcion || ""
      })
      
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
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="overview" className="gap-2">
                <UserPlus className="h-4 w-4" />
                Invitar
              </TabsTrigger>
              <TabsTrigger value="empresa" className="gap-2">
                <Building2 className="h-4 w-4" />
                Empresa
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

            {/* Tab: Configuración de Empresa */}
            <TabsContent value="empresa" className="space-y-6">
              <Card className="border-2">
                <CardHeader className="bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary rounded-lg">
                        <Building2 className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <CardTitle>Información de la Empresa</CardTitle>
                        <CardDescription>
                          Gestiona los datos generales de tu organización
                        </CardDescription>
                      </div>
                    </div>
                    {!editingEmpresa && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setEditingEmpresa(true)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {loading ? (
                    <div className="space-y-4">
                      <div className="animate-pulse space-y-4">
                        <div className="h-10 bg-muted rounded" />
                        <div className="h-10 bg-muted rounded" />
                        <div className="h-20 bg-muted rounded" />
                      </div>
                    </div>
                  ) : editingEmpresa ? (
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="empresa-name">Nombre de la Empresa</Label>
                          <Input
                            id="empresa-name"
                            value={empresaForm.name}
                            onChange={(e) => setEmpresaForm({ ...empresaForm, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="empresa-area">Área/Industria</Label>
                          <Input
                            id="empresa-area"
                            value={empresaForm.area}
                            onChange={(e) => setEmpresaForm({ ...empresaForm, area: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="empresa-descripcion">Descripción</Label>
                        <Textarea
                          id="empresa-descripcion"
                          rows={4}
                          value={empresaForm.descripcion}
                          onChange={(e) => setEmpresaForm({ ...empresaForm, descripcion: e.target.value })}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={async () => {
                          if (!empresaId) return
                          try {
                            setSaving(true)
                            await updateEmpresaInfo(empresaId, empresaForm)
                            toast.success("Información de la empresa actualizada")
                            setEditingEmpresa(false)
                            await loadData()
                          } catch (error: any) {
                            console.error("Error al actualizar empresa:", error)
                            toast.error(error.response?.data?.message || "Error al actualizar la empresa")
                          } finally {
                            setSaving(false)
                          }
                        }} disabled={saving}>
                          {saving ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Guardando...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Guardar Cambios
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setEditingEmpresa(false)}
                          disabled={saving}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Nombre</p>
                          <p className="font-medium">{empresa?.name || "No especificado"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Área/Industria</p>
                          <p className="font-medium">{empresa?.area || "No especificado"}</p>
                        </div>
                      </div>
                      {empresa?.descripcion && (
                        <div>
                          <p className="text-sm text-muted-foreground">Descripción</p>
                          <p className="font-medium">{empresa.descripcion}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Lista de Reclutadores con edición */}
              <Card>
                <CardHeader className="bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <CardTitle>Gestión de Reclutadores</CardTitle>
                      <CardDescription>
                        {loading ? (
                          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                        ) : (
                          `${reclutadores.length} reclutadores en tu equipo`
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {loading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                      ))}
                    </div>
                  ) : reclutadores.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No hay reclutadores registrados
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Correo</TableHead>
                            <TableHead>Posición</TableHead>
                            <TableHead className="text-center">Vacantes</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {reclutadores.map((reclutador) => (
                            <TableRow key={reclutador.id}>
                              <TableCell className="font-medium">
                                {reclutador.usuario.name} {reclutador.usuario.lastname}
                              </TableCell>
                              <TableCell>{reclutador.usuario.correo}</TableCell>
                              <TableCell>
                                {reclutador.posicion ? (
                                  <Badge variant="secondary">{reclutador.posicion}</Badge>
                                ) : (
                                  <span className="text-muted-foreground text-sm">Sin posición</span>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="outline">
                                  <Briefcase className="h-3 w-3 mr-1" />
                                  {reclutador._count?.vacantes || 0}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingReclutador(reclutador)
                                    setReclutadorForm({
                                      name: reclutador.usuario.name,
                                      lastname: reclutador.usuario.lastname,
                                      correo: reclutador.usuario.correo,
                                      posicion: reclutador.posicion || ""
                                    })
                                  }}
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Editar
                                </Button>
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

      {/* Dialog para editar reclutador */}
      <Dialog open={!!editingReclutador} onOpenChange={() => setEditingReclutador(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Reclutador</DialogTitle>
            <DialogDescription>
              Actualiza la información del reclutador
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={reclutadorForm.name}
                  onChange={(e) => setReclutadorForm({ ...reclutadorForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastname">Apellido</Label>
                <Input
                  id="lastname"
                  value={reclutadorForm.lastname}
                  onChange={(e) => setReclutadorForm({ ...reclutadorForm, lastname: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="correo">Correo</Label>
              <Input
                id="correo"
                type="email"
                value={reclutadorForm.correo}
                onChange={(e) => setReclutadorForm({ ...reclutadorForm, correo: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="posicion">Posición</Label>
              <Input
                id="posicion"
                placeholder="Ej: Senior Recruiter"
                value={reclutadorForm.posicion}
                onChange={(e) => setReclutadorForm({ ...reclutadorForm, posicion: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingReclutador(null)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={async () => {
              if (!editingReclutador) return
              try {
                setSaving(true)
                await updateReclutador(editingReclutador.id, reclutadorForm)
                toast.success("Reclutador actualizado correctamente")
                setEditingReclutador(null)
                await loadData()
              } catch (error: any) {
                console.error("Error al actualizar reclutador:", error)
                toast.error(error.response?.data?.message || "Error al actualizar el reclutador")
              } finally {
                setSaving(false)
              }
            }} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
