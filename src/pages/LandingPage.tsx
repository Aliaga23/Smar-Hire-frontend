import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Briefcase, Users, TrendingUp, Building2, Clock, DollarSign } from "lucide-react"
import { Link } from "react-router-dom"
import { useState, useEffect, useRef } from "react"

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
  const searchInputRef = useRef<HTMLInputElement>(null)

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
      const [vacantesRes, empresasRes, modalidadesRes, horariosRes, habilidadesRes] = await Promise.all([
        fetch('http://localhost:3000/api/vacantes?estado=ABIERTA&limit=4'),
        fetch('http://localhost:3000/api/empresas'),
        fetch('http://localhost:3000/api/modalidades'),
        fetch('http://localhost:3000/api/horarios'),
        fetch('http://localhost:3000/api/habilidades')
      ])

      const [vacantesData, empresasData, modalidadesData, horariosData, habilidadesData] = await Promise.all([
        vacantesRes.json(),
        empresasRes.json(),
        modalidadesRes.json(),
        horariosRes.json(),
        habilidadesRes.json()
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
    { icon: Briefcase, label: "Empleos activos", value: "10,000+" },
    { icon: Building2, label: "Empresas", value: "5,000+" },
    { icon: Users, label: "Candidatos", value: "500K+" },
    { icon: TrendingUp, label: "Contrataciones", value: "50K+" }
  ]

  const categories = [
    "Desarrollo de Software",
    "Diseño",
    "Marketing",
    "Ventas",
    "Recursos Humanos",
    "Finanzas",
    "Ingeniería",
    "Consultoría"
  ]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5 -z-10"></div>
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] -z-10"></div>
        
        <div className="container mx-auto max-w-6xl text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm font-medium">+2,500 nuevos empleos esta semana</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Encuentra tu próximo{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              trabajo ideal
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            La plataforma que conecta talento excepcional con las mejores oportunidades. 
            Más de <span className="font-semibold text-foreground">10,000 empleos</span> esperando por ti.
          </p>
          
          {/* Search Bar */}
          <Card className="max-w-4xl mx-auto shadow-2xl border-primary/10">
            <CardContent className="p-8">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                    <Input 
                      ref={searchInputRef}
                      placeholder="Título del trabajo, habilidades o empresa" 
                      className="pl-12 h-14 text-base border-2 focus:border-primary"
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
                  <Button 
                    size="lg" 
                    className="md:w-auto h-14 px-8 text-base font-semibold shadow-lg hover:shadow-xl transition-shadow"
                    onClick={handleSearch}
                  >
                    <Search className="h-5 w-5 mr-2" />
                    Buscar
                  </Button>
                </div>
                
                <div className="flex flex-col md:flex-row gap-4">
                  <Select value={selectedModalidad} onValueChange={setSelectedModalidad}>
                    <SelectTrigger className="h-12 border-2">
                      <Briefcase className="h-4 w-4 mr-2" />
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
                    <SelectTrigger className="h-12 border-2">
                      <Clock className="h-4 w-4 mr-2" />
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
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                <span className="text-sm text-muted-foreground">Búsquedas populares:</span>
                <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">React</Badge>
                <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">Product Manager</Badge>
                <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">UX Designer</Badge>
                <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">Remote</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 border-y bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center space-y-3 group">
                <div className="inline-flex p-4 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
                <p className="text-4xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">{stat.value}</p>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Empresas Destacadas */}
      <section className="py-20 px-4 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto max-w-6xl space-y-12">
          <div className="text-center space-y-4">
            <Badge variant="outline" className="text-sm font-semibold px-4 py-1">EMPRESAS</Badge>
            <h2 className="text-4xl md:text-5xl font-bold">Empresas que confían en nosotros</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Las mejores organizaciones publicando oportunidades laborales
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-16 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {empresas.map((empresa) => (
                <Card key={empresa.id} className="group hover:shadow-xl hover:border-primary/30 transition-all duration-300 cursor-pointer">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-center h-16">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="font-bold text-base group-hover:text-primary transition-colors line-clamp-1">
                        {empresa.name}
                      </h3>
                      {empresa.area && (
                        <p className="text-xs text-muted-foreground line-clamp-1">{empresa.area}</p>
                      )}
                      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2">
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          <span>{empresa._count.vacantes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{empresa._count.reclutadores}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center">
            <Button variant="outline" size="lg" asChild>
              <Link to="/empresas">Ver todas las empresas</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl space-y-12">
          <div className="text-center space-y-4">
            <Badge variant="outline" className="text-sm font-semibold px-4 py-1">OPORTUNIDADES</Badge>
            <h2 className="text-4xl md:text-5xl font-bold">Empleos destacados</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Las mejores oportunidades laborales seleccionadas especialmente para ti
            </p>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6 space-y-4">
                    <div className="h-20 bg-muted rounded"></div>
                    <div className="h-16 bg-muted rounded"></div>
                    <div className="h-12 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {featuredJobs.map((job) => (
                <Card key={job.id} className="relative group hover:shadow-2xl hover:border-primary/50 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full">
                  <div className="absolute top-4 right-4 z-10">
                    <Badge variant="secondary" className="font-semibold">{job.modalidad.nombre}</Badge>
                  </div>
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                        <Briefcase className="h-7 w-7 text-primary" />
                      </div>
                      <div className="space-y-2 flex-1">
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">{job.titulo}</CardTitle>
                        <p className="text-base font-semibold text-primary">{job.empresa.name}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1">
                    <div className="space-y-5 flex-1">
                      <div className="flex flex-wrap gap-2">
                        {job.habilidadesVacante.slice(0, 3).map((hv) => (
                          <Badge key={hv.habilidad.id} variant="outline" className="font-medium">
                            {hv.habilidad.nombre}
                          </Badge>
                        ))}
                        {job.habilidadesVacante.length > 3 && (
                          <Badge variant="outline" className="font-medium">
                            +{job.habilidadesVacante.length - 3}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3 text-sm">
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <Clock className="h-4 w-4 flex-shrink-0" />
                          <span>{job.horario.nombre}</span>
                        </div>
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <DollarSign className="h-4 w-4 flex-shrink-0" />
                          <span className="font-semibold text-foreground">
                            {formatSalary(job.salario_minimo, job.salario_maximo)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <Users className="h-4 w-4 flex-shrink-0" />
                          <span>{job._count.postulaciones} postulaciones</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button className="w-full group-hover:shadow-lg transition-shadow mt-5" size="lg" asChild>
                      <Link to={`/vacantes/${job.id}`}>Ver detalles y aplicar</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center">
            <Button variant="outline" size="lg" asChild>
              <Link to="/vacantes">Ver todos los empleos</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto max-w-6xl space-y-12">
          <div className="text-center space-y-4">
            <Badge variant="outline" className="text-sm font-semibold px-4 py-1">CATEGORÍAS</Badge>
            <h2 className="text-4xl md:text-5xl font-bold">Explora por categoría</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Encuentra oportunidades en tu área de especialización
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Card key={category} className="group hover:bg-primary/5 hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer">
                <CardContent className="p-6 text-center">
                  <p className="font-semibold group-hover:text-primary transition-colors">{category}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <Card className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground border-0 shadow-2xl">
            <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
            <CardContent className="relative p-12 md:p-16 text-center space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold">¿Listo para comenzar?</h2>
                <p className="text-xl md:text-2xl opacity-95 max-w-2xl mx-auto">
                  Únete como <span className="font-bold">candidato</span> o registra tu <span className="font-bold">empresa</span> hoy mismo
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button size="lg" variant="secondary" className="h-14 px-8 text-base font-semibold shadow-xl hover:shadow-2xl transition-shadow" asChild>
                  <Link to="/signup">
                    Buscar Empleo
                    <span className="ml-2">→</span>
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 text-base font-semibold bg-transparent border-2 border-primary-foreground/30 hover:bg-primary-foreground/10 text-primary-foreground" asChild>
                  <Link to="/register-empresa">Registrar Empresa</Link>
                </Button>
              </div>
              <p className="text-sm opacity-80 pt-4">
                Sin tarjeta de crédito • Gratis para siempre • Configuración en 2 minutos
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4 mt-auto">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Para candidatos</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/jobs" className="hover:text-primary">Buscar empleos</Link></li>
                <li><Link to="/profile" className="hover:text-primary">Crear perfil</Link></li>
                <li><Link to="/resources" className="hover:text-primary">Recursos</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Para empresas</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/post-job" className="hover:text-primary">Publicar empleo</Link></li>
                <li><Link to="/pricing" className="hover:text-primary">Planes</Link></li>
                <li><Link to="/solutions" className="hover:text-primary">Soluciones</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Compañía</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/about" className="hover:text-primary">Nosotros</Link></li>
                <li><Link to="/blog" className="hover:text-primary">Blog</Link></li>
                <li><Link to="/contact" className="hover:text-primary">Contacto</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/privacy" className="hover:text-primary">Privacidad</Link></li>
                <li><Link to="/terms" className="hover:text-primary">Términos</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 SmartHire. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
