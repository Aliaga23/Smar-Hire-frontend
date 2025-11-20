import { useEffect, useState, useMemo, useCallback } from "react"
import { useParams, Navigate, useNavigate } from "react-router-dom"
import { useCurrentUser } from "../utils/auth"
import { toast } from "sonner"
import api from "@/lib/axios"
import { EmpresaNavbar } from "@/components/EmpresaNavbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin,
  Award,
  Languages,
  GraduationCap,
  Briefcase,
  Calendar
} from "lucide-react"

interface CandidatoPublico {
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
  }
  habilidadesCandidato: Array<{
    nivel: number
    habilidad: {
      id: string
      nombre: string
    }
  }>
  lenguajesCandidato: Array<{
    nivel: number
    lenguaje: {
      id: string
      nombre: string
    }
  }>
  experienciasCandidato: Array<{
    id: string
    titulo: string
    empresa: string
    ubicacion: string
    fecha_comienzo: string
    fecha_final: string | null
    descripcion: string
  }>
  educacionesCandidato: Array<{
    id: string
    institucion: string
    titulo: string
    campo_estudio: string
    fecha_inicio: string
    fecha_fin: string | null
  }>
}

export default function PerfilCandidato() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated, isReclutador } = useCurrentUser()
  const [candidato, setCandidato] = useState<CandidatoPublico | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!isReclutador) {
    return <Navigate to="/dashboard-candidato" replace />
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return

      try {
        setIsLoading(true)
        const { data } = await api.get(`/candidatos/${id}`)
        setCandidato(data)
      } catch (error) {
        console.error('Error al cargar perfil:', error)
        toast.error('Error al cargar el perfil del candidato')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id])

  const formatearFecha = useCallback((fecha?: string) => {
    if (!fecha) return 'Presente'
    const date = new Date(fecha)
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short'
    })
  }, [])

  const obtenerIniciales = useCallback(() => {
    const { name, lastname } = candidato?.usuario || {}
    const inicialNombre = name?.[0]?.toUpperCase() || ''
    const inicialApellido = lastname?.[0]?.toUpperCase() || ''
    return `${inicialNombre}${inicialApellido}` || '??'
  }, [candidato])

  const usuario = useMemo(() => candidato?.usuario, [candidato])

  return (
    <div className="min-h-screen bg-background">
      <EmpresaNavbar />
      
      <main className="container mx-auto p-4 sm:p-6 max-w-5xl space-y-4">
        {/* Header con navegación */}
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          {!isLoading && (
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Perfil de {usuario?.name} {usuario?.lastname}
              </h1>
            </div>
          )}
        </div>

        {/* Hero Section - Info básica y vacante combinados */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Avatar */}
              {isLoading ? (
                <Skeleton className="h-24 w-24 rounded-full flex-shrink-0 mx-auto sm:mx-0" />
              ) : (
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-semibold text-3xl flex-shrink-0 mx-auto sm:mx-0">
                  {obtenerIniciales()}
                </div>
              )}

              {/* Info Principal */}
              <div className="flex-1 space-y-3">
                {isLoading ? (
                  <>
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-5 w-64" />
                    <Skeleton className="h-16 w-full" />
                  </>
                ) : (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold">
                          {usuario?.name} {usuario?.lastname}
                        </h2>
                        <p className="text-base sm:text-lg text-muted-foreground">
                          {candidato?.titulo || 'Sin título profesional'}
                        </p>
                      </div>
                    </div>

                    {candidato?.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{candidato.bio}</p>
                    )}

                    <div className="flex flex-wrap gap-3 text-sm">
                      {usuario?.correo && (
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="truncate">{usuario.correo}</span>
                        </div>
                      )}
                      {usuario?.telefono && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{usuario.telefono}</span>
                        </div>
                      )}
                      {candidato?.ubicacion && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{candidato.ubicacion}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Experiencia y Educación en grid */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Experiencia Laboral */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Experiencia Laboral
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i}>
                      <Skeleton className="h-5 w-40 mb-1" />
                      <Skeleton className="h-4 w-48 mb-1" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  ))}
                </div>
              ) : candidato?.experienciasCandidato && candidato.experienciasCandidato.length > 0 ? (
                <div className="space-y-3">
                  {candidato.experienciasCandidato.map((exp, idx: number) => (
                    <div key={idx} className="border-l-2 border-primary pl-3 py-1">
                      <h4 className="font-semibold text-sm">{exp.titulo}</h4>
                      <p className="text-sm text-muted-foreground">{exp.empresa}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatearFecha(exp.fecha_comienzo)} - {formatearFecha(exp.fecha_final || undefined)}</span>
                        </div>
                        {exp.ubicacion && (
                          <>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{exp.ubicacion}</span>
                            </div>
                          </>
                        )}
                      </div>
                      {exp.descripcion && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{exp.descripcion}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Sin experiencia laboral registrada</p>
              )}
            </CardContent>
          </Card>

          {/* Educación y Competencias */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Educación y Competencias
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Educación */}
              <div>
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  Formación Académica
                </h3>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i}>
                        <Skeleton className="h-5 w-40 mb-1" />
                        <Skeleton className="h-4 w-48 mb-1" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    ))}
                  </div>
                ) : candidato?.educacionesCandidato && candidato.educacionesCandidato.length > 0 ? (
                  <div className="space-y-3">
                    {candidato.educacionesCandidato.map((edu, idx: number) => (
                      <div key={idx} className="border-l-2 border-primary pl-3 py-1">
                        <h4 className="font-semibold text-sm">{edu.titulo}</h4>
                        <p className="text-sm text-muted-foreground">{edu.institucion}</p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatearFecha(edu.fecha_inicio)} - {formatearFecha(edu.fecha_fin || undefined)}</span>
                          </div>
                          {edu.campo_estudio && (
                            <Badge variant="outline" className="text-xs py-0 h-5">
                              {edu.campo_estudio}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Sin educación registrada</p>
                )}
              </div>

              <Separator />

              {/* Competencias */}
              <div>
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" />
                  Competencias Técnicas
                </h3>
                <Tabs defaultValue="habilidades" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-3">
                    <TabsTrigger value="habilidades" className="gap-2 text-xs">
                      <Award className="h-3 w-3" />
                      Habilidades
                    </TabsTrigger>
                    <TabsTrigger value="idiomas" className="gap-2 text-xs">
                      <Languages className="h-3 w-3" />
                      Idiomas
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="habilidades" className="mt-0">
                    <ScrollArea className="h-[300px] pr-4">
                      {isLoading ? (
                        <div className="space-y-2">
                          {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                          ))}
                        </div>
                      ) : candidato?.habilidadesCandidato && candidato.habilidadesCandidato.length > 0 ? (
                        <div className="space-y-2">
                          {candidato.habilidadesCandidato.map((hab, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 border rounded-lg">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">{hab.habilidad.nombre}</p>

                              </div>
                              <Badge variant="secondary" className="text-xs ml-2">Nivel {hab.nivel}</Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">Sin habilidades registradas</p>
                      )}
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent value="idiomas" className="mt-0">
                    <ScrollArea className="h-[300px] pr-4">
                      {isLoading ? (
                        <div className="space-y-2">
                          {[1, 2].map((i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                          ))}
                        </div>
                      ) : candidato?.lenguajesCandidato && candidato.lenguajesCandidato.length > 0 ? (
                        <div className="space-y-2">
                          {candidato.lenguajesCandidato.map((len, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 border rounded-lg">
                              <p className="font-medium text-sm">{len.lenguaje.nombre}</p>
                              <Badge variant="secondary" className="text-xs">Nivel {len.nivel}</Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">Sin idiomas registrados</p>
                      )}
                    </ScrollArea>
                  </TabsContent>
              </Tabs>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
          <Button variant="outline" className="w-full sm:w-auto">
            Descargar CV
          </Button>
          <Button className="w-full sm:w-auto">
            <Mail className="h-4 w-4 mr-2" />
            Contactar
          </Button>
        </div>
      </main>
    </div>
  )
}
