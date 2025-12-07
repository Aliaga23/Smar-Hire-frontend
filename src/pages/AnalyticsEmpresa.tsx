import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { EmpresaNavbar } from "@/components/EmpresaNavbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  ArrowLeft, 
  Loader2, 
  TrendingUp,
  Award,
  BarChart3,
  Activity
} from "lucide-react"
import { getEmpresaAnalytics } from "@/services/empresa"
import { toast } from "sonner"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts"

interface AnalyticsData {
  resumenGeneralPostulaciones: {
    totalPostulaciones: number
    compatibilidadAlta: number
    compatibilidadMedia: number
    compatibilidadBaja: number
    porcentajeCompatibilidadAlta: number
    promedioCompatibilidad: number
    postulacionesUltimaSemana: number
    postulacionesVacantesAbiertas: number
  }
  habilidadesMasDemandadas: any[]
  candidatosTopPorCompatibilidad: any[]
  tendenciaPostulaciones: any[]
}

// Colores vibrantes y profesionales
const CHART_COLORS = {
  primary: '#0ea5e9',    // Azul eléctrico (sky-500)
  secondary: '#10b981',  // Verde esmeralda (emerald-500)
  tertiary: '#f59e0b',   // Naranja vibrante (amber-500)
  accent: '#ef4444',     // Rojo coral (red-500)
  neutral: '#6366f1',    // Indigo (indigo-500)
  success: '#22c55e',    // Green-500
  warning: '#eab308',    // Yellow-500
  purple: '#8b5cf6',     // Purple-500
}

export default function AnalyticsEmpresa() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchAnalytics()
    }
  }, [id])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const data = await getEmpresaAnalytics(id!)
      setAnalytics(data)
    } catch (error) {
      console.error("Error al cargar analytics:", error)
      toast.error("Error al cargar los datos de analytics")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <EmpresaNavbar />
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    )
  }

  if (!analytics) {
    return (
      <>
        <EmpresaNavbar />
        <div className="container mx-auto p-6">
          <p>No se pudieron cargar los datos</p>
        </div>
      </>
    )
  }

  const { resumenGeneralPostulaciones, habilidadesMasDemandadas, candidatosTopPorCompatibilidad, tendenciaPostulaciones } = analytics

  return (
    <>
      <EmpresaNavbar />
      <main className="container mx-auto p-3 sm:p-6 min-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Analytics Avanzados</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Insights y métricas clave de tu empresa
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/dashboard-empresa')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>

        {/* Cards de Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Postulaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{resumenGeneralPostulaciones.totalPostulaciones}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {resumenGeneralPostulaciones.postulacionesVacantesAbiertas} en vacantes abiertas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Última Semana</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{resumenGeneralPostulaciones.postulacionesUltimaSemana}</div>
              <p className="text-xs text-muted-foreground mt-1">Nuevas postulaciones</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Promedio Compatibilidad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{resumenGeneralPostulaciones.promedioCompatibilidad.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground mt-1">Score general</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Alta Compatibilidad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{resumenGeneralPostulaciones.porcentajeCompatibilidadAlta.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground mt-1">{resumenGeneralPostulaciones.compatibilidadAlta} candidatos ≥70%</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1. Resumen General - PieChart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Distribución de Compatibilidad
              </CardTitle>
              <CardDescription>
                Desglose de postulaciones por nivel de compatibilidad
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Alta (≥70%)', value: resumenGeneralPostulaciones.compatibilidadAlta, fill: CHART_COLORS.success },
                      { name: 'Media (50-70%)', value: resumenGeneralPostulaciones.compatibilidadMedia, fill: CHART_COLORS.warning },
                      { name: 'Baja (<50%)', value: resumenGeneralPostulaciones.compatibilidadBaja, fill: CHART_COLORS.accent }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value, percent }) => `${name}: ${value} (${((percent || 0) * 100).toFixed(0)}%)`}
                    labelLine={true}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 2. Habilidades Más Demandadas - Radar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Habilidades Más Demandadas
              </CardTitle>
              <CardDescription>
                Top 6 habilidades técnicas más solicitadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart
                  outerRadius="80%"
                  data={habilidadesMasDemandadas.slice(0, 6).map(h => ({
                    nombre: h.nombre.length > 12 ? h.nombre.substring(0, 12) + '...' : h.nombre,
                    nivel: h.nivelPromedio
                  }))}
                  margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                >
                  <PolarGrid />
                  <PolarAngleAxis dataKey="nombre" />
                  <PolarRadiusAxis />
                  <Radar
                    name="Nivel Requerido"
                    dataKey="nivel"
                    stroke={CHART_COLORS.secondary}
                    fill={CHART_COLORS.secondary}
                    fillOpacity={0.6}
                  />
                  <Legend />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 5. Tendencia de Postulaciones - AreaChart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Tendencia de Postulaciones (Últimos 6 Meses)
              </CardTitle>
              <CardDescription>
                Evolución mensual de postulaciones por nivel de compatibilidad
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart
                  data={tendenciaPostulaciones.map(mes => ({
                    mes: new Date(mes.mes + '-01').toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
                    alta: mes.compatibilidadAlta,
                    media: mes.compatibilidadMedia,
                    baja: mes.compatibilidadBaja
                  }))}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="alta" 
                    stackId="1"
                    stroke="none"
                    fill={CHART_COLORS.success}
                    fillOpacity={0.6}
                    name="Alta (≥70%)"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="media" 
                    stackId="1"
                    stroke="none"
                    fill={CHART_COLORS.warning}
                    fillOpacity={0.6}
                    name="Media (50-70%)"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="baja" 
                    stackId="1"
                    stroke="none"
                    fill={CHART_COLORS.accent}
                    fillOpacity={0.6}
                    name="Baja (<50%)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 4. Candidatos Top - Tabla */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Candidatos Top por Compatibilidad
              </CardTitle>
              <CardDescription>
                Top 10 candidatos con mayor compatibilidad (≥70%) en vacantes abiertas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidato</TableHead>
                      <TableHead>Compatibilidad</TableHead>
                      <TableHead>Vacante</TableHead>
                      <TableHead>Top Habilidades</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {candidatosTopPorCompatibilidad.slice(0, 10).map((candidato) => (
                      <TableRow key={candidato.postulacionId}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{candidato.nombreCompleto}</p>
                            <p className="text-xs text-muted-foreground">{candidato.titulo}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={candidato.compatibilidadPorcentaje >= 80 ? "default" : "secondary"}
                            className={candidato.compatibilidadPorcentaje >= 80 ? "bg-green-600" : ""}
                          >
                            {candidato.compatibilidadPorcentaje.toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {candidato.vacante}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {candidato.topHabilidades.slice(0, 3).map((h: any, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {h.nombre}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => navigate(`/perfil-candidato/${candidato.candidatoId}`)}
                          >
                            Ver Perfil
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
