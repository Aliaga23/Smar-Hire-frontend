import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { CandidatoNavbar } from "@/components/CandidatoNavbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Briefcase, MapPin, DollarSign, Clock, Building2, Search, ArrowLeft, Loader2, CheckCircle2, Filter } from "lucide-react"
import { getVacantes, type Vacante } from "@/services/vacante"
import { createPostulacion, getMisPostulaciones, type Postulacion } from "@/services/postulacion"
import { toast } from "sonner"

export default function VacantesDisponibles() {
  const navigate = useNavigate()
  const [vacantes, setVacantes] = useState<Vacante[]>([])
  const [misPostulaciones, setMisPostulaciones] = useState<Postulacion[]>([])
  const [loading, setLoading] = useState(true)
  const [postulando, setPostulando] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState("")
  const [filtroModalidad, setFiltroModalidad] = useState<string>("all")
  const [filtroHorario, setFiltroHorario] = useState<string>("all")
  const [mostrarFiltros, setMostrarFiltros] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [vacantesRes, postulacionesRes] = await Promise.all([
        getVacantes({ estado: "ABIERTA" }),
        getMisPostulaciones(1, 100)
      ])
      
      setVacantes(vacantesRes.data || [])
      setMisPostulaciones(postulacionesRes.data || [])
    } catch (error) {
      console.error("Error al cargar datos:", error)
      toast.error("Error al cargar las vacantes")
    } finally {
      setLoading(false)
    }
  }

  const handlePostular = async (vacanteId: string) => {
    try {
      setPostulando(vacanteId)
      await createPostulacion({ vacanteId })
      toast.success("¡Postulación enviada con éxito!")
      
      // Recargar postulaciones
      const postulacionesRes = await getMisPostulaciones(1, 100)
      setMisPostulaciones(postulacionesRes.data || [])
    } catch (error: any) {
      console.error("Error al postular:", error)
      const mensaje = error.response?.data?.message || "Error al enviar la postulación"
      toast.error(mensaje)
    } finally {
      setPostulando(null)
    }
  }

  const yaPostulado = (vacanteId: string) => {
    return misPostulaciones.some(p => p.vacanteId === vacanteId)
  }

  const vacantesFiltradas = vacantes.filter(v => {
    const matchBusqueda = v.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      v.empresa?.name.toLowerCase().includes(busqueda.toLowerCase())
    
    const matchModalidad = filtroModalidad === "all" || v.modalidad?.id === filtroModalidad
    const matchHorario = filtroHorario === "all" || v.horario?.id === filtroHorario
    
    return matchBusqueda && matchModalidad && matchHorario
  })

  // Obtener modalidades y horarios únicos para los filtros
  const modalidadesUnicas = Array.from(
    new Set(vacantes.map(v => v.modalidad).filter(Boolean))
  ).filter((m, index, self) => m && self.findIndex(t => t?.id === m.id) === index)

  const horariosUnicos = Array.from(
    new Set(vacantes.map(v => v.horario).filter(Boolean))
  ).filter((h, index, self) => h && self.findIndex(t => t?.id === h.id) === index)

  return (
    <>
      <CandidatoNavbar />
      <main className="container mx-auto p-6 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Vacantes Disponibles</h1>
            <p className="text-muted-foreground mt-1">
              Encuentra tu próxima oportunidad profesional
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/dashboard-candidato")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>

        {/* Buscador y Filtros */}
        <Card className="mb-6">
          <CardContent className="p-4 space-y-4">
            {/* Barra de búsqueda */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título o empresa..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                Filtros
              </Button>
            </div>

            {/* Filtros avanzados */}
            {mostrarFiltros && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <label className="text-sm font-medium mb-2 block">Modalidad</label>
                  <Select value={filtroModalidad} onValueChange={setFiltroModalidad}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las modalidades" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las modalidades</SelectItem>
                      {modalidadesUnicas.map((modalidad) => (
                        <SelectItem key={modalidad!.id} value={modalidad!.id}>
                          {modalidad!.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Horario</label>
                  <Select value={filtroHorario} onValueChange={setFiltroHorario}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los horarios" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los horarios</SelectItem>
                      {horariosUnicos.map((horario) => (
                        <SelectItem key={horario!.id} value={horario!.id}>
                          {horario!.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Botón para limpiar filtros */}
                {(filtroModalidad !== "all" || filtroHorario !== "all") && (
                  <div className="md:col-span-2">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setFiltroModalidad("all")
                        setFiltroHorario("all")
                      }}
                      className="w-full"
                    >
                      Limpiar Filtros
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Contador de resultados */}
            <div className="text-sm text-muted-foreground">
              Mostrando {vacantesFiltradas.length} de {vacantes.length} vacantes
            </div>
          </CardContent>
        </Card>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Lista de Vacantes */}
        {!loading && (
          <div className="grid gap-4">
            {vacantesFiltradas.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay vacantes disponibles</h3>
                  <p className="text-sm text-muted-foreground">
                    {busqueda ? "Intenta con otro término de búsqueda" : "Vuelve más tarde para ver nuevas oportunidades"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              vacantesFiltradas.map((vacante) => {
                const postulado = yaPostulado(vacante.id)
                const diasPublicado = Math.floor(
                  (new Date().getTime() - new Date(vacante.creado_en).getTime()) / (1000 * 60 * 60 * 24)
                )
                
                return (
                  <Card key={vacante.id} className="hover:shadow-lg transition-all border-l-4 border-l-primary/40 hover:border-l-primary">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <CardTitle className="text-2xl">{vacante.titulo}</CardTitle>
                            {postulado && (
                              <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Ya postulado
                              </Badge>
                            )}
                            {diasPublicado <= 3 && (
                              <Badge variant="default" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100">
                                Nuevo
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="flex items-center gap-3 flex-wrap text-base">
                            <span className="flex items-center gap-1.5 font-medium">
                              <Building2 className="h-4 w-4" />
                              {vacante.empresa?.name || "Empresa"}
                            </span>
                            {vacante.empresa?.area && (
                              <span className="flex items-center gap-1.5 text-sm">
                                •
                                <span className="px-2 py-0.5 bg-muted rounded-full">
                                  {vacante.empresa.area}
                                </span>
                              </span>
                            )}
                          </CardDescription>
                        </div>
                        <Badge 
                          variant={vacante.estado === "ABIERTA" ? "default" : "secondary"}
                          className="text-sm px-3 py-1"
                        >
                          {vacante.estado}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Descripción con más líneas visibles */}
                      <p className="text-sm text-muted-foreground line-clamp-4 leading-relaxed">
                        {vacante.descripcion}
                      </p>

                      {/* Info adicional en grid mejorado */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {vacante.modalidad && (
                          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                            <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs text-muted-foreground">Modalidad</p>
                              <p className="text-sm font-medium truncate">{vacante.modalidad.nombre}</p>
                            </div>
                          </div>
                        )}
                        {vacante.horario && (
                          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                            <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs text-muted-foreground">Horario</p>
                              <p className="text-sm font-medium truncate">{vacante.horario.nombre}</p>
                            </div>
                          </div>
                        )}
                        {(vacante.salario_minimo || vacante.salario_maximo) && (
                          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg sm:col-span-2">
                            <DollarSign className="h-4 w-4 text-primary flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs text-muted-foreground">Salario</p>
                              <p className="text-sm font-medium truncate">
                                {vacante.salario_minimo && vacante.salario_maximo
                                  ? `$${vacante.salario_minimo.toLocaleString()} - $${vacante.salario_maximo.toLocaleString()}`
                                  : vacante.salario_minimo
                                  ? `Desde $${vacante.salario_minimo.toLocaleString()}`
                                  : `Hasta $${vacante.salario_maximo?.toLocaleString()}`}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Información adicional en una línea */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {diasPublicado === 0 
                            ? "Publicado hoy" 
                            : diasPublicado === 1
                            ? "Publicado hace 1 día"
                            : `Publicado hace ${diasPublicado} días`}
                        </span>
                        {vacante._count?.postulaciones !== undefined && (
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            {vacante._count.postulaciones} {vacante._count.postulaciones === 1 ? 'postulante' : 'postulantes'}
                          </span>
                        )}
                      </div>

                      {/* Botones de acción */}
                      <div className="flex gap-2 justify-end pt-3 border-t">
                        <Button
                          variant="outline"
                          onClick={() => navigate(`/vacante/${vacante.id}`)}
                          className="gap-2"
                        >
                          <Search className="h-4 w-4" />
                          Ver Detalles
                        </Button>
                        {postulado ? (
                          <Button variant="outline" disabled className="gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            Ya te postulaste
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handlePostular(vacante.id)}
                            disabled={postulando === vacante.id || vacante.estado !== "ABIERTA"}
                            className="gap-2"
                          >
                            {postulando === vacante.id ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Postulando...
                              </>
                            ) : (
                              <>
                                <Briefcase className="h-4 w-4" />
                                Postularme
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        )}
      </main>
    </>
  )
}
