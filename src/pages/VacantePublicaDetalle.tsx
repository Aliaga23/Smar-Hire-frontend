import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { LandingNavbar } from "@/components/LandingNavbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import {
  ChevronLeft,
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Building2,
  Calendar,
  Send,
  Globe,
  TrendingUp,
  Users,
  LogIn,
} from "lucide-react"
import { getVacante, type Vacante } from "@/services/vacante"
import { toast } from "sonner"

export default function VacantePublicaDetalle() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [vacante, setVacante] = useState<Vacante | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVacante = async () => {
      if (!id) return
      try {
        setLoading(true)
        const data = await getVacante(id)
        setVacante(data)
      } catch (error) {
        console.error("Error al cargar vacante:", error)
        toast.error("Error al cargar la vacante")
      } finally {
        setLoading(false)
      }
    }
    fetchVacante()
  }, [id])

  if (loading) {
    return (
      <>
        <LandingNavbar />
        <main className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
          <div className="container mx-auto px-4 py-8 max-w-5xl">
            <Skeleton className="h-8 w-32 mb-8" />
            <div className="space-y-6">
              <Skeleton className="h-72 w-full rounded-2xl" />
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Skeleton className="h-48 w-full rounded-xl" />
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-48 w-full rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        </main>
      </>
    )
  }

  if (!vacante) {
    return (
      <>
        <LandingNavbar />
        <main className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
          <div className="container mx-auto px-4 py-16 max-w-lg">
            <Card className="border-none shadow-lg">
              <CardContent className="p-12">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
                    <Briefcase className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Vacante no encontrada</h3>
                  <p className="text-muted-foreground mb-8">
                    La vacante que buscas no existe o ha sido eliminada.
                  </p>
                  <Button onClick={() => navigate("/vacantes")} size="lg">
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Ver vacantes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </>
    )
  }

  const diasPublicado = Math.floor((Date.now() - new Date(vacante.creado_en).getTime()) / (1000 * 60 * 60 * 24))

  return (
    <>
      <LandingNavbar />
      <main className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <Button
            variant="ghost"
            onClick={() => navigate("/vacantes")}
            className="mb-6 -ml-3 text-muted-foreground hover:text-foreground gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Volver a vacantes
          </Button>

          {/* Hero */}
          <Card className="border-none shadow-lg mb-8 overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 sm:p-10">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge
                      className={`${
                        vacante.estado === "ABIERTA"
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <span className={`mr-1.5 h-2 w-2 rounded-full ${vacante.estado === "ABIERTA" ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"}`} />
                      {vacante.estado === "ABIERTA" ? "Activa" : vacante.estado}
                    </Badge>
                    {diasPublicado <= 7 && (
                      <Badge variant="secondary" className="gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Nueva
                      </Badge>
                    )}
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                    {vacante.titulo}
                  </h1>

                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-background shadow-sm border flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{vacante.empresa?.name}</p>
                      {vacante.empresa?.area && (
                        <p className="text-sm text-muted-foreground">{vacante.empresa.area}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">{vacante._count?.postulaciones || 0}</span>
                      <span>postulantes</span>
                    </div>
                    <Separator orientation="vertical" className="h-4" />
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {diasPublicado === 0
                          ? "Publicado hoy"
                          : diasPublicado === 1
                            ? "Publicado ayer"
                            : `Hace ${diasPublicado} días`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="lg:text-right space-y-4">
                  {(vacante.salario_minimo || vacante.salario_maximo) && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Salario</p>
                      <p className="text-2xl font-bold">
                        {vacante.salario_minimo && vacante.salario_maximo
                          ? `$${vacante.salario_minimo.toLocaleString()} - $${vacante.salario_maximo.toLocaleString()}`
                          : vacante.salario_minimo
                            ? `Desde $${vacante.salario_minimo.toLocaleString()}`
                            : `Hasta $${vacante.salario_maximo?.toLocaleString()}`}
                      </p>
                    </div>
                  )}
                  <Button
                    size="lg"
                    onClick={() => navigate("/login")}
                    disabled={vacante.estado !== "ABIERTA"}
                    className="gap-2 shadow-lg"
                  >
                    <Send className="h-5 w-5" />
                    Postularme
                  </Button>
                </div>
              </div>
            </div>

            <div className="px-8 sm:px-10 py-6 border-t bg-card/50">
              <div className="flex flex-wrap gap-3">
                {vacante.modalidad && (
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-background rounded-full border shadow-sm">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{vacante.modalidad.nombre}</span>
                  </div>
                )}
                {vacante.horario && (
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-background rounded-full border shadow-sm">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{vacante.horario.nombre}</span>
                  </div>
                )}
                {(vacante.salario_minimo || vacante.salario_maximo) && (
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-background rounded-full border shadow-sm">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">
                      {vacante.salario_minimo && vacante.salario_maximo
                        ? `$${(vacante.salario_minimo / 1000).toFixed(0)}k - $${(vacante.salario_maximo / 1000).toFixed(0)}k`
                        : vacante.salario_minimo
                          ? `Desde $${(vacante.salario_minimo / 1000).toFixed(0)}k`
                          : `Hasta $${((vacante.salario_maximo || 0) / 1000).toFixed(0)}k`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-none shadow-md">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Briefcase className="h-5 w-5 text-primary" />
                    Descripción del Puesto
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {vacante.descripcion}
                  </p>
                </CardContent>
              </Card>

              {vacante.empresa && (
                <Card className="border-none shadow-md">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Building2 className="h-5 w-5 text-primary" />
                      Acerca de {vacante.empresa.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border flex items-center justify-center shrink-0">
                        <Building2 className="h-8 w-8 text-primary" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="font-semibold text-lg">{vacante.empresa.name}</h3>
                          {vacante.empresa.area && (
                            <Badge variant="secondary" className="mt-1 gap-1">
                              <Globe className="h-3 w-3" />
                              {vacante.empresa.area}
                            </Badge>
                          )}
                        </div>
                        {vacante.empresa.descripcion && (
                          <p className="text-muted-foreground leading-relaxed">
                            {vacante.empresa.descripcion}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="border-none shadow-md sticky top-24">
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-3">
                    <Button
                      className="w-full h-12 shadow-md gap-2"
                      onClick={() => navigate("/login")}
                      disabled={vacante.estado !== "ABIERTA"}
                    >
                      <Send className="h-5 w-5" />
                      Postularme Ahora
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => navigate("/login")}
                    >
                      <LogIn className="h-4 w-4" />
                      Iniciar sesión
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                      Detalles del Empleo
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">Jornada</span>
                        </div>
                        <span className="text-sm font-medium">{vacante.horario?.nombre || "No especificado"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm">Modalidad</span>
                        </div>
                        <span className="text-sm font-medium">{vacante.modalidad?.nombre || "No especificado"}</span>
                      </div>
                      {(vacante.salario_minimo || vacante.salario_maximo) && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <DollarSign className="h-4 w-4" />
                            <span className="text-sm">Salario</span>
                          </div>
                          <span className="text-sm font-medium">
                            {vacante.salario_minimo && vacante.salario_maximo
                              ? `$${vacante.salario_minimo.toLocaleString()} - $${vacante.salario_maximo.toLocaleString()}`
                              : vacante.salario_minimo
                                ? `Desde $${vacante.salario_minimo.toLocaleString()}`
                                : `Hasta $${vacante.salario_maximo?.toLocaleString()}`}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span className="text-sm">Postulantes</span>
                        </div>
                        <span className="text-sm font-medium">{vacante._count?.postulaciones || 0}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
