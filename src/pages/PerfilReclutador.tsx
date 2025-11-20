import { useState, useEffect } from "react"
import { Navigate } from "react-router-dom"
import { useCurrentUser } from "../utils/auth"
import { EmpresaNavbar } from "@/components/EmpresaNavbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Briefcase,
  Building2,
  Save,
  Loader2
} from "lucide-react"

interface ReclutadorProfile {
  id: string
  usuario: {
    name: string
    lastname: string
    correo: string
    telefono?: string
    fecha_nacimiento?: string
  }
  posicion?: string
  empresa: {
    id: string
    name: string
    area?: string
    descripcion?: string
  }
}

export default function PerfilReclutador() {
  const { isAuthenticated, isReclutador, user } = useCurrentUser()
  
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<ReclutadorProfile | null>(null)
  const [editMode, setEditMode] = useState(false)
  
  const [formData, setFormData] = useState({
    name: "",
    lastname: "",
    telefono: "",
    fecha_nacimiento: "",
    posicion: ""
  })

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!isReclutador) {
    return <Navigate to="/dashboard-candidato" replace />
  }

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      // Simulación - en producción esto vendría de un endpoint
      const mockProfile: ReclutadorProfile = {
        id: user?.reclutador?.id || "",
        usuario: {
          name: user?.name || "",
          lastname: user?.lastname || "",
          correo: user?.correo || "",
          telefono: user?.telefono || "",
          fecha_nacimiento: user?.fecha_nacimiento || ""
        },
        posicion: user?.reclutador?.posicion || "",
        empresa: {
          id: user?.reclutador?.empresaId || "",
          name: user?.reclutador?.empresa?.name || "Mi Empresa",
          area: user?.reclutador?.empresa?.area || "",
          descripcion: user?.reclutador?.empresa?.descripcion || ""
        }
      }
      
      setProfile(mockProfile)
      setFormData({
        name: mockProfile.usuario.name,
        lastname: mockProfile.usuario.lastname,
        telefono: mockProfile.usuario.telefono || "",
        fecha_nacimiento: mockProfile.usuario.fecha_nacimiento || "",
        posicion: mockProfile.posicion || ""
      })
    } catch (error) {
      toast.error("Error al cargar el perfil")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      // Aquí iría la llamada al API para actualizar el perfil
      // await updateReclutadorProfile(formData)
      
      toast.success("Perfil actualizado exitosamente")
      setEditMode(false)
      loadProfile()
    } catch (error) {
      toast.error("Error al actualizar el perfil")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.usuario.name,
        lastname: profile.usuario.lastname,
        telefono: profile.usuario.telefono || "",
        fecha_nacimiento: profile.usuario.fecha_nacimiento || "",
        posicion: profile.posicion || ""
      })
    }
    setEditMode(false)
  }

  const getInitials = (name: string, lastname: string) => {
    return `${name.charAt(0)}${lastname.charAt(0)}`.toUpperCase()
  }

  return (
    <div className="min-h-screen bg-background">
      <EmpresaNavbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Mi Perfil</h1>
              <p className="text-muted-foreground">Gestiona tu información personal</p>
            </div>
            {!editMode && (
              <Button onClick={() => setEditMode(true)}>
                Editar Perfil
              </Button>
            )}
          </div>

          {loading && !profile ? (
            <Card>
              <CardContent className="py-8">
                <div className="flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ) : profile ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información Personal */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Información Personal
                  </CardTitle>
                  <CardDescription>
                    Tu información básica de contacto
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6">
                    <Avatar className="h-20 w-20">
                      <AvatarFallback className="text-2xl">
                        {getInitials(formData.name, formData.lastname)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold">
                        {formData.name} {formData.lastname}
                      </h3>
                      <p className="text-muted-foreground">{formData.posicion || "Reclutador"}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          disabled={!editMode}
                          className="pl-9"
                          placeholder="Tu nombre"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastname">Apellido</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="lastname"
                          value={formData.lastname}
                          onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                          disabled={!editMode}
                          className="pl-9"
                          placeholder="Tu apellido"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="correo">Correo Electrónico</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="correo"
                          type="email"
                          value={profile.usuario.correo}
                          disabled
                          className="pl-9 bg-muted"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        El correo no se puede modificar
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="telefono">Teléfono</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="telefono"
                          type="tel"
                          value={formData.telefono}
                          onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                          disabled={!editMode}
                          className="pl-9"
                          placeholder="+52 123 456 7890"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="fecha_nacimiento"
                          type="date"
                          value={formData.fecha_nacimiento}
                          onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
                          disabled={!editMode}
                          className="pl-9"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="posicion">Posición</Label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="posicion"
                          value={formData.posicion}
                          onChange={(e) => setFormData({ ...formData, posicion: e.target.value })}
                          disabled={!editMode}
                          className="pl-9"
                          placeholder="HR Manager, Recruiter, etc."
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Información de la Empresa */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Empresa
                  </CardTitle>
                  <CardDescription>
                    Información de tu empresa
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nombre de la Empresa</Label>
                      <Input
                        value={profile.empresa.name}
                        disabled
                        className="bg-muted"
                      />
                    </div>

                    {profile.empresa.area && (
                      <div className="space-y-2">
                        <Label>Área/Industria</Label>
                        <Input
                          value={profile.empresa.area}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                    )}
                  </div>

                  {profile.empresa.descripcion && (
                    <div className="space-y-2">
                      <Label>Descripción</Label>
                      <p className="text-sm text-muted-foreground p-3 border rounded-lg bg-muted/50">
                        {profile.empresa.descripcion}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Botones de acción */}
              {editMode && (
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Guardar Cambios
                      </>
                    )}
                  </Button>
                </div>
              )}
            </form>
          ) : null}
        </div>
      </main>
    </div>
  )
}
