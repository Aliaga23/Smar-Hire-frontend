import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Clock, DollarSign, ChevronRight, MapPin, Briefcase } from "lucide-react"
import { Link } from "react-router-dom"
import { useState, useEffect, useRef } from "react"
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

interface Empresa {
  id: string
  name: string
  area?: string
  descripcion?: string
  _count: {
    reclutadores: number
    vacantes: number
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

export default function LandingPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedModalidad, setSelectedModalidad] = useState<string>("")
  const [selectedHorario, setSelectedHorario] = useState<string>("")
  const [featuredJobs, setFeaturedJobs] = useState<Vacante[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [modalidades, setModalidades] = useState<Modalidad[]>([])
  const [horarios, setHorarios] = useState<Horario[]>([])
  const [habilidades, setHabilidades] = useState<Habilidad[]>([])
  const [loading, setLoading] = useState(true)
  
  // Autocompletado
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])
  const searchInputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const fetchData = async () => {
    try {
      const [vacantesData, empresasData, modalidadesData, horariosData, habilidadesData] = await Promise.all([
        api.get('/vacantes?estado=ABIERTA&limit=4').then(res => res.data),
        api.get('/empresas').then(res => res.data),
        api.get('/modalidades').then(res => res.data),
        api.get('/horarios').then(res => res.data),
        api.get('/habilidades').then(res => res.data)
      ])

      setFeaturedJobs(vacantesData.data || [])
      setEmpresas(empresasData.slice(0, 8))
      setModalidades(modalidadesData)
      setHorarios(horariosData)
      setHabilidades(habilidadesData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchInputChange = (value: string) => {
    setSearchTerm(value)
    
    if (value.length >= 2) {
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
    
    if (selectedModalidad) params.append('modalidadId', selectedModalidad)
    if (selectedHorario) params.append('horarioId', selectedHorario)
    
    setShowSuggestions(false)
    window.location.href = `/vacantes?${params.toString()}`
  }

  const formatSalary = (min: number, max: number) => {
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`
  }

  const stats = [
    { label: "Empleos Activos", value: `${featuredJobs.length * 100}+` },
    { label: "Empresas", value: `${empresas.length * 50}+` },
    { label: "Colocaciones", value: "10k+" },
    { label: "Tasa de Éxito", value: "94%" },
  ]

  return (
    <main className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Briefcase className="h-6 w-6 text-primary" />
              <span className="text-2xl font-bold text-primary">SmartHire</span>
            </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to="/vacantes" className="text-foreground/70 hover:text-foreground transition">
              Buscar Empleos
            </Link>
            <Link to="/empresas" className="text-foreground/70 hover:text-foreground transition">
              Empresas
            </Link>
            <Link to="/register-empresa" className="text-foreground/70 hover:text-foreground transition">
              Para Empresas
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <ModeToggle />
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to="/login">Iniciar Sesión</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold text-balance leading-tight">
                  Encuentra tu <span className="text-primary">Carrera Ideal</span>
                </h1>
                <p className="text-xl text-foreground/70 text-balance leading-relaxed">
                  Conecta con empresas que construyen el futuro. Descubre roles que se alinean con tus habilidades y ambiciones usando IA.
                </p>
              </div>

              {/* Search Bar */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative" ref={searchInputRef}>
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/50" />
                    <Input
                      placeholder="Título del trabajo o habilidad..."
                      className="pl-12 h-12 bg-card border-border text-foreground placeholder:text-foreground/50"
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
                              className="px-4 py-2 hover:bg-primary/10 cursor-pointer rounded-md transition-colors flex items-center gap-2"
                              onClick={() => selectSuggestion(suggestion)}
                            >
                              <Search className="h-4 w-4 text-primary" />
                              <span>{suggestion}</span>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                  <Button 
                    className="h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={handleSearch}
                  >
                    Buscar Empleos
                  </Button>
                </div>
                
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Select value={selectedModalidad} onValueChange={setSelectedModalidad}>
                    <SelectTrigger className="h-10 bg-card/50 border-border/50">
                      <MapPin className="h-4 w-4 mr-2 text-foreground/50" />
                      <SelectValue placeholder="Modalidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las modalidades</SelectItem>
                      {modalidades.map((modalidad) => (
                        <SelectItem key={modalidad.id} value={modalidad.id}>
                          {modalidad.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedHorario} onValueChange={setSelectedHorario}>
                    <SelectTrigger className="h-10 bg-card/50 border-border/50">
                      <Clock className="h-4 w-4 mr-2 text-foreground/50" />
                      <SelectValue placeholder="Horario" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los horarios</SelectItem>
                      {horarios.map((horario) => (
                        <SelectItem key={horario.id} value={horario.id}>
                          {horario.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <p className="text-sm text-foreground/50">
                  Popular: {habilidades.slice(0, 3).map(h => h.nombre).join(', ')}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, i) => (
                  <div key={i} className="p-4 rounded-lg bg-card/50 border border-border/50">
                    <div className="text-2xl font-bold text-primary">{stat.value}</div>
                    <div className="text-sm text-foreground/60">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative hidden lg:block -mt-8">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 to-blue-800/20 dark:from-primary/20 dark:to-accent/20 rounded-3xl blur-3xl" />
              <div className="relative space-y-3">
                {featuredJobs.slice(0, 3).map((job, i) => (
                  <div
                    key={job.id || i}
                    className="p-4 rounded-lg bg-card/70 border-border/50 backdrop-blur-sm hover:border-primary/50 transition border"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="space-y-1 flex-1">
                        <div className="font-semibold text-foreground text-sm">{job.titulo}</div>
                        <div className="text-xs text-foreground/60">{job.empresa?.name}</div>
                      </div>
                      <Briefcase className="w-4 h-4 text-primary flex-shrink-0" />
                    </div>
                    <div className="flex gap-4 pt-2 border-t border-border/50">
                      <div className="flex items-center gap-1.5 text-xs text-foreground/60">
                        <MapPin className="w-3 h-3" />
                        <span>{job.modalidad?.nombre}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-foreground/60">
                        <DollarSign className="w-3 h-3" />
                        <span>${Math.round(job.salario_minimo / 1000)}k+</span>
                      </div>
                    </div>
                  </div>
                ))}
                {loading && [...Array(3)].map((_, i) => (
                  <div key={i} className="p-4 rounded-lg bg-card/70 border-border/50 backdrop-blur-sm animate-pulse border">
                    <div className="flex items-start justify-between mb-2">
                      <div className="space-y-1 flex-1">
                        <div className="h-3 bg-foreground/10 rounded w-3/4" />
                        <div className="h-2.5 bg-foreground/10 rounded w-1/2" />
                      </div>
                      <Briefcase className="w-4 h-4 text-primary flex-shrink-0" />
                    </div>
                    <div className="flex gap-4 pt-2 border-t border-border/50">
                      <div className="flex items-center gap-1.5 text-xs text-foreground/60">
                        <MapPin className="w-3 h-3" />
                        <span>Remote</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-foreground/60">
                        <DollarSign className="w-3 h-3" />
                        <span>130k+</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-16">
            <div className="space-y-2">
              <h2 className="text-5xl font-bold text-foreground">Oportunidades Destacadas</h2>
              <p className="text-lg text-foreground/60">Roles seleccionados de empresas líderes</p>
            </div>
            <Button
              variant="outline"
              className="hidden sm:flex gap-2 bg-background border-foreground/20 text-foreground hover:bg-foreground/5"
              onClick={() => window.location.href = '/vacantes'}
            >
              Ver Todos <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="px-6 py-6 rounded-lg border border-border/50 bg-background/40 animate-pulse">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="h-6 bg-foreground/10 rounded w-1/3 mb-3"></div>
                      <div className="h-4 bg-foreground/10 rounded w-1/4 mb-4"></div>
                      <div className="flex gap-6">
                        <div className="h-4 bg-foreground/10 rounded w-24"></div>
                        <div className="h-4 bg-foreground/10 rounded w-24"></div>
                        <div className="h-4 bg-foreground/10 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="h-10 w-20 bg-foreground/10 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {featuredJobs.map((job, index) => (
                <div
                  key={job.id}
                  className={`group px-6 py-6 rounded-lg border border-border/50 transition-all hover:border-border hover:shadow-sm cursor-pointer ${
                    index < 2 ? "bg-background" : "bg-background/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-foreground">{job.titulo}</h3>
                        {index < 2 && (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/30">
                            Destacado
                          </span>
                        )}
                      </div>
                      <p className="text-base text-foreground/70 font-medium mb-4">{job.empresa.name}</p>

                      <div className="flex flex-wrap gap-6 text-sm">
                        <div className="flex items-center gap-2 text-foreground/60">
                          <MapPin className="w-4 h-4 flex-shrink-0 text-foreground/40" />
                          <span>{job.modalidad.nombre}</span>
                        </div>
                        <div className="flex items-center gap-2 text-foreground/60">
                          <DollarSign className="w-4 h-4 flex-shrink-0 text-foreground/40" />
                          <span>{formatSalary(job.salario_minimo, job.salario_maximo)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-foreground/60">
                          <Clock className="w-4 h-4 flex-shrink-0 text-foreground/40" />
                          <span>{job.horario.nombre}</span>
                        </div>
                      </div>
                    </div>

                    <Button className="px-6 h-10 flex-shrink-0 bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                      <Link to="/login">Ver</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trust Section - Companies */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-foreground/60 mb-12 text-sm uppercase tracking-wide">
            Empresas que confían en nosotros
          </p>
          {loading ? (
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-6 w-24 bg-foreground/10 rounded animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
              {empresas.slice(0, 6).map((empresa) => (
                <div
                  key={empresa.id}
                  className="text-foreground/40 hover:text-foreground/60 transition font-semibold text-lg cursor-pointer"
                >
                  {empresa.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/10 to-accent/10 border-t border-border">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl lg:text-5xl font-bold text-balance">¿Listo para Encontrar tu Próximo Rol?</h2>
          <p className="text-xl text-foreground/70">
            Únete a miles de profesionales que han encontrado su empleo ideal en SmartHire.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="px-8 h-12 bg-primary text-primary-foreground hover:bg-primary/90 text-base" asChild>
              <Link to="/signup">
                Explorar Empleos
              </Link>
            </Button>
            <Button
              variant="outline"
              className="px-8 h-12 border-border text-foreground hover:bg-card text-base bg-transparent"
              asChild
            >
              <Link to="/register-empresa">Registrar Empresa</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
              <Briefcase className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold text-primary">SmartHire</span>
            </div>
              <p className="text-foreground/60 text-sm">La plataforma moderna que conecta talento con oportunidades.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Producto</h4>
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
              <h4 className="font-semibold mb-4">Compañía</h4>
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
              <h4 className="font-semibold mb-4">Legal</h4>
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
          <div className="border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-foreground/60">
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
