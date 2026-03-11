import { useEffect, useState } from "react"
import { useCurrentUser } from "../utils/auth"
import { Navigate, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { ModeToggle } from "@/components/mode-toggle"
import { 
  Briefcase, 
  GraduationCap, 
  Award, 
  MapPin, 
  Calendar,
  Building2,
  DollarSign,
  Search,
  Lightbulb,
  Plus,
  Trash2,
  Building,
  Loader2,
  User,
  Clock,
  Cloud,
  Database,
  Code,
  ChevronRight,
  ChevronDown,
  LogOut,
  Smartphone
} from "lucide-react"
import { 
  getExperiencias, 
  createExperiencia, 
  deleteExperiencia,
  type CreateExperienciaDto 
} from "@/services/experiencia"
import {
  getEducaciones,
  createEducacion,
  deleteEducacion,
  type CreateEducacionDto
} from "@/services/educacion"
import { getCandidatoProfile } from "@/services/candidato"
import { getMisPostulaciones, type Postulacion } from "@/services/postulacion"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

interface Habilidad {
  id: string
  nivel: number
  habilidad: {
    id: string
    nombre: string
    categoria: {
      id: string
      nombre: string
    }
  }
}

interface Lenguaje {
  id: string
  nivel: number
  lenguaje: {
    id: string
    nombre: string
  }
}

interface Experiencia {
  id: string
  titulo: string
  empresa: string
  ubicacion: string | null
  fecha_comienzo: string
  fecha_final: string | null
  descripcion: string | null
  candidatoId: string
}

interface Educacion {
  id: string
  titulo: string
  institucion: string
  estado: string
  fecha_comienzo: string | null
  fecha_final: string | null
  descripcion: string | null
  candidatoId: string
}

interface CandidatoProfile {
  id: string
  titulo: string
  bio: string
  ubicacion: string
  foto_perfil_url: string | null
  usuario: {
    name: string
    lastname: string
    correo: string
    telefono: string
    fecha_nacimiento: string
  }
  habilidadesCandidato: Habilidad[]
  lenguajesCandidato: Lenguaje[]
  _count: {
    postulaciones: number
  }
}

export default function DashboardCandidato() {
  const { isAuthenticated, isCandidato, logout } = useCurrentUser()
  const [profile, setProfile] = useState<CandidatoProfile | null>(null)
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([])
  const [experiencias, setExperiencias] = useState<Experiencia[]>([])
  const [educaciones, setEducaciones] = useState<Educacion[]>([])
  const [loading, setLoading] = useState(true)
  
  // Estados para formularios
  const [showAddExperiencia, setShowAddExperiencia] = useState(false)
  const [showAddEducacion, setShowAddEducacion] = useState(false)
  const [loadingAction, setLoadingAction] = useState(false)
  const [newExperiencia, setNewExperiencia] = useState<CreateExperienciaDto>({
    titulo: "",
    empresa: "",
    descripcion: "",
    ubicacion: "",
    fecha_comienzo: "",
    fecha_final: null,
  })
  const [newEducacion, setNewEducacion] = useState<CreateEducacionDto>({
    titulo: "",
    institucion: "",
    descripcion: "",
    estado: "EN_CURSO",
    fecha_comienzo: "",
    fecha_final: null,
  })
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({})

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  if (!isCandidato) {
    return <Navigate to="/dashboard-empresa" replace />
  }

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [profileData, postulacionesData, experienciasData, educacionesData] = await Promise.all([
        getCandidatoProfile(),
        getMisPostulaciones(1, 10),
        getExperiencias(),
        getEducaciones()
      ])

      setProfile(profileData)
      setPostulaciones(postulacionesData.data || [])
      setExperiencias(experienciasData)
      setEducaciones(educacionesData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getNivelLabel = (nivel: number) => {
    if (nivel >= 9) return "Experto"
    if (nivel >= 7) return "Avanzado"
    if (nivel >= 5) return "Intermedio"
    if (nivel >= 3) return "Básico"
    return "Principiante"
  }

  const getCompatibilidadColor = (puntuacion: number) => {
    if (puntuacion >= 80) return "text-green-600"
    if (puntuacion >= 60) return "text-blue-600"
    if (puntuacion >= 40) return "text-yellow-600"
    return "text-gray-600"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short'
    })
  }

  // ==================== FUNCIONES EXPERIENCIA ====================
  const handleAddExperiencia = async () => {
    if (!newExperiencia.titulo || !newExperiencia.empresa || !newExperiencia.fecha_comienzo) {
      toast.error("Campos requeridos", {
        description: "Completa título, empresa y fecha de inicio",
      })
      return
    }

    try {
      setLoadingAction(true)
      await createExperiencia(newExperiencia)
      toast.success("Experiencia agregada")
      
      // Recargar experiencias
      const experienciasData = await getExperiencias()
      setExperiencias(experienciasData)
      
      setShowAddExperiencia(false)
      setNewExperiencia({
        titulo: "",
        empresa: "",
        descripcion: "",
        ubicacion: "",
        fecha_comienzo: "",
        fecha_final: null,
      })
    } catch (error) {
      toast.error("No se pudo agregar la experiencia")
    } finally {
      setLoadingAction(false)
    }
  }

  const handleDeleteExperiencia = async (id: string) => {
    try {
      setLoadingAction(true)
      await deleteExperiencia(id)
      toast.success("Experiencia eliminada")
      
      // Recargar experiencias
      const experienciasData = await getExperiencias()
      setExperiencias(experienciasData)
    } catch (error) {
      toast.error("No se pudo eliminar la experiencia")
    } finally {
      setLoadingAction(false)
    }
  }

  // ==================== FUNCIONES EDUCACIÓN ====================
  const handleAddEducacion = async () => {
    if (!newEducacion.titulo || !newEducacion.institucion || !newEducacion.estado) {
      toast.error("Campos requeridos", {
        description: "Completa título, institución y estado",
      })
      return
    }

    try {
      setLoadingAction(true)
      await createEducacion(newEducacion)
      toast.success("Educación agregada")
      
      // Recargar educaciones
      const educacionesData = await getEducaciones()
      setEducaciones(educacionesData)
      
      setShowAddEducacion(false)
      setNewEducacion({
        titulo: "",
        institucion: "",
        descripcion: "",
        estado: "EN_CURSO",
        fecha_comienzo: "",
        fecha_final: null,
      })
    } catch (error) {
      toast.error("No se pudo agregar la educación")
    } finally {
      setLoadingAction(false)
    }
  }

  const handleDeleteEducacion = async (id: string) => {
    try {
      setLoadingAction(true)
      await deleteEducacion(id)
      toast.success("Educación eliminada")
      
      // Recargar educaciones
      const educacionesData = await getEducaciones()
      setEducaciones(educacionesData)
    } catch (error) {
      toast.error("No se pudo eliminar la educación")
    } finally {
      setLoadingAction(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>No se pudo cargar tu perfil</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchAllData}>Reintentar</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const postulacionesActivas = postulaciones.filter(p => p.vacante?.estado === 'ABIERTA')
  const habilidadPromedio = profile.habilidadesCandidato.length > 0
    ? Math.round(profile.habilidadesCandidato.reduce((sum, h) => sum + h.nivel, 0) / profile.habilidadesCandidato.length * 10)
    : 0

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <User className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold leading-tight text-foreground">Mi Portal</div>
              <div className="text-xs leading-tight text-muted-foreground">SmartHire</div>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            <ModeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    {profile.foto_perfil_url && <AvatarImage src={profile.foto_perfil_url} alt="Foto de perfil" />}
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {profile.usuario.name.charAt(0)}{profile.usuario.lastname.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {profile.usuario.name} {profile.usuario.lastname}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {profile.usuario.correo}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/editar-perfil" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Mi Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()} className="text-red-600 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </header>

      <main className="container mx-auto space-y-4 px-4 py-4">
        <section className="space-y-4">
          <div className="space-y-1">
            <h1 className="text-balance text-3xl font-bold leading-tight tracking-tight text-foreground lg:text-4xl">
              Bienvenido, {profile.usuario.name} {profile.usuario.lastname}
            </h1>
            <p className="text-pretty text-base leading-relaxed text-muted-foreground">
              {profile.titulo || 'Candidato'} • {profile.ubicacion || 'Ubicación no especificada'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="gap-2 bg-transparent" asChild>
              <Link to="/gestionar-habilidades">
                <Lightbulb className="h-4 w-4" />
                Gestionar Habilidades
              </Link>
            </Button>
            <Button variant="outline" className="gap-2 bg-transparent" asChild>
              <Link to="/vacantes-disponibles">
                <Search className="h-4 w-4" />
                Buscar Empleos
              </Link>
            </Button>
            <Button variant="outline" className="gap-2 bg-transparent" asChild>
              <Link to="/mis-recomendaciones">
                <MapPin className="h-4 w-4" />
                Recomendaciones
              </Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Briefcase className="h-4 w-4" />
                </div>
                <Badge variant="secondary">{postulacionesActivas.length} activas</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-0">
                <CardTitle className="text-xs font-medium text-muted-foreground">Postulaciones</CardTitle>
                <div className="text-xl font-bold tracking-tight text-foreground">{postulaciones.length}</div>
                <p className="text-xs text-muted-foreground">
                  {postulaciones.length - postulacionesActivas.length} pendientes • {postulacionesActivas.length} completadas
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <Lightbulb className="h-4 w-4" />
                </div>
                <Badge className="bg-accent/10 text-accent border-accent/30">{habilidadPromedio}%</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-0">
                <CardTitle className="text-xs font-medium text-muted-foreground">Habilidades</CardTitle>
                <div className="text-xl font-bold tracking-tight text-foreground">{profile.habilidadesCandidato.length}</div>
                <p className="text-xs text-muted-foreground">Nivel promedio de dominio</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Award className="h-4 w-4" />
                </div>
                <Badge variant="secondary">{experiencias.length} posiciones</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-0">
                <CardTitle className="text-xs font-medium text-muted-foreground">Experiencias</CardTitle>
                <div className="text-xl font-bold tracking-tight text-foreground">{experiencias.length}</div>
                <p className="text-xs text-muted-foreground">Posiciones registradas</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <Tabs defaultValue="postulaciones" className="space-y-4">
          <TabsList className="h-auto w-full justify-start rounded-none border-b bg-transparent p-0">
            <TabsTrigger
              value="postulaciones"
              className="rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Mis Postulaciones
            </TabsTrigger>
            <TabsTrigger
              value="habilidades"
              className="rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Habilidades
            </TabsTrigger>
            <TabsTrigger
              value="experiencia"
              className="rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Experiencia
            </TabsTrigger>
          </TabsList>

          <TabsContent value="postulaciones" className="space-y-3">
            {postulaciones.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-6">
                  <Briefcase className="h-10 w-10 text-muted-foreground mb-3" />
                  <h3 className="text-base font-semibold mb-2">No tienes postulaciones</h3>
                  <p className="text-muted-foreground text-center mb-3 text-sm">
                    Comienza a buscar empleos y postula a las vacantes que te interesen
                  </p>
                  <Button size="sm" asChild>
                    <Link to="/vacantes-disponibles">Buscar Empleos</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              postulaciones.map((postulacion) => (
                <Card key={postulacion.id} className="transition-shadow hover:shadow-md">
                  <CardContent className="p-2">
                    <div className="flex flex-col gap-2 lg:flex-row">
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-base font-bold text-foreground">{postulacion.vacante?.titulo}</h3>
                              <Badge
                                className={
                                  postulacion.vacante?.estado === "ABIERTA"
                                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                                    : ""
                                }
                              >
                                {postulacion.vacante?.estado}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <Building2 className="h-3 w-3 text-muted-foreground" />
                              <span className="font-semibold text-foreground">{postulacion.vacante?.empresa?.name}</span>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-muted-foreground">{postulacion.vacante?.categoria?.nombre || 'Tecnología'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            <span>${postulacion.vacante?.salario_minimo?.toLocaleString() || 0} - ${postulacion.vacante?.salario_maximo?.toLocaleString() || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{postulacion.vacante?.modalidad?.nombre || 'Remoto'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{postulacion.vacante?.horario?.nombre || 'Tiempo completo'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Postulado: {formatDate(postulacion.creado_en)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-row items-center justify-between gap-2 border-t pt-2 lg:flex-col lg:items-end lg:justify-start lg:border-l lg:border-t-0 lg:pl-3 lg:pt-0">
                        <div className="text-center">
                          <div className={`text-2xl font-bold text-primary ${getCompatibilidadColor((postulacion.puntuacion_compatibilidad || 0) * 100)}`}>
                            {(postulacion.puntuacion_compatibilidad || 0) * 100}%
                          </div>
                          <div className="mt-1 text-xs font-medium text-muted-foreground">Compatibilidad</div>
                        </div>
                        <Button size="sm" className="gap-1 text-xs h-7" asChild>
                          <Link to={`/vacante/${postulacion.vacante?.id}`}>
                            Ver Detalles
                            <ChevronRight className="h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="habilidades">
            <Card className="border-none shadow-sm">
              <CardHeader className="border-b ">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-bold tracking-tight">Competencias Técnicas</CardTitle>
                    <CardDescription>
                      {profile.habilidadesCandidato.length} habilidades registradas
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold tracking-tight text-primary">{habilidadPromedio}%</div>
                    <p className="mt-1 text-xs font-medium text-muted-foreground">Nivel promedio</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                {profile.habilidadesCandidato.length === 0 ? (
                  <div className="text-center py-8">
                    <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No tienes habilidades registradas</h3>
                    <p className="text-muted-foreground mb-4">
                      Agrega tus habilidades para mejorar tus oportunidades
                    </p>
                    <Button asChild>
                      <Link to="/gestionar-habilidades">Agregar Habilidades</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(
                      profile.habilidadesCandidato.reduce((acc, h) => {
                        const categoria = h.habilidad.categoria.nombre
                        if (!acc[categoria]) acc[categoria] = []
                        acc[categoria].push(h)
                        return acc
                      }, {} as Record<string, typeof profile.habilidadesCandidato>)
                    ).map(([categoria, habilidadesCat]) => {
                      const CategoryIcon = {
                        'Frontend': Code,
                        'Backend': Database,
                        'Cloud': Cloud,
                        'Mobile': Smartphone,
                      }[categoria] || Lightbulb
                      const iconColor = {
                        'Frontend': 'text-purple-600 dark:text-purple-400',
                        'Backend': 'text-emerald-600 dark:text-emerald-400',
                        'Cloud': 'text-blue-600 dark:text-blue-400',
                        'Mobile': 'text-orange-600 dark:text-orange-400',
                      }[categoria] || 'text-primary'

                      return (
                        <Collapsible
                          key={categoria}
                          open={openCategories[categoria] || false}
                          onOpenChange={(open) => 
                            setOpenCategories(prev => ({ ...prev, [categoria]: open }))
                          }
                        >
                          <CollapsibleTrigger className="w-full">
                            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 hover:bg-muted/30 transition-colors">
                              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                <CategoryIcon className={`h-4 w-4 ${iconColor}`} />
                                {categoria}
                                <span className="text-xs font-normal text-muted-foreground">
                                  ({habilidadesCat.length})
                                </span>
                              </div>
                              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${
                                openCategories[categoria] ? 'rotate-180' : ''
                              }`} />
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="space-y-2 mt-2">
                            {habilidadesCat.map((h) => (
                              <div
                                key={h.id}
                                className="flex items-center justify-between gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
                              >
                                <div className="flex min-w-0 flex-1 items-center gap-3">
                                  <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-foreground">{h.habilidad.nombre}</p>
                                    <p className="mt-0.5 text-sm text-muted-foreground">{getNivelLabel(h.nivel)}</p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3">
                                  <div className="flex w-32 items-center gap-2">
                                    <Progress value={h.nivel * 10} className="h-2 flex-1" />
                                    <span className="text-xs font-medium tabular-nums text-muted-foreground w-8">
                                      {h.nivel}/10
                                    </span>
                                  </div>
                                  <Badge
                                    variant={
                                      h.nivel >= 9
                                        ? "default"
                                        : h.nivel >= 7
                                          ? "secondary"
                                          : "outline"
                                    }
                                    className="shrink-0"
                                  >
                                    {getNivelLabel(h.nivel)}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </CollapsibleContent>
                        </Collapsible>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="experiencia" className="space-y-4">
            <Card className="border-none shadow-sm">
              <CardHeader className="border-b ">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-bold tracking-tight">Trayectoria Profesional</CardTitle>
                    <CardDescription>
                      {experiencias.length} posiciones registradas
                    </CardDescription>
                  </div>
                  <Button size="sm" className="gap-2" onClick={() => setShowAddExperiencia(true)}>
                    <Plus className="h-4 w-4" />
                    Agregar posición
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                {/* Formulario para agregar experiencia */}
                {showAddExperiencia && (
                  <div className="border rounded-lg p-4 mb-6 bg-muted/20">
                    <h4 className="font-semibold mb-4">Nueva Experiencia</h4>
                    <div className="grid gap-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="exp-titulo">Puesto <span className="text-destructive">*</span></Label>
                          <Input
                            id="exp-titulo"
                            placeholder="Ej: Desarrollador Full Stack"
                            value={newExperiencia.titulo}
                            onChange={(e) => setNewExperiencia({ ...newExperiencia, titulo: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="exp-empresa">Empresa <span className="text-destructive">*</span></Label>
                          <Input
                            id="exp-empresa"
                            placeholder="Ej: Tech Company"
                            value={newExperiencia.empresa}
                            onChange={(e) => setNewExperiencia({ ...newExperiencia, empresa: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="exp-ubicacion">Ubicación</Label>
                          <Input
                            id="exp-ubicacion"
                            placeholder="Ej: Santa Cruz, Bolivia"
                            value={newExperiencia.ubicacion}
                            onChange={(e) => setNewExperiencia({ ...newExperiencia, ubicacion: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="exp-inicio">Fecha Inicio <span className="text-destructive">*</span></Label>
                          <Input
                            id="exp-inicio"
                            type="date"
                            value={newExperiencia.fecha_comienzo}
                            onChange={(e) => setNewExperiencia({ ...newExperiencia, fecha_comienzo: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="exp-fin">Fecha Fin</Label>
                          <Input
                            id="exp-fin"
                            type="date"
                            value={newExperiencia.fecha_final || ""}
                            onChange={(e) => setNewExperiencia({ ...newExperiencia, fecha_final: e.target.value || null })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="exp-descripcion">Descripción</Label>
                        <Textarea
                          id="exp-descripcion"
                          placeholder="Describe tus responsabilidades, logros y tecnologías utilizadas..."
                          rows={3}
                          value={newExperiencia.descripcion || ""}
                          onChange={(e) => setNewExperiencia({ ...newExperiencia, descripcion: e.target.value })}
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 justify-end">
                        <Button variant="outline" onClick={() => setShowAddExperiencia(false)} className="w-full sm:w-auto">
                          Cancelar
                        </Button>
                        <Button onClick={handleAddExperiencia} disabled={loadingAction} className="w-full sm:w-auto">
                          {loadingAction ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Guardando...
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-2" />
                              Guardar
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {experiencias.length === 0 ? (
                  <div className="text-center py-8">
                    <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No tienes experiencia registrada</h3>
                    <p className="text-muted-foreground mb-4">
                      Agrega tu experiencia profesional para destacar tu perfil
                    </p>
                    <Button onClick={() => setShowAddExperiencia(true)}>Agregar Experiencia</Button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {experiencias.map((exp, index) => (
                      <div key={exp.id} className="group relative">
                        <div className="flex gap-6 pb-10">
                          <div className="relative flex flex-col items-center">
                            <div
                              className={`z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 ${
                                !exp.fecha_final
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border bg-background text-muted-foreground"
                              }`}
                            >
                              <Briefcase className="h-5 w-5" />
                            </div>
                            {index < experiencias.length - 1 && (
                              <div className="absolute top-11 h-full w-px bg-border"></div>
                            )}
                          </div>

                          <div className="flex-1 space-y-3 pt-0.5">
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0 flex-1 space-y-1">
                                <h3 className="font-bold text-lg leading-tight text-foreground">{exp.titulo}</h3>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1.5 font-medium">
                                    <Building2 className="h-4 w-4" />
                                    <span>{exp.empresa}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <Calendar className="h-4 w-4" />
                                    <span>
                                      {formatDate(exp.fecha_comienzo)} - {exp.fecha_final ? formatDate(exp.fecha_final) : 'Actual'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              {!exp.fecha_final && (
                                <Badge className="shrink-0 bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                                  Actual
                                </Badge>
                              )}
                            </div>

                            {exp.descripcion && (
                              <p className="text-sm leading-relaxed text-muted-foreground">{exp.descripcion}</p>
                            )}
                            <div className="flex items-center gap-2 pt-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteExperiencia(exp.id)}
                                className="h-8 gap-1.5 text-xs text-destructive opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Eliminar
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Educación */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <GraduationCap className="w-5 h-5" />
                    Educación ({educaciones.length})
                  </CardTitle>
                  <Button 
                    size="sm" 
                    onClick={() => setShowAddEducacion(!showAddEducacion)}
                    variant={showAddEducacion ? "outline" : "default"}
                    className="w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {showAddEducacion ? "Cancelar" : "Agregar"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Formulario para agregar */}
                {showAddEducacion && (
                  <div className="border rounded-lg p-4 mb-6 bg-muted/20">
                    <h4 className="font-semibold mb-4">Nueva Educación</h4>
                    <div className="grid gap-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edu-titulo">Título/Carrera <span className="text-destructive">*</span></Label>
                          <Input
                            id="edu-titulo"
                            placeholder="Ej: Ingeniería en Sistemas"
                            value={newEducacion.titulo}
                            onChange={(e) => setNewEducacion({ ...newEducacion, titulo: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edu-institucion">Institución <span className="text-destructive">*</span></Label>
                          <Input
                            id="edu-institucion"
                            placeholder="Ej: Universidad Nacional"
                            value={newEducacion.institucion}
                            onChange={(e) => setNewEducacion({ ...newEducacion, institucion: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edu-estado">Estado <span className="text-destructive">*</span></Label>
                          <Select
                            value={newEducacion.estado}
                            onValueChange={(value: "COMPLETADO" | "EN_CURSO" | "INCOMPLETO") => 
                              setNewEducacion({ ...newEducacion, estado: value })
                            }
                          >
                            <SelectTrigger id="edu-estado">
                              <SelectValue placeholder="Selecciona estado" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="EN_CURSO">En Curso</SelectItem>
                              <SelectItem value="COMPLETADO">Completado</SelectItem>
                              <SelectItem value="INCOMPLETO">Incompleto</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edu-inicio">Fecha Inicio</Label>
                          <Input
                            id="edu-inicio"
                            type="date"
                            value={newEducacion.fecha_comienzo || ""}
                            onChange={(e) => setNewEducacion({ ...newEducacion, fecha_comienzo: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edu-fin">Fecha Fin</Label>
                          <Input
                            id="edu-fin"
                            type="date"
                            value={newEducacion.fecha_final || ""}
                            onChange={(e) => setNewEducacion({ ...newEducacion, fecha_final: e.target.value || null })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edu-descripcion">Descripción</Label>
                        <Textarea
                          id="edu-descripcion"
                          placeholder="Describe especializaciones, logros académicos..."
                          rows={3}
                          value={newEducacion.descripcion || ""}
                          onChange={(e) => setNewEducacion({ ...newEducacion, descripcion: e.target.value })}
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 justify-end">
                        <Button variant="outline" onClick={() => setShowAddEducacion(false)} className="w-full sm:w-auto">
                          Cancelar
                        </Button>
                        <Button onClick={handleAddEducacion} disabled={loadingAction} className="w-full sm:w-auto">
                          {loadingAction ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Guardando...
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-2" />
                              Guardar
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {educaciones.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No has agregado educación aún</p>
                ) : (
                  <div className="space-y-6">
                    {educaciones.map((edu) => (
                      <div key={edu.id} className="relative pl-6 pb-6 border-l-2 border-muted last:pb-0">
                        <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-primary" />
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                          <div className="space-y-1 flex-1 w-full sm:w-auto">
                            <h3 className="font-semibold text-base sm:text-lg">{edu.titulo}</h3>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Building className="w-4 h-4 flex-shrink-0" />
                              <p className="text-sm font-medium">{edu.institucion}</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              <Badge variant="outline" className="text-xs">
                                {edu.estado === 'COMPLETADO' ? 'Completado' : edu.estado === 'EN_CURSO' ? 'En Curso' : 'Incompleto'}
                              </Badge>
                              {edu.fecha_comienzo && (
                                <>
                                  <span className="hidden sm:inline">•</span>
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {formatDate(edu.fecha_comienzo)} - {edu.fecha_final ? formatDate(edu.fecha_final) : 'Presente'}
                                  </div>
                                </>
                              )}
                            </div>
                            {edu.descripcion && (
                              <p className="text-sm mt-2">{edu.descripcion}</p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteEducacion(edu.id)}
                            disabled={loadingAction}
                            className="text-destructive hover:text-destructive flex-shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}