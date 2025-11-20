import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { CandidatoNavbar } from "@/components/CandidatoNavbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  ArrowLeft, 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Clock, 
  Building2,
  Calendar,
  CheckCircle2,
  Loader2,
  Lightbulb,
  Code
} from "lucide-react"
import { getVacante, type Vacante } from "@/services/vacante"
import { createPostulacion, getMisPostulaciones, type Postulacion } from "@/services/postulacion"
import { toast } from "sonner"

export default function VacanteDetalleCandidato() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [vacante, setVacante] = useState<Vacante | null>(null)
  const [misPostulaciones, setMisPostulaciones] = useState<Postulacion[]>([])
  const [loading, setLoading] = useState(true)
  const [postulando, setPostulando] = useState(false)

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    if (!id) return

    try {
      setLoading(true)
      const [vacanteData, postulacionesRes] = await Promise.all([
        getVacante(id),
        getMisPostulaciones(1, 100)
      ])
      
      setVacante(vacanteData)
      setMisPostulaciones(postulacionesRes.data || [])
    } catch (error) {
      console.error("Error al cargar datos:", error)
      toast.error("Error al cargar la vacante")
    } finally {
      setLoading(false)
    }
  }

  const handlePostular = async () => {
    if (!id) return

    try {
      setPostulando(true)
      await createPostulacion({ vacanteId: id })
      toast.success("¡Postulación enviada con éxito!")
      
      // Recargar postulaciones
      const postulacionesRes = await getMisPostulaciones(1, 100)
      setMisPostulaciones(postulacionesRes.data || [])
    } catch (error: any) {
      console.error("Error al postular:", error)
      const mensaje = error.response?.data?.message || "Error al enviar la postulación"
      toast.error(mensaje)
    } finally {
      setPostulando(false)
    }
  }

  const yaPostulado = () => {
    return misPostulaciones.some(p => p.vacanteId === id)
  }

  if (loading) {
    return (
      <>
        <CandidatoNavbar />
        <main className="container mx-auto p-6 min-h-screen">
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
      </>
    )
  }

  if (!vacante) {
    return (
      <>
        <CandidatoNavbar />
        <main className="container mx-auto p-6 min-h-screen">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Vacante no encontrada</h3>
              <Button onClick={() => navigate("/vacantes-disponibles")}>
                Volver a Vacantes
              </Button>
            </CardContent>
          </Card>
        </main>
      </>
    )
  }

  const postulado = yaPostulado()

  return (
    <>
      <CandidatoNavbar />
      <main className="container mx-auto p-6 min-h-screen max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={() => navigate("/vacantes-disponibles")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Vacantes
          </Button>
          {postulado && (
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Ya postulado
            </Badge>
          )}
        </div>

        {/* Información Principal */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">{vacante.titulo}</CardTitle>
                <CardDescription className="flex items-center gap-4 flex-wrap text-base">
                  <span className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {vacante.empresa?.name || "Empresa"}
                  </span>
                  {vacante.empresa?.area && (
                    <span>• {vacante.empresa.area}</span>
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

          <CardContent className="space-y-6">
            {/* Detalles básicos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {vacante.modalidad && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Modalidad</p>
                    <p className="font-medium">{vacante.modalidad.nombre}</p>
                  </div>
                </div>
              )}

              {vacante.horario && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Horario</p>
                    <p className="font-medium">{vacante.horario.nombre}</p>
                  </div>
                </div>
              )}

              {(vacante.salario_minimo || vacante.salario_maximo) && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Salario</p>
                    <p className="font-medium">
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

            <Separator />

            {/* Descripción */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Descripción del Puesto</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{vacante.descripcion}</p>
            </div>

            {/* Información de la empresa */}
            {vacante.empresa && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Sobre la Empresa
                  </h3>
                  <div className="space-y-2">
                    <p className="font-medium text-lg">{vacante.empresa.name}</p>
                    {vacante.empresa.descripcion && (
                      <p className="text-muted-foreground">{vacante.empresa.descripcion}</p>
                    )}
                    {vacante.empresa.area && (
                      <div className="flex items-center gap-2 text-sm">
                        <Code className="h-4 w-4" />
                        <span>{vacante.empresa.area}</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Fecha de publicación */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                Publicado el {new Date(vacante.creado_en).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "long",
                  year: "numeric"
                })}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Botón de postulación */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">
                  {postulado ? "Ya te postulaste a esta vacante" : "¿Te interesa esta oportunidad?"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {postulado 
                    ? "El reclutador revisará tu perfil y se pondrá en contacto contigo" 
                    : "Postúlate ahora y destaca entre los candidatos"}
                </p>
              </div>
              {postulado ? (
                <Button variant="outline" disabled size="lg">
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Ya Postulado
                </Button>
              ) : (
                <Button 
                  onClick={handlePostular}
                  disabled={postulando || vacante.estado !== "ABIERTA"}
                  size="lg"
                >
                  {postulando ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Postulando...
                    </>
                  ) : (
                    <>
                      <Briefcase className="h-5 w-5 mr-2" />
                      Postularme Ahora
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Consejo IA */}
        {!postulado && (
          <Card className="mt-6 border-blue-200 bg-blue-50/50">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Lightbulb className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Consejo del Sistema IA</h3>
                  <p className="text-sm text-blue-800">
                    Asegúrate de que tu perfil esté completo con todas tus habilidades y experiencia antes de postularte. 
                    Esto mejorará tu puntuación de compatibilidad con esta vacante.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  )
}
