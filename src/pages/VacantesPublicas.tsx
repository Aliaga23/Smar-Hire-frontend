import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Briefcase, Building2, Clock, DollarSign, Users, MapPin } from "lucide-react"
import { Link, useSearchParams } from "react-router-dom"
import api from "@/lib/axios"
import { ModeToggle } from "@/components/mode-toggle"

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
      const [modalidadesData, horariosData, habilidadesData] = await Promise.all([
        api.get('/modalidades').then(res => res.data),
        api.get('/horarios').then(res => res.data),
        api.get('/habilidades').then(res => res.data)
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
          // No es habilidad, buscar en título
          params.append('titulo', searchTerm)
        }
      }
      
      if (selectedModalidad && selectedModalidad !== 'all') params.append('modalidadId', selectedModalidad)
      if (selectedHorario && selectedHorario !== 'all') params.append('horarioId', selectedHorario)
      if (salarioMin) params.append('salarioMin', salarioMin)
      if (salarioMax) params.append('salarioMax', salarioMax)

      const { data } = await api.get(`/vacantes?${params.toString()}`)

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

  
  const formatSalary = (min: number, max: number) => {
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`
  }

  const totalPages = Math.ceil(total / limit)
  const companies = ["TechFlow", "CloudSync", "NeuralX", "Velocity", "Innovate Labs", "InfraScale"]

  return (
    <main className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/95 backdrop-blur-md border-b border-border z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-primary" />
            <div className="text-2xl font-bold text-foreground">SmartHire</div>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-foreground/70 hover:text-foreground transition text-sm font-medium">
              Buscar empleos
            </a>
            <a href="#" className="text-foreground/70 hover:text-foreground transition text-sm font-medium">
              Para empresas
            </a>
            <a href="#" className="text-foreground/70 hover:text-foreground transition text-sm font-medium">
              Recursos
            </a>
          </div>
          <div className="flex items-center gap-3">
            <ModeToggle />
            <Button variant="ghost" className="text-foreground hover:bg-foreground/5" asChild>
              <Link to="/login">Iniciar sesión</Link>
            </Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" asChild>
              <Link to="/signup">Registrarse</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-card/20">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground">Buscar empleos</h1>
              <p className="text-base text-foreground/60">{total} oportunidades disponibles</p>
            </div>

            {/* Advanced Search Box */}
            <div className="bg-background border border-border rounded-xl p-5 shadow-sm space-y-5">
              {/* Main Search */}
              <div className="flex flex-col lg:flex-row gap-3">
                <div className="flex-1 relative" ref={searchInputRef}>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                  <Input
                    placeholder="Buscar por título, habilidades o empresa..."
                    className="h-10 pl-11 bg-background border-border text-foreground placeholder:text-foreground/40 text-sm"
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
                    <Card className="absolute top-full mt-1 w-full z-50 shadow-lg border-border/50 bg-card/95 backdrop-blur-sm">
                      <CardContent className="p-2">
                        {filteredSuggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            className="px-3 py-1.5 hover:bg-primary/10 cursor-pointer rounded-md transition-colors flex items-center gap-2 text-sm text-foreground"
                            onClick={() => selectSuggestion(suggestion)}
                          >
                            <Search className="h-3 w-3 text-primary" />
                            <span>{suggestion}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </div>
                <Button 
                  className="h-10 px-6 bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold"
                  onClick={handleSearch}
                >
                  Buscar
                </Button>
              </div>

              {/* Filters Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground/70">Modalidad</label>
                  <Select value={selectedModalidad} onValueChange={setSelectedModalidad}>
                    <SelectTrigger className="h-9 bg-background border-border text-foreground text-sm">
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {modalidades.map((modalidad) => (
                        <SelectItem key={modalidad.id} value={modalidad.id}>
                          {modalidad.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground/70">Horario</label>
                  <Select value={selectedHorario} onValueChange={setSelectedHorario}>
                    <SelectTrigger className="h-9 bg-background border-border text-foreground text-sm">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {horarios.map((horario) => (
                        <SelectItem key={horario.id} value={horario.id}>
                          {horario.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground/70">Salario mínimo</label>
                  <Input
                    type="number"
                    placeholder="$0"
                    className="h-9 bg-background border-border text-foreground placeholder:text-foreground/40 text-sm"
                    value={salarioMin}
                    onChange={(e) => setSalarioMin(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground/70">Salario máximo</label>
                  <Input
                    type="number"
                    placeholder="Sin límite"
                    className="h-9 bg-background border-border text-foreground placeholder:text-foreground/40 text-sm"
                    value={salarioMax}
                    onChange={(e) => setSalarioMax(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Jobs List */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="space-y-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="border-b border-border animate-pulse">
                  <div className="py-4 px-5">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="h-6 bg-foreground/10 rounded w-3/4"></div>
                        <div className="h-3 bg-foreground/10 rounded w-1/2"></div>
                        <div className="h-12 bg-foreground/10 rounded"></div>
                        <div className="flex gap-2">
                          {[...Array(3)].map((_, j) => (
                            <div key={j} className="h-5 bg-foreground/10 rounded w-16"></div>
                          ))}
                        </div>
                      </div>
                      <div className="h-9 w-28 bg-foreground/10 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {vacantes.map((job, index) => (
                <div
                  key={job.id}
                  className={`group relative border-b border-border hover:bg-card/40 transition-colors ${
                    index === 0 ? "border-t" : ""
                  }`}
                >
                  <div className="py-4 px-5">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      {/* Left: Job Info */}
                      <div className="flex-1 space-y-3">
                        {/* Title and Status */}
                        <div className="flex items-start gap-2 flex-wrap">
                          <h3 className="text-lg lg:text-xl font-bold text-foreground group-hover:text-primary transition">
                            {job.titulo}
                          </h3>
                          <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 uppercase tracking-wide">
                            {job.estado}
                          </span>
                        </div>

                        {/* Company */}
                        <div className="flex items-center gap-2 text-foreground/80">
                          <Building2 className="w-3 h-3 text-foreground/50" />
                          <span className="font-semibold text-sm">{job.empresa.name}</span>
                        </div>

                        {/* Skills Tags */}
                        <div className="flex flex-wrap gap-1.5">
                          {job.habilidadesVacante.slice(0, 5).map((hv, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md bg-foreground/5 text-foreground/70 text-xs font-medium border border-foreground/10"
                            >
                              {hv.habilidad.nombre}
                            </span>
                          ))}
                          {job.habilidadesVacante.length > 5 && (
                            <span className="px-2 py-0.5 rounded-md bg-foreground/5 text-foreground/70 text-xs font-medium border border-foreground/10">
                              +{job.habilidadesVacante.length - 5}
                            </span>
                          )}
                        </div>

                        {/* Meta Info */}
                        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-foreground/60">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-foreground/40 flex-shrink-0" />
                            <span>{job.modalidad.nombre}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-foreground/40 flex-shrink-0" />
                            <span>{job.horario.nombre}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <DollarSign className="w-3 h-3 text-foreground/40 flex-shrink-0" />
                            <span>{formatSalary(job.salario_minimo, job.salario_maximo)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3 h-3 text-foreground/40 flex-shrink-0" />
                            <span>{job._count.postulaciones} postulaciones</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Action Button */}
                      <div className="flex-shrink-0">
                        <Button className="w-full lg:w-auto px-6 h-9 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-sm" asChild>
                          <Link to={`/vacantes/${job.id}`}>Ver detalles</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center gap-2">
              <Button
                variant="outline"
                className="bg-background border-foreground/20 text-foreground hover:bg-foreground/5"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Anterior
              </Button>
              <span className="px-4 py-2 text-foreground/60">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                className="bg-background border-foreground/20 text-foreground hover:bg-foreground/5"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Siguiente
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-foreground/50 mb-12 text-sm uppercase tracking-widest font-semibold">
            Empresas que confían en nosotros
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {companies.map((company) => (
              <div
                key={company}
                className="text-foreground/40 hover:text-foreground/60 transition font-semibold text-base"
              >
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-5xl lg:text-6xl font-bold text-balance">¿Listo para empezar tu próxima etapa?</h2>
          <p className="text-xl text-foreground/60">
            Únete a miles de profesionales que han encontrado sus roles ideales en SmartHire.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="px-8 h-12 bg-primary text-primary-foreground hover:bg-primary/90 text-base" asChild>
              <Link to="/signup">Explorar oportunidades</Link>
            </Button>
            <Button
              variant="outline"
              className="px-8 h-12 border-foreground/20 text-foreground hover:bg-foreground/5 text-base bg-background"
              asChild
            >
              <Link to="/about">Saber más</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="h-5 w-5 text-primary" />
                <span className="text-lg font-bold text-primary">SmartHire</span>
              </div>
              <p className="text-foreground/60 text-sm">
                La plataforma moderna que conecta talento con oportunidades.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide">Producto</h4>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li>
                  <Link to="/vacantes" className="hover:text-foreground transition">
                    Buscar Empleos
                  </Link>
                </li>
                <li>
                  <Link to="/empresas" className="hover:text-foreground transition">
                    Empresas
                  </Link>
                </li>
                <li>
                  <Link to="/register-empresa" className="hover:text-foreground transition">
                    Para Empresas
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide">Compañía</h4>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li>
                  <Link to="/about" className="hover:text-foreground transition">
                    Nosotros
                  </Link>
                </li>
                <li>
                  <Link to="/how-it-works" className="hover:text-foreground transition">
                    Cómo Funciona
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-foreground transition">
                    Contacto
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide">Legal</h4>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li>
                  <Link to="/privacy" className="hover:text-foreground transition">
                    Privacidad
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-foreground transition">
                    Términos
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex justify-between items-center text-sm text-foreground/60">
            <p>© 2025 SmartHire. Todos los derechos reservados.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-foreground transition">
                Twitter
              </a>
              <a href="#" className="hover:text-foreground transition">
                LinkedIn
              </a>
              <a href="#" className="hover:text-foreground transition">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
