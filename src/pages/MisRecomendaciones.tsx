import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { CandidatoNavbar } from "@/components/CandidatoNavbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Loader2, Lightbulb, ExternalLink, BookOpen, TrendingUp, Building2, Briefcase, Info } from "lucide-react"
import { getRecomendaciones, type Recomendacion } from "@/services/candidato"
import { toast } from "sonner"

export default function MisRecomendaciones() {
  const navigate = useNavigate()
  const [recomendaciones, setRecomendaciones] = useState<Recomendacion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecomendaciones()
  }, [])

  const fetchRecomendaciones = async () => {
    try {
      setLoading(true)
      const data = await getRecomendaciones()
      // El backend devuelve { total, recomendaciones }
      setRecomendaciones(data.recomendaciones || [])
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
      <main className="container mx-auto p-6 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Recomendaciones Personalizadas</h1>
            <p className="text-muted-foreground mt-1">
              Mejora tus habilidades con cursos sugeridos por IA
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/dashboard-candidato")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>

        {/* Info Alert */}
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm text-blue-900">
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
            {recomendaciones.length === 0 ? (
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
                {recomendaciones.map((recomendacion) => (
                  <Card key={recomendacion.id} className="border-l-4 border-l-primary">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg">
                              Mejorar: {recomendacion.habilidadesDiferencia.habilidad.nombre}
                            </CardTitle>
                          </div>
                          <CardDescription className="flex items-center gap-4 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Building2 className="h-4 w-4" />
                              {recomendacion.vacante.empresa.name}
                            </span>
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-4 w-4" />
                              {recomendacion.vacante.titulo}
                            </span>
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          Gap: {Math.abs(recomendacion.habilidadesDiferencia.diferencia)} niveles
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Mensaje personalizado de IA */}
                      <Alert>
                        <AlertDescription className="text-sm">
                          {recomendacion.mensaje}
                        </AlertDescription>
                      </Alert>

                      {/* Cursos recomendados */}
                      {recomendacion.cursos.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            Cursos Sugeridos
                          </h4>
                          {recomendacion.cursos.map((rc) => (
                            <div
                              key={rc.id}
                              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                            >
                              <div className="flex-1">
                                <p className="font-medium text-sm">{rc.curso.nombre}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="secondary" className="text-xs">
                                    Nivel: {getNivelTexto(rc.curso.nivel)}
                                  </Badge>
                                  <span className={`text-xs font-medium ${getNivelColor(rc.curso.nivel)}`}>
                                    {rc.curso.nivel}/10
                                  </span>
                                  <Badge 
                                    variant={rc.estado === "completado" ? "default" : "outline"}
                                    className="text-xs"
                                  >
                                    {rc.estado === "completado" ? "Completado" : "Pendiente"}
                                  </Badge>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(rc.curso.url, "_blank")}
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Ver Curso
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Fecha */}
                      <div className="text-xs text-muted-foreground pt-2 border-t">
                        Generado el {new Date(recomendacion.creado_en).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "long",
                          year: "numeric"
                        })}
                      </div>
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
