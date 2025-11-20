import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { CandidatoNavbar } from "@/components/CandidatoNavbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Briefcase, MapPin, DollarSign, Clock, Building2, Search, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react"
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

  const vacantesFiltradas = vacantes.filter(v => 
    v.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
    v.empresa?.name.toLowerCase().includes(busqueda.toLowerCase())
  )

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

        {/* Buscador */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título o empresa..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

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
                return (
                  <Card key={vacante.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-xl">{vacante.titulo}</CardTitle>
                            {postulado && (
                              <Badge variant="secondary" className="bg-green-100 text-green-700">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Ya postulado
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="flex items-center gap-4 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Building2 className="h-4 w-4" />
                              {vacante.empresa?.name || "Empresa"}
                            </span>
                            {vacante.empresa?.area && (
                              <span className="text-xs">• {vacante.empresa.area}</span>
                            )}
                          </CardDescription>
                        </div>
                        <Badge variant={vacante.estado === "ABIERTA" ? "default" : "secondary"}>
                          {vacante.estado}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Descripción */}
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {vacante.descripcion}
                      </p>

                      {/* Info adicional */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {vacante.modalidad && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{vacante.modalidad.nombre}</span>
                          </div>
                        )}
                        {vacante.horario && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{vacante.horario.nombre}</span>
                          </div>
                        )}
                        {(vacante.salario_minimo || vacante.salario_maximo) && (
                          <div className="flex items-center gap-2 col-span-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {vacante.salario_minimo && vacante.salario_maximo
                                ? `$${vacante.salario_minimo.toLocaleString()} - $${vacante.salario_maximo.toLocaleString()}`
                                : vacante.salario_minimo
                                ? `Desde $${vacante.salario_minimo.toLocaleString()}`
                                : `Hasta $${vacante.salario_maximo?.toLocaleString()}`}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Botón de postulación */}
                      <div className="flex justify-end pt-2">
                        {postulado ? (
                          <Button variant="outline" disabled>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Ya te postulaste
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handlePostular(vacante.id)}
                            disabled={postulando === vacante.id || vacante.estado !== "ABIERTA"}
                          >
                            {postulando === vacante.id ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Postulando...
                              </>
                            ) : (
                              <>
                                <Briefcase className="h-4 w-4 mr-2" />
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
