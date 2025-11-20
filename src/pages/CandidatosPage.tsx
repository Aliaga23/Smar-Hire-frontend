import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { EmpresaNavbar } from "@/components/EmpresaNavbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  Filter,
  Users,
  MapPin,
  Mail,
  Phone,
  Star,
  Briefcase,
  GraduationCap,
  X,
} from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/axios"

interface Candidato {
  id: string
  puntuacion_compatibilidad: number | null
  creado_en: string
  vacante: {
    id: string
    titulo: string
  }
  candidato: {
    id: string
    titulo: string
    ubicacion: string
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
  }
}

interface Vacante {
  id: string
  titulo: string
}

interface Habilidad {
  id: string
  nombre: string
}

interface Lenguaje {
  id: string
  nombre: string
}

export default function CandidatosPage() {
  const navigate = useNavigate()
  const [candidatos, setCandidatos] = useState<Candidato[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  // Filtros
  const [selectedVacante, setSelectedVacante] = useState<string>("")
  const [selectedHabilidad, setSelectedHabilidad] = useState<string>("")
  const [selectedLenguaje, setSelectedLenguaje] = useState<string>("")
  const [nivelHabilidadMin, setNivelHabilidadMin] = useState<string>("")
  const [nivelLenguajeMin, setNivelLenguajeMin] = useState<string>("")
  const [compatibilidadMin, setCompatibilidadMin] = useState<string>("")

  // Opciones para filtros
  const [vacantes, setVacantes] = useState<Vacante[]>([])
  const [habilidades, setHabilidades] = useState<Habilidad[]>([])
  const [lenguajes, setLenguajes] = useState<Lenguaje[]>([])

  // Paginación
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetchCandidatos()
    fetchVacantes()
    fetchHabilidades()
    fetchLenguajes()
  }, [page, selectedVacante, selectedHabilidad, selectedLenguaje, nivelHabilidadMin, nivelLenguajeMin, compatibilidadMin])

  const fetchCandidatos = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
      })

      if (selectedVacante) params.append("vacanteId", selectedVacante)
      if (selectedHabilidad) params.append("habilidadId", selectedHabilidad)
      if (selectedLenguaje) params.append("lenguajeId", selectedLenguaje)
      if (nivelHabilidadMin) params.append("nivelHabilidadMin", nivelHabilidadMin)
      if (nivelLenguajeMin) params.append("nivelLenguajeMin", nivelLenguajeMin)
      if (compatibilidadMin) params.append("compatibilidadMin", compatibilidadMin)

      const { data } = await api.get(`/postulaciones/empresa/candidatos?${params.toString()}`)
      setCandidatos(data.data || [])
      setTotalPages(data.pagination?.totalPages || 1)
      setTotal(data.pagination?.total || 0)
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al cargar candidatos")
    } finally {
      setLoading(false)
    }
  }

  const fetchVacantes = async () => {
    try {
      const { data } = await api.get("/vacantes?limit=100")
      setVacantes(data.data || [])
    } catch (error) {
      console.error("Error al cargar vacantes:", error)
    }
  }

  const fetchHabilidades = async () => {
    try {
      const { data } = await api.get("/habilidades?limit=100")
      setHabilidades(data.data || [])
    } catch (error) {
      console.error("Error al cargar habilidades:", error)
    }
  }

  const fetchLenguajes = async () => {
    try {
      const { data } = await api.get("/lenguajes?limit=100")
      setLenguajes(data.data || [])
    } catch (error) {
      console.error("Error al cargar lenguajes:", error)
    }
  }

  const clearFilters = () => {
    setSelectedVacante("")
    setSelectedHabilidad("")
    setSelectedLenguaje("")
    setNivelHabilidadMin("")
    setNivelLenguajeMin("")
    setCompatibilidadMin("")
    setSearchTerm("")
    setPage(1)
  }

  const hasActiveFilters = selectedVacante || selectedHabilidad || selectedLenguaje || nivelHabilidadMin || nivelLenguajeMin || compatibilidadMin

  const filteredCandidatos = candidatos.filter((postulacion) => {
    const candidato = postulacion.candidato
    const fullName = `${candidato.usuario.name} ${candidato.usuario.lastname}`.toLowerCase()
    const titulo = candidato.titulo?.toLowerCase() || ""
    const ubicacion = candidato.ubicacion?.toLowerCase() || ""
    const search = searchTerm.toLowerCase()

    return fullName.includes(search) || titulo.includes(search) || ubicacion.includes(search)
  })

  const getNivelColor = (nivel: number) => {
    if (nivel >= 8) return "text-green-500"
    if (nivel >= 6) return "text-blue-500"
    if (nivel >= 4) return "text-yellow-500"
    return "text-gray-500"
  }

  const getNivelLabel = (nivel: number) => {
    if (nivel >= 9) return "Experto"
    if (nivel >= 7) return "Avanzado"
    if (nivel >= 5) return "Intermedio"
    if (nivel >= 3) return "Básico"
    return "Principiante"
  }

  return (
    <div className="min-h-screen bg-background">
      <EmpresaNavbar />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Panel de Candidatos</h1>
              <p className="text-muted-foreground">
                Encuentra y gestiona candidatos postulados a tus vacantes
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                <Users className="w-4 h-4 mr-2" />
                {total} candidatos
              </Badge>
            </div>
          </div>

          {/* Búsqueda y filtros */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, título o ubicación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className="sm:w-auto"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2">
                  {[selectedVacante, selectedHabilidad, selectedLenguaje, nivelHabilidadMin, nivelLenguajeMin, compatibilidadMin].filter(Boolean).length}
                </Badge>
              )}
            </Button>
          </div>

          {/* Panel de filtros */}
          {showFilters && (
            <Card className="mt-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Filtros Avanzados</CardTitle>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      <X className="w-4 h-4 mr-2" />
                      Limpiar filtros
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Filtro por vacante */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Vacante
                    </label>
                    <Select value={selectedVacante} onValueChange={setSelectedVacante}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas las vacantes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value=" ">Todas las vacantes</SelectItem>
                        {vacantes.map((vacante) => (
                          <SelectItem key={vacante.id} value={vacante.id}>
                            {vacante.titulo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Filtro por habilidad */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Habilidad
                    </label>
                    <Select value={selectedHabilidad} onValueChange={setSelectedHabilidad}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas las habilidades" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value=" ">Todas las habilidades</SelectItem>
                        {habilidades.map((habilidad) => (
                          <SelectItem key={habilidad.id} value={habilidad.id}>
                            {habilidad.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Nivel mínimo de habilidad */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Nivel mínimo de habilidad
                    </label>
                    <Select value={nivelHabilidadMin} onValueChange={setNivelHabilidadMin}>
                      <SelectTrigger>
                        <SelectValue placeholder="Cualquier nivel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value=" ">Cualquier nivel</SelectItem>
                        <SelectItem value="1">1 - Principiante</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3 - Básico</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5 - Intermedio</SelectItem>
                        <SelectItem value="6">6</SelectItem>
                        <SelectItem value="7">7 - Avanzado</SelectItem>
                        <SelectItem value="8">8</SelectItem>
                        <SelectItem value="9">9 - Experto</SelectItem>
                        <SelectItem value="10">10 - Master</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Filtro por lenguaje */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Lenguaje
                    </label>
                    <Select value={selectedLenguaje} onValueChange={setSelectedLenguaje}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los lenguajes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value=" ">Todos los lenguajes</SelectItem>
                        {lenguajes.map((lenguaje) => (
                          <SelectItem key={lenguaje.id} value={lenguaje.id}>
                            {lenguaje.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Nivel mínimo de lenguaje */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Nivel mínimo de lenguaje
                    </label>
                    <Select value={nivelLenguajeMin} onValueChange={setNivelLenguajeMin}>
                      <SelectTrigger>
                        <SelectValue placeholder="Cualquier nivel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value=" ">Cualquier nivel</SelectItem>
                        <SelectItem value="1">1 - Principiante</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3 - Básico</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5 - Intermedio</SelectItem>
                        <SelectItem value="6">6</SelectItem>
                        <SelectItem value="7">7 - Avanzado</SelectItem>
                        <SelectItem value="8">8</SelectItem>
                        <SelectItem value="9">9 - Experto</SelectItem>
                        <SelectItem value="10">10 - Master</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Compatibilidad mínima */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Compatibilidad mínima
                    </label>
                    <Select value={compatibilidadMin} onValueChange={setCompatibilidadMin}>
                      <SelectTrigger>
                        <SelectValue placeholder="Cualquier compatibilidad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value=" ">Cualquier compatibilidad</SelectItem>
                        <SelectItem value="0.5">50%</SelectItem>
                        <SelectItem value="0.6">60%</SelectItem>
                        <SelectItem value="0.7">70%</SelectItem>
                        <SelectItem value="0.8">80%</SelectItem>
                        <SelectItem value="0.9">90%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Lista de candidatos */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-muted-foreground">Cargando candidatos...</p>
          </div>
        ) : filteredCandidatos.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No se encontraron candidatos</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || hasActiveFilters
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "No hay postulaciones de candidatos disponibles"}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  Limpiar filtros
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCandidatos.map((postulacion) => {
                const candidato = postulacion.candidato
                const initials = `${candidato.usuario.name[0]}${candidato.usuario.lastname[0]}`.toUpperCase()

                return (
                  <Card
                    key={postulacion.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/perfil-candidato/${candidato.id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <Avatar className="h-14 w-14">
                          <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg truncate">
                            {candidato.usuario.name} {candidato.usuario.lastname}
                          </h3>
                          {candidato.titulo && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <Briefcase className="w-3 h-3" />
                              {candidato.titulo}
                            </p>
                          )}
                          {candidato.ubicacion && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3" />
                              {candidato.ubicacion}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Compatibilidad */}
                      {postulacion.puntuacion_compatibilidad !== null && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Compatibilidad</span>
                            <span className="text-sm font-bold text-primary">
                              {Math.round(postulacion.puntuacion_compatibilidad * 100)}%
                            </span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div
                              className="bg-primary rounded-full h-2 transition-all"
                              style={{
                                width: `${postulacion.puntuacion_compatibilidad * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Vacante */}
                      <Badge variant="secondary" className="mt-3">
                        {postulacion.vacante.titulo}
                      </Badge>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      {/* Contacto */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="truncate">{candidato.usuario.correo}</span>
                        </div>
                        {candidato.usuario.telefono && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span>{candidato.usuario.telefono}</span>
                          </div>
                        )}
                      </div>

                      {/* Habilidades principales */}
                      {candidato.habilidadesCandidato.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                            <GraduationCap className="w-3 h-3" />
                            Principales habilidades
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {candidato.habilidadesCandidato.slice(0, 3).map((hc) => (
                              <Badge
                                key={hc.habilidad.id}
                                variant="outline"
                                className="text-xs"
                              >
                                <Star className={`w-3 h-3 mr-1 ${getNivelColor(hc.nivel)}`} />
                                {hc.habilidad.nombre}
                                <span className="ml-1 text-muted-foreground">
                                  · {getNivelLabel(hc.nivel)}
                                </span>
                              </Badge>
                            ))}
                            {candidato.habilidadesCandidato.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{candidato.habilidadesCandidato.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Lenguajes */}
                      {candidato.lenguajesCandidato.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-2">
                            Lenguajes
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {candidato.lenguajesCandidato.slice(0, 3).map((lc) => (
                              <Badge
                                key={lc.lenguaje.id}
                                variant="outline"
                                className="text-xs"
                              >
                                {lc.lenguaje.nombre}
                                <span className="ml-1 text-muted-foreground">
                                  · {getNivelLabel(lc.nivel)}
                                </span>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === totalPages ||
                        (p >= page - 1 && p <= page + 1)
                    )
                    .map((p, idx, arr) => (
                      <div key={p} className="contents">
                        {idx > 0 && arr[idx - 1] !== p - 1 && (
                          <span className="text-muted-foreground">...</span>
                        )}
                        <Button
                          variant={page === p ? "default" : "outline"}
                          onClick={() => setPage(p)}
                          className="w-10"
                        >
                          {p}
                        </Button>
                      </div>
                    ))}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
