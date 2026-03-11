import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { CandidatoNavbar } from "@/components/CandidatoNavbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Briefcase, MapPin, DollarSign, Building2, Search, ArrowLeft, Loader2, CheckCircle2, Filter } from "lucide-react"
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
      <main className="container mx-auto px-4 py-6">
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
          <div className="space-y-1">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border-b border-border py-4 px-5">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-2 flex-wrap">
                      <div className="h-6 w-48 bg-muted rounded-md animate-pulse"></div>
                      <div className="h-5 w-16 bg-muted rounded-md animate-pulse"></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-muted rounded-sm animate-pulse"></div>
                      <div className="h-4 w-32 bg-muted rounded-sm animate-pulse"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-muted rounded-sm animate-pulse"></div>
                      <div className="h-4 w-3/4 bg-muted rounded-sm animate-pulse"></div>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                      <div className="h-3 w-20 bg-muted rounded-sm animate-pulse"></div>
                      <div className="h-3 w-24 bg-muted rounded-sm animate-pulse"></div>
                      <div className="h-3 w-28 bg-muted rounded-sm animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex lg:flex-col gap-2 lg:items-end">
                    <div className="h-8 w-24 bg-muted rounded-md animate-pulse"></div>
                    <div className="h-8 w-28 bg-muted rounded-md animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lista de Vacantes */}
        {!loading && (
          <div className="space-y-1">
            {vacantesFiltradas.length === 0 ? (
              <div className="border-b border-border py-8 text-center">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay vacantes disponibles</h3>
                <p className="text-sm text-muted-foreground">
                  {busqueda ? "Intenta con otro término de búsqueda" : "Vuelve más tarde para ver nuevas oportunidades"}
                </p>
              </div>
            ) : (
              vacantesFiltradas.map((vacante, index) => {
                const postulado = yaPostulado(vacante.id)
                const diasPublicado = Math.floor(
                  (new Date().getTime() - new Date(vacante.creado_en).getTime()) / (1000 * 60 * 60 * 24)
                )
                
                return (
                  <div
                    key={vacante.id}
                    className={`group relative border-b border-border hover:bg-card/50 hover:shadow-sm transition-all duration-300 ${
                      index === 0 ? "border-t" : ""
                    }`}
                  >
                    <div className="py-4 px-5">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        {/* Left: Job Info */}
                        <div className="flex-1 space-y-3">
                          {/* Title and Status */}
                          <div className="flex items-start gap-2 flex-wrap">
                            <h3 className="text-lg lg:text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-200">
                              {vacante.titulo}
                            </h3>
                            <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 uppercase tracking-wide">
                              {vacante.estado}
                            </span>
                            {postulado && (
                              <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 uppercase tracking-wide">
                                Ya postulado
                              </span>
                            )}
                            {diasPublicado <= 3 && (
                              <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 uppercase tracking-wide">
                                Nuevo
                              </span>
                            )}
                          </div>

                          {/* Company */}
                          <div className="flex items-center gap-2 text-foreground/80">
                            <Building2 className="w-3 h-3 text-foreground/50" />
                            <span className="font-semibold text-sm">{vacante.empresa?.name || "Empresa"}</span>
                            {vacante.empresa?.area && (
                              <span className="px-2 py-0.5 rounded-md bg-foreground/5 text-foreground/70 text-xs font-medium border border-foreground/10">
                                {vacante.empresa.area}
                              </span>
                            )}
                          </div>

                          {/* Meta Info Simplified */}
                          <div className="flex items-center gap-4 text-xs text-foreground/60">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3 h-3 text-foreground/40 flex-shrink-0" />
                              <span>{vacante.modalidad?.nombre || "Remoto"}</span>
                            </div>
                            {(vacante.salario_minimo || vacante.salario_maximo) && (
                              <div className="flex items-center gap-1.5">
                                <DollarSign className="w-3 h-3 text-foreground/40 flex-shrink-0" />
                                <span>
                                  {vacante.salario_minimo && vacante.salario_maximo
                                    ? `$${Math.round(vacante.salario_minimo/1000)}k-${Math.round(vacante.salario_maximo/1000)}k`
                                    : vacante.salario_minimo
                                    ? `Desde $${Math.round(vacante.salario_minimo/1000)}k`
                                    : `Hasta $${Math.round((vacante.salario_maximo || 0)/1000)}k`}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex lg:flex-col gap-2 lg:items-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/vacante/${vacante.id}`)}
                            className="gap-1.5 text-xs hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
                          >
                            <Search className="w-3 h-3" />
                            Ver Detalles
                          </Button>
                          {postulado ? (
                            <Button variant="outline" size="sm" disabled className="gap-1.5 text-xs">
                              <CheckCircle2 className="w-3 h-3" />
                              Ya te postulaste
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handlePostular(vacante.id)}
                              disabled={postulando === vacante.id || vacante.estado !== "ABIERTA"}
                              className="gap-1.5 text-xs hover:bg-primary/90 transition-colors duration-200"
                            >
                              {postulando === vacante.id ? (
                                <>
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  Postulando...
                                </>
                              ) : (
                                <>
                                  <Briefcase className="w-3 h-3" />
                                  Postularme
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </main>
    </>
  )
}
