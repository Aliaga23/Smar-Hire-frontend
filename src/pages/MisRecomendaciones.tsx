import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { CandidatoNavbar } from "@/components/CandidatoNavbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ArrowLeft, Loader2, Lightbulb, ExternalLink, BookOpen, TrendingUp, Building2, Briefcase, Info, ChevronDown } from "lucide-react"
import { getRecomendacionesPorPostulacion, type PostulacionConRecomendaciones } from "@/services/candidato"
import { toast } from "sonner"

export default function MisRecomendaciones() {
  const navigate = useNavigate()
  const [postulaciones, setPostulaciones] = useState<PostulacionConRecomendaciones[]>([])
  const [loading, setLoading] = useState(true)
  const [openRecomendaciones, setOpenRecomendaciones] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchRecomendaciones()
  }, [])

  const fetchRecomendaciones = async () => {
    try {
      setLoading(true)
      const data = await getRecomendacionesPorPostulacion()
      setPostulaciones(data.postulaciones || [])
    } catch (error) {
      console.error("Error al cargar recomendaciones:", error)
      toast.error("Error al cargar las recomendaciones")
    } finally {
      setLoading(false)
    }
  }

  const getNivelColor = (nivel: number) => {
    if (nivel >= 8) return "text-green-600"
    if (nivel >= 5) return "text-yellow-600"
    return "text-orange-600"
  }

  const getNivelTexto = (nivel: number) => {
    if (nivel >= 8) return "Avanzado"
    if (nivel >= 5) return "Intermedio"
    return "Básico"
  }

  return (
    <>
      <CandidatoNavbar />
      <main className="container mx-auto p-3 sm:p-6 min-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold">Recomendaciones Personalizadas</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Mejora tus habilidades con cursos sugeridos por IA
            </p>
          </div>
          <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => navigate("/dashboard-candidato")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>

        {/* Info Alert */}
        <Alert className="mb-4 sm:mb-6 border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600 flex-shrink-0" />
          <AlertDescription className="text-xs sm:text-sm text-blue-900">
            Estas recomendaciones se generan automáticamente con IA cuando un reclutador ejecuta el algoritmo de matching para una vacante.
            Los cursos sugeridos te ayudarán a cubrir las habilidades que necesitas desarrollar.
          </AlertDescription>
        </Alert>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Recomendaciones */}
        {!loading && (
          <>
            {postulaciones.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No tienes recomendaciones aún</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Las recomendaciones se generan automáticamente cuando te postulas a vacantes y el reclutador ejecuta el matching.
                  </p>
                  <Button onClick={() => navigate("/vacantes")}>
                    <Briefcase className="h-4 w-4 mr-2" />
                    Ver Vacantes Disponibles
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {postulaciones.map((postulacion) => (
                  <Card key={postulacion.postulacion.id} className="overflow-hidden">
                    {/* Vacante Header */}
                    <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row items-start gap-4 sm:justify-between">
                        <div className="flex-1 w-full sm:w-auto">
                          <div className="flex items-start gap-3">
                            <Briefcase className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                            <div>
                              <h3 className="text-lg sm:text-xl font-bold mb-1">
                                {postulacion.vacante.titulo}
                              </h3>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Building2 className="h-4 w-4" />
                                  {postulacion.vacante.empresa.name}
                                </span>
                                <span>{postulacion.vacante.modalidad.nombre}</span>
                                <span>{postulacion.vacante.horario.nombre}</span>
                              </div>
                              <div className="mt-2 flex flex-wrap gap-2">
                                <Badge variant="secondary">
                                  ${postulacion.vacante.salario_minimo.toLocaleString()} - ${postulacion.vacante.salario_maximo.toLocaleString()}
                                </Badge>
                                <Badge variant="outline">
                                  {postulacion.vacante.empresa.area}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-start sm:items-end gap-2">
                          <Badge className="text-sm px-3 py-1" variant={(postulacion.postulacion.puntuacion_compatibilidad || 0) >= 70 ? "default" : "secondary"}>
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {postulacion.postulacion.puntuacion_compatibilidad ? (postulacion.postulacion.puntuacion_compatibilidad * 100).toFixed(1) : '0.0'}% compatible
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Postulado el {new Date(postulacion.postulacion.creado_en).toLocaleDateString("es-ES")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-4 sm:p-6">
                      {postulacion.recomendaciones.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No hay recomendaciones específicas para esta vacante
                        </p>
                      ) : (
                        <Collapsible 
                          open={openRecomendaciones[postulacion.postulacion.id]}
                          onOpenChange={(isOpen) => 
                            setOpenRecomendaciones(prev => ({ ...prev, [postulacion.postulacion.id]: isOpen }))
                          }
                        >
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" className="w-full justify-between p-4 h-auto">
                              <div className="flex items-center gap-2">
                                <Lightbulb className="h-4 w-4 text-primary" />
                                <span className="text-sm font-semibold">
                                  {postulacion.totalRecomendaciones} {postulacion.totalRecomendaciones === 1 ? "Recomendación" : "Recomendaciones"}
                                </span>
                              </div>
                              <ChevronDown className={`h-4 w-4 transition-transform ${openRecomendaciones[postulacion.postulacion.id] ? 'rotate-180' : ''}`} />
                            </Button>
                          </CollapsibleTrigger>
                          
                          <CollapsibleContent className="pt-4">
                            <div className="space-y-6">

                          {postulacion.recomendaciones.map((recomendacion) => (
                            <div key={recomendacion.id} className="border rounded-lg p-4 space-y-4">
                              {/* Habilidades que necesitas mejorar */}
                              {Array.isArray(recomendacion.habilidadesDiferencia) && recomendacion.habilidadesDiferencia.length > 0 && (
                                <div>
                                  <h5 className="font-medium text-sm mb-3 flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4" />
                                    Habilidades a desarrollar:
                                  </h5>
                                  <div className="flex flex-wrap gap-2 mb-3">
                                    {recomendacion.habilidadesDiferencia.map((hd) => (
                                      <Badge key={hd.id} variant="outline" className="flex items-center gap-1">
                                        {hd.habilidad.nombre}
                                        <span className="text-xs">
                                          (Gap: {Math.abs(hd.diferencia)} niveles)
                                        </span>
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Mensaje de IA */}
                              <Alert>
                                <AlertDescription className="text-sm">
                                  {recomendacion.mensaje}
                                </AlertDescription>
                              </Alert>

                              {/* Cursos */}
                              {recomendacion.cursos.length > 0 && (
                                <div className="space-y-3">
                                  <h5 className="text-sm font-semibold flex items-center gap-2">
                                    <BookOpen className="h-4 w-4" />
                                    Cursos Sugeridos ({recomendacion.cursos.length})
                                  </h5>
                                  {recomendacion.cursos.map((rc) => (
                                    <div
                                      key={rc.id}
                                      className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                                    >
                                      <div className="flex-1 w-full sm:w-auto">
                                        <p className="font-medium text-sm">{rc.curso.nombre}</p>
                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                          <Badge variant="secondary" className="text-xs">
                                            {rc.curso.proveedor}
                                          </Badge>
                                          <Badge variant="secondary" className="text-xs">
                                            Nivel: {getNivelTexto(rc.curso.nivel)}
                                          </Badge>
                                          <span className={`text-xs font-medium ${getNivelColor(rc.curso.nivel)}`}>
                                            {rc.curso.nivel}/10
                                          </span>
                                          <Badge variant="outline" className="text-xs">
                                            {rc.curso.duracion}
                                          </Badge>
                                        </div>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="w-full sm:w-auto flex-shrink-0"
                                        onClick={() => window.open(rc.curso.url, "_blank")}
                                      >
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        Ver Curso
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Fecha de recomendación */}
                              <div className="text-xs text-muted-foreground pt-2 border-t">
                                Generado el {new Date(recomendacion.creado_en).toLocaleDateString("es-ES", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric"
                                })}
                              </div>
                            </div>
                          ))}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </>
  )
}
