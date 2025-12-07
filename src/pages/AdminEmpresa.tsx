import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useCurrentUser } from "../utils/auth"
import { EmpresaNavbar } from "@/components/EmpresaNavbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { 
  ArrowLeft, 
  Building2, 
  Users, 
  Edit, 
  Save,
  Loader2,
  Briefcase
} from "lucide-react"
import { getReclutadores, updateReclutador, updateEmpresaInfo, getEmpresaById } from "@/services/empresa"

interface Reclutador {
  id: string
  posicion: string
  usuario: {
    id: string
    name: string
    lastname: string
    correo: string
  }
  _count: {
    vacantes: number
  }
}

interface Empresa {
  id: string
  name: string
  area: string
  descripcion: string | null
}

export default function AdminEmpresa() {
  const navigate = useNavigate()
  const { isAuthenticated, isReclutador, empresaId } = useCurrentUser()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [reclutadores, setReclutadores] = useState<Reclutador[]>([])
  const [empresa, setEmpresa] = useState<Empresa | null>(null)
  
  // Estado para editar reclutador
  const [editingReclutador, setEditingReclutador] = useState<Reclutador | null>(null)
  const [reclutadorForm, setReclutadorForm] = useState({
    name: "",
    lastname: "",
    correo: "",
    posicion: ""
  })

  // Estado para editar empresa
  const [editingEmpresa, setEditingEmpresa] = useState(false)
  const [empresaForm, setEmpresaForm] = useState({
    name: "",
    area: "",
    descripcion: ""
  })

  useEffect(() => {
    if (!isAuthenticated || !isReclutador || !empresaId) {
      navigate("/login")
      return
    }
    fetchData()
  }, [isAuthenticated, isReclutador, empresaId, navigate])

  const fetchData = async () => {
    if (!empresaId) return
    
    try {
      setLoading(true)
      const [reclutadoresData, empresaData] = await Promise.all([
        getReclutadores(empresaId),
        getEmpresaById(empresaId)
      ])
      
      setReclutadores(reclutadoresData)
      setEmpresa(empresaData)
      setEmpresaForm({
        name: empresaData.name || "",
        area: empresaData.area || "",
        descripcion: empresaData.descripcion || ""
      })
    } catch (error) {
      console.error("Error al cargar datos:", error)
      toast.error("Error al cargar los datos")
    } finally {
      setLoading(false)
    }
  }

  const handleEditReclutador = (reclutador: Reclutador) => {
    setEditingReclutador(reclutador)
    setReclutadorForm({
      name: reclutador.usuario.name,
      lastname: reclutador.usuario.lastname,
      correo: reclutador.usuario.correo,
      posicion: reclutador.posicion || ""
    })
  }

  const handleSaveReclutador = async () => {
    if (!editingReclutador) return
    
    try {
      setSaving(true)
      await updateReclutador(editingReclutador.id, reclutadorForm)
      toast.success("Reclutador actualizado correctamente")
      setEditingReclutador(null)
      await fetchData()
    } catch (error: any) {
      console.error("Error al actualizar reclutador:", error)
      toast.error(error.response?.data?.message || "Error al actualizar el reclutador")
    } finally {
      setSaving(false)
    }
  }

  const handleSaveEmpresa = async () => {
    if (!empresaId) return
    
    try {
      setSaving(true)
      await updateEmpresaInfo(empresaId, empresaForm)
      toast.success("Información de la empresa actualizada")
      setEditingEmpresa(false)
      await fetchData()
    } catch (error: any) {
      console.error("Error al actualizar empresa:", error)
      toast.error(error.response?.data?.message || "Error al actualizar la empresa")
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <EmpresaNavbar />
      <main className="container mx-auto p-6 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Administración de Empresa</h1>
            <p className="text-muted-foreground mt-1">
              Gestiona la información de tu empresa y reclutadores
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/dashboard-empresa")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>

        <div className="grid gap-6">
          {/* Información de la Empresa */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Información de la Empresa</CardTitle>
                    <CardDescription>Datos generales de la organización</CardDescription>
                  </div>
                </div>
                {!editingEmpresa && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setEditingEmpresa(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : editingEmpresa ? (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="empresa-name">Nombre de la Empresa</Label>
                      <Input
                        id="empresa-name"
                        value={empresaForm.name}
                        onChange={(e) => setEmpresaForm({ ...empresaForm, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="empresa-area">Área/Industria</Label>
                      <Input
                        id="empresa-area"
                        value={empresaForm.area}
                        onChange={(e) => setEmpresaForm({ ...empresaForm, area: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="empresa-descripcion">Descripción</Label>
                    <Textarea
                      id="empresa-descripcion"
                      rows={4}
                      value={empresaForm.descripcion}
                      onChange={(e) => setEmpresaForm({ ...empresaForm, descripcion: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveEmpresa} disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Guardar Cambios
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setEditingEmpresa(false)}
                      disabled={saving}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Nombre</p>
                      <p className="font-medium">{empresa?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Área/Industria</p>
                      <p className="font-medium">{empresa?.area}</p>
                    </div>
                  </div>
                  {empresa?.descripcion && (
                    <div>
                      <p className="text-sm text-muted-foreground">Descripción</p>
                      <p className="font-medium">{empresa.descripcion}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lista de Reclutadores */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <CardTitle>Reclutadores</CardTitle>
                  <CardDescription>
                    {loading ? (
                      <Skeleton className="h-4 w-32" />
                    ) : (
                      `${reclutadores.length} reclutadores en tu equipo`
                    )}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : reclutadores.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hay reclutadores registrados
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Correo</TableHead>
                        <TableHead>Posición</TableHead>
                        <TableHead className="text-center">Vacantes</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reclutadores.map((reclutador) => (
                        <TableRow key={reclutador.id}>
                          <TableCell className="font-medium">
                            {reclutador.usuario.name} {reclutador.usuario.lastname}
                          </TableCell>
                          <TableCell>{reclutador.usuario.correo}</TableCell>
                          <TableCell>
                            {reclutador.posicion ? (
                              <Badge variant="secondary">{reclutador.posicion}</Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">Sin posición</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">
                              <Briefcase className="h-3 w-3 mr-1" />
                              {reclutador._count.vacantes}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditReclutador(reclutador)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Editar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Dialog para editar reclutador */}
        <Dialog open={!!editingReclutador} onOpenChange={() => setEditingReclutador(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Reclutador</DialogTitle>
              <DialogDescription>
                Actualiza la información del reclutador
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    value={reclutadorForm.name}
                    onChange={(e) => setReclutadorForm({ ...reclutadorForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastname">Apellido</Label>
                  <Input
                    id="lastname"
                    value={reclutadorForm.lastname}
                    onChange={(e) => setReclutadorForm({ ...reclutadorForm, lastname: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="correo">Correo</Label>
                <Input
                  id="correo"
                  type="email"
                  value={reclutadorForm.correo}
                  onChange={(e) => setReclutadorForm({ ...reclutadorForm, correo: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="posicion">Posición</Label>
                <Input
                  id="posicion"
                  placeholder="Ej: Senior Recruiter"
                  value={reclutadorForm.posicion}
                  onChange={(e) => setReclutadorForm({ ...reclutadorForm, posicion: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingReclutador(null)} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={handleSaveReclutador} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </>
  )
}
