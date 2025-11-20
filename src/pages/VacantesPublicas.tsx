import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Briefcase, Building2, Clock, DollarSign, Users, Filter, X } from "lucide-react"
import { Link, useSearchParams } from "react-router-dom"

interface Vacante {
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
  habilidadesVacante: Array<{
    nivel: number
    requerido: string
    habilidad: {
      id: string
      nombre: string
    }
  }>
  _count: {
    postulaciones: number
  }
}

interface Modalidad {
  id: string
  nombre: string
}

interface Horario {
  id: string
  nombre: string
}

interface Habilidad {
  id: string
  nombre: string
}

export default function VacantesPublicas() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [vacantes, setVacantes] = useState<Vacante[]>([])
  const [modalidades, setModalidades] = useState<Modalidad[]>([])
  const [horarios, setHorarios] = useState<Horario[]>([])
  const [habilidades, setHabilidades] = useState<Habilidad[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const limit = 12

  // Filtros
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [selectedModalidad, setSelectedModalidad] = useState(searchParams.get('modalidadId') || '')
  const [selectedHorario, setSelectedHorario] = useState(searchParams.get('horarioId') || '')
  const [salarioMin, setSalarioMin] = useState(searchParams.get('salarioMin') || '')
  const [salarioMax, setSalarioMax] = useState(searchParams.get('salarioMax') || '')
  
  // Autocompletado
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])
  const searchInputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchCatalogos()
  }, [])

  useEffect(() => {
    fetchVacantes()
  }, [page, searchParams])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchInputRef.current && 
        !searchInputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const fetchCatalogos = async () => {
    try {
      const [modalidadesRes, horariosRes, habilidadesRes] = await Promise.all([
        fetch('http://localhost:3000/api/modalidades'),
        fetch('http://localhost:3000/api/horarios'),
        fetch('http://localhost:3000/api/habilidades')
      ])

      const [modalidadesData, horariosData, habilidadesData] = await Promise.all([
        modalidadesRes.json(),
        horariosRes.json(),
        habilidadesRes.json()
      ])

      setModalidades(modalidadesData)
      setHorarios(horariosData)
      setHabilidades(habilidadesData)
    } catch (error) {
      console.error('Error fetching catalogos:', error)
    }
  }

  const fetchVacantes = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        estado: 'ABIERTA',
        page: page.toString(),
        limit: limit.toString()
      })

      // Si hay término de búsqueda, verificar si es una habilidad
      if (searchTerm) {
        const habilidadEncontrada = habilidades.find(
          h => h.nombre.toLowerCase() === searchTerm.toLowerCase()
        )
        
        if (habilidadEncontrada) {
          // Es una habilidad, usar filtro de habilidad
          params.append('habilidadId', habilidadEncontrada.id)
        } else {
          // No es habilidad, buscar en título/descripción
          params.append('search', searchTerm)
        }
      }
      
      if (selectedModalidad && selectedModalidad !== 'all') params.append('modalidadId', selectedModalidad)
      if (selectedHorario && selectedHorario !== 'all') params.append('horarioId', selectedHorario)
      if (salarioMin) params.append('salarioMin', salarioMin)
      if (salarioMax) params.append('salarioMax', salarioMax)

      const response = await fetch(`http://localhost:3000/api/vacantes?${params.toString()}`)
      const data = await response.json()

      setVacantes(data.data || [])
      setTotal(data.pagination?.total || 0)
    } catch (error) {
      console.error('Error fetching vacantes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchInputChange = (value: string) => {
    setSearchTerm(value)
    
    if (value.length >= 2) {
      // Filtrar habilidades que coincidan
      const filtered = habilidades
        .filter(h => h.nombre.toLowerCase().includes(value.toLowerCase()))
        .map(h => h.nombre)
        .slice(0, 5)
      
      setFilteredSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setShowSuggestions(false)
    }
  }

  const selectSuggestion = (suggestion: string) => {
    setSearchTerm(suggestion)
    setShowSuggestions(false)
    searchInputRef.current?.focus()
  }

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchTerm) params.append('search', searchTerm)
    if (selectedModalidad && selectedModalidad !== 'all') params.append('modalidadId', selectedModalidad)
    if (selectedHorario && selectedHorario !== 'all') params.append('horarioId', selectedHorario)
    if (salarioMin) params.append('salarioMin', salarioMin)
    if (salarioMax) params.append('salarioMax', salarioMax)
    
    setSearchParams(params)
    setPage(1)
    setShowSuggestions(false)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedModalidad('')
    setSelectedHorario('')
    setSalarioMin('')
    setSalarioMax('')
    setSearchParams(new URLSearchParams())
    setPage(1)
    setShowSuggestions(false)
  }

  const formatSalary = (min: number, max: number) => {
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`
  }

  const totalPages = Math.ceil(total / limit)
  const hasActiveFilters = searchTerm || selectedModalidad || selectedHorario || salarioMin || salarioMax

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">SmartHire</span>
            </Link>
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link to="/login">Iniciar sesión</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">Registrarse</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <section className="py-12 px-4 border-b bg-muted/30">
        <div className="container mx-auto max-w-6xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold">Buscar empleos</h1>
              <p className="text-muted-foreground mt-2">
                {total} oportunidades disponibles
              </p>
            </div>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Limpiar filtros
              </Button>
            )}
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Búsqueda principal */}
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                    <Input
                      ref={searchInputRef}
                      placeholder="Buscar por título, habilidades o empresa..."
                      className="pl-12 h-12"
                      value={searchTerm}
                      onChange={(e) => handleSearchInputChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSearch()
                          setShowSuggestions(false)
                        } else if (e.key === 'Escape') {
                          setShowSuggestions(false)
                        }
                      }}
                      onFocus={() => {
                        if (searchTerm.length >= 2 && filteredSuggestions.length > 0) {
                          setShowSuggestions(true)
                        }
                      }}
                    />
                    {showSuggestions && filteredSuggestions.length > 0 && (
                      <Card className="absolute top-full mt-1 w-full z-50 shadow-lg">
                        <CardContent className="p-2">
                          {filteredSuggestions.map((suggestion, index) => (
                            <div
                              key={index}
                              className="px-4 py-2 hover:bg-muted cursor-pointer rounded-md transition-colors flex items-center gap-2"
                              onClick={() => selectSuggestion(suggestion)}
                            >
                              <Search className="h-4 w-4 text-muted-foreground" />
                              <span>{suggestion}</span>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                  <Button size="lg" onClick={handleSearch}>
                    <Search className="h-5 w-5 mr-2" />
                    Buscar
                  </Button>
                </div>

                {/* Filtros adicionales */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Select value={selectedModalidad} onValueChange={setSelectedModalidad}>
                    <SelectTrigger>
                      <Briefcase className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Modalidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {modalidades.map((m) => (
                        <SelectItem key={m.id} value={m.id}>{m.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedHorario} onValueChange={setSelectedHorario}>
                    <SelectTrigger>
                      <Clock className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Horario" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {horarios.map((h) => (
                        <SelectItem key={h.id} value={h.id}>{h.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    type="number"
                    placeholder="Salario mínimo"
                    value={salarioMin}
                    onChange={(e) => setSalarioMin(e.target.value)}
                  />

                  <Input
                    type="number"
                    placeholder="Salario máximo"
                    value={salarioMax}
                    onChange={(e) => setSalarioMax(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Resultados */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl space-y-8">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6 space-y-4">
                    <div className="h-20 bg-muted rounded"></div>
                    <div className="h-16 bg-muted rounded"></div>
                    <div className="h-12 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : vacantes.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No se encontraron vacantes</h3>
                <p className="text-muted-foreground mb-4">
                  Intenta ajustar los filtros de búsqueda
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Limpiar filtros
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vacantes.map((vacante) => (
                  <Card key={vacante.id} className="group hover:shadow-xl hover:border-primary/30 transition-all duration-300 flex flex-col h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Badge variant="secondary">{vacante.modalidad.nombre}</Badge>
                        <Badge variant="outline">{vacante.estado}</Badge>
                      </div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                        {vacante.titulo}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-primary">{vacante.empresa.name}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-1">
                      <div className="space-y-4 flex-1">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {vacante.descripcion}
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {vacante.habilidadesVacante.slice(0, 3).map((hv) => (
                            <Badge key={hv.habilidad.id} variant="outline" className="text-xs">
                              {hv.habilidad.nombre}
                            </Badge>
                          ))}
                          {vacante.habilidadesVacante.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{vacante.habilidadesVacante.length - 3}
                            </Badge>
                          )}
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{vacante.horario.nombre}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <DollarSign className="h-4 w-4" />
                            <span className="font-semibold text-foreground">
                              {formatSalary(vacante.salario_minimo, vacante.salario_maximo)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>{vacante._count.postulaciones} postulaciones</span>
                          </div>
                        </div>
                      </div>

                      <Button className="w-full mt-4" asChild>
                        <Link to={`/vacantes/${vacante.id}`}>Ver detalles</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground px-4">
                    Página {page} de {totalPages}
                  </span>
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
        </div>
      </section>
    </div>
  )
}
