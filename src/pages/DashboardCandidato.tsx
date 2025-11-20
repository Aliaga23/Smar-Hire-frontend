import { useEffect, useState } from "react"
import { useCurrentUser } from "../utils/auth"
import { Navigate, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { CandidatoNavbar } from "../components/CandidatoNavbar"
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Globe, 
  MapPin, 
  Calendar,
  Building2,
  DollarSign,
  CheckCircle2,
  XCircle,
  Search,
  FileText,
  TrendingUp,
  Edit,
  Settings,
  Lightbulb
} from "lucide-react"

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
  ubicacion: string
  fecha_comienzo: string
  fecha_final: string | null
  descripcion: string
}

interface Educacion {
  id: string
  titulo: string
  institucion: string
  estado: string
  fecha_comienzo: string
  fecha_final: string | null
  descripcion: string
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

interface Postulacion {
  id: string
  puntuacion_compatibilidad: number
  creado_en: string
  vacante: {
    id: string
    titulo: string
    descripcion: string
    salario_minimo: number
    salario_maximo: number
    estado: string
    creado_en: string
    empresa: {
      id: string
      name: string
      area: string
    }
    modalidad: {
      id: string
      nombre: string
    }
    horario: {
      id: string
      nombre: string
    }
  }
}

export default function DashboardCandidato() {
  const { isAuthenticated, isCandidato } = useCurrentUser()
  const [profile, setProfile] = useState<CandidatoProfile | null>(null)
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([])
  const [experiencias, setExperiencias] = useState<Experiencia[]>([])
  const [educaciones, setEducaciones] = useState<Educacion[]>([])
  const [loading, setLoading] = useState(true)
  
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
      const token = localStorage.getItem('token')
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      const [profileRes, postulacionesRes, experienciasRes, educacionesRes] = await Promise.all([
        fetch('http://localhost:3000/api/candidatos/profile', { headers }),
        fetch('http://localhost:3000/api/postulaciones/mis-postulaciones?limit=10', { headers }),
        fetch('http://localhost:3000/api/experiencia', { headers }),
        fetch('http://localhost:3000/api/educacion', { headers })
      ])

      const [profileData, postulacionesData, experienciasData, educacionesData] = await Promise.all([
        profileRes.json(),
        postulacionesRes.json(),
        experienciasRes.json(),
        educacionesRes.json()
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

  const postulacionesActivas = postulaciones.filter(p => p.vacante.estado === 'ABIERTA')
  const habilidadPromedio = profile.habilidadesCandidato.length > 0
    ? Math.round(profile.habilidadesCandidato.reduce((sum, h) => sum + h.nivel, 0) / profile.habilidadesCandidato.length * 10)
    : 0

  return (
    <div className="min-h-screen bg-background">
      <CandidatoNavbar />
      
      <main className="container mx-auto p-6 space-y-6">
        {/* Header con info del usuario */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Bienvenido, {profile.usuario.name}
            </h1>
            <p className="text-muted-foreground mt-1">
              {profile.titulo || 'Candidato'} • {profile.ubicacion || 'Ubicación no especificada'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/editar-perfil" className="gap-2">
                <Edit className="h-4 w-4" />
                Editar Perfil
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/gestionar-habilidades" className="gap-2">
                <Settings className="h-4 w-4" />
                Gestionar Habilidades
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/vacantes-disponibles" className="gap-2">
                <Search className="h-4 w-4" />
                Buscar Empleos
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/mis-recomendaciones" className="gap-2">
                <Lightbulb className="h-4 w-4" />
                Recomendaciones
              </Link>
            </Button>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Postulaciones
              </CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile._count.postulaciones}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {postulacionesActivas.length} activas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Habilidades
              </CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile.habilidadesCandidato.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Nivel promedio: {habilidadPromedio}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Experiencias
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{experiencias.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Posiciones registradas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Perfil
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{habilidadPromedio}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Completitud del perfil
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs principales */}
        <Tabs defaultValue="postulaciones" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="postulaciones">Mis Postulaciones</TabsTrigger>
            <TabsTrigger value="perfil">Mi Perfil</TabsTrigger>
            <TabsTrigger value="habilidades">Habilidades</TabsTrigger>
            <TabsTrigger value="experiencia">Experiencia</TabsTrigger>
          </TabsList>

          {/* Tab: Postulaciones */}
          <TabsContent value="postulaciones" className="space-y-4">
            {postulaciones.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No tienes postulaciones</h3>
                  <p className="text-muted-foreground mb-4">
                    Comienza a postularte a vacantes que se ajusten a tu perfil
                  </p>
                  <Link to="/vacantes">
                    <Button>Buscar Empleos</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {postulaciones.map((postulacion) => (
                  <Card key={postulacion.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-xl">{postulacion.vacante.titulo}</CardTitle>
                            {postulacion.vacante.estado === 'ABIERTA' ? (
                              <Badge variant="default" className="gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Abierta
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="gap-1">
                                <XCircle className="w-3 h-3" />
                                Cerrada
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-4 h-4" />
                              {postulacion.vacante.empresa.name}
                            </span>
                            <span>{postulacion.vacante.empresa.area}</span>
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getCompatibilidadColor(postulacion.puntuacion_compatibilidad)}`}>
                            {postulacion.puntuacion_compatibilidad}%
                          </div>
                          <p className="text-xs text-muted-foreground">Compatibilidad</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {postulacion.vacante.descripcion}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm">
                          {postulacion.vacante.salario_minimo && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <DollarSign className="w-4 h-4" />
                              ${postulacion.vacante.salario_minimo.toLocaleString()} - ${postulacion.vacante.salario_maximo?.toLocaleString()}
                            </div>
                          )}
                          <Badge variant="outline">{postulacion.vacante.modalidad.nombre}</Badge>
                          <Badge variant="outline">{postulacion.vacante.horario.nombre}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          Postulado: {formatDate(postulacion.creado_en)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tab: Perfil */}
          <TabsContent value="perfil" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Información Personal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Biografía</label>
                  <p className="mt-1 text-sm">
                    {profile.bio || 'No has agregado una biografía aún'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Correo</label>
                    <p className="mt-1 text-sm">{profile.usuario.correo}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Teléfono</label>
                    <p className="mt-1 text-sm">{profile.usuario.telefono || 'No especificado'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Ubicación</label>
                    <p className="mt-1 text-sm">{profile.ubicacion || 'No especificada'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Fecha de Nacimiento</label>
                    <p className="mt-1 text-sm">
                      {profile.usuario.fecha_nacimiento 
                        ? formatDate(profile.usuario.fecha_nacimiento)
                        : 'No especificada'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Idiomas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Idiomas ({profile.lenguajesCandidato.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profile.lenguajesCandidato.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No has agregado idiomas aún</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.lenguajesCandidato.map((lenguaje) => (
                      <div key={lenguaje.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{lenguaje.lenguaje.nombre}</span>
                          <Badge variant="secondary">{getNivelLabel(lenguaje.nivel)}</Badge>
                        </div>
                        <Progress value={lenguaje.nivel * 10} className="h-2" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Habilidades */}
          <TabsContent value="habilidades" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Habilidades Técnicas ({profile.habilidadesCandidato.length})
                  </CardTitle>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{habilidadPromedio}%</div>
                    <p className="text-xs text-muted-foreground">Nivel Promedio</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {profile.habilidadesCandidato.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No has agregado habilidades aún</p>
                ) : (
                  <div className="space-y-6">
                    {/* Agrupar por categoría */}
                    {Object.entries(
                      profile.habilidadesCandidato.reduce((acc, hab) => {
                        const cat = hab.habilidad.categoria.nombre
                        if (!acc[cat]) acc[cat] = []
                        acc[cat].push(hab)
                        return acc
                      }, {} as Record<string, Habilidad[]>)
                    ).map(([categoria, habilidades]) => (
                      <div key={categoria}>
                        <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase">
                          {categoria}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {habilidades.map((hab) => (
                            <div key={hab.id} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{hab.habilidad.nombre}</span>
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary">{getNivelLabel(hab.nivel)}</Badge>
                                  <span className="text-sm font-bold text-primary">{hab.nivel}/10</span>
                                </div>
                              </div>
                              <Progress value={hab.nivel * 10} className="h-2" />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Experiencia */}
          <TabsContent value="experiencia" className="space-y-4">
            {/* Experiencia Laboral */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Experiencia Laboral ({experiencias.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {experiencias.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No has agregado experiencia laboral aún</p>
                ) : (
                  <div className="space-y-6">
                    {experiencias.map((exp) => (
                      <div key={exp.id} className="relative pl-6 pb-6 border-l-2 border-muted last:pb-0">
                        <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-primary" />
                        <div className="space-y-1">
                          <h3 className="font-semibold text-lg">{exp.titulo}</h3>
                          <p className="text-sm font-medium text-muted-foreground">{exp.empresa}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {exp.ubicacion}
                            <span>•</span>
                            <Calendar className="w-3 h-3" />
                            {formatDate(exp.fecha_comienzo)} - {exp.fecha_final ? formatDate(exp.fecha_final) : 'Presente'}
                          </div>
                          {exp.descripcion && (
                            <p className="text-sm mt-2">{exp.descripcion}</p>
                          )}
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
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Educación ({educaciones.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {educaciones.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No has agregado educación aún</p>
                ) : (
                  <div className="space-y-6">
                    {educaciones.map((edu) => (
                      <div key={edu.id} className="relative pl-6 pb-6 border-l-2 border-muted last:pb-0">
                        <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-primary" />
                        <div className="space-y-1">
                          <h3 className="font-semibold text-lg">{edu.titulo}</h3>
                          <p className="text-sm font-medium text-muted-foreground">{edu.institucion}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="outline">{edu.estado}</Badge>
                            <span>•</span>
                            <Calendar className="w-3 h-3" />
                            {formatDate(edu.fecha_comienzo)} - {edu.fecha_final ? formatDate(edu.fecha_final) : 'Presente'}
                          </div>
                          {edu.descripcion && (
                            <p className="text-sm mt-2">{edu.descripcion}</p>
                          )}
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