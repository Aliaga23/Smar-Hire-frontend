import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CandidatoNavbar } from "../components/CandidatoNavbar";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Trash2,  Globe, Lightbulb, Cloud, Database, Code, Smartphone, ChevronLeft, Pencil, ChevronDown } from "lucide-react";
import { useCurrentUser } from "../utils/auth";

interface Habilidad {
  id: string;
  nivel: number;
  habilidad: {
    id: string;
    nombre: string;
    categoria: {
      nombre: string;
    };
  };
}

interface Lenguaje {
  id: string;
  nivel: number;
  lenguaje: {
    id: string;
    nombre: string;
  };
}

interface HabilidadDisponible {
  id: string;
  nombre: string;
  categoriaId: string;
}

interface LenguajeDisponible {
  id: string;
  nombre: string;
}

export default function GestionarHabilidades() {
  const navigate = useNavigate();
  const { isAuthenticated, isCandidato } = useCurrentUser();

  const [habilidades, setHabilidades] = useState<Habilidad[]>([]);
  const [lenguajes, setLenguajes] = useState<Lenguaje[]>([]);
  const [habilidadesDisponibles, setHabilidadesDisponibles] = useState<HabilidadDisponible[]>([]);
  const [lenguajesDisponibles, setLenguajesDisponibles] = useState<LenguajeDisponible[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para agregar habilidad
  const [dialogAgregarHabilidad, setDialogAgregarHabilidad] = useState(false);
  const [habilidadSeleccionada, setHabilidadSeleccionada] = useState("");
  const [nivelHabilidad, setNivelHabilidad] = useState(5);

  // Estados para agregar lenguaje
  const [dialogAgregarLenguaje, setDialogAgregarLenguaje] = useState(false);
  const [lenguajeSeleccionado, setLenguajeSeleccionado] = useState("");
  const [nivelLenguaje, setNivelLenguaje] = useState(5);

  // Estados para editar
  const [dialogEditarHabilidad, setDialogEditarHabilidad] = useState(false);
  const [dialogEditarLenguaje, setDialogEditarLenguaje] = useState(false);
  const [habilidadEditando, setHabilidadEditando] = useState<Habilidad | null>(null);
  const [lenguajeEditando, setLenguajeEditando] = useState<Lenguaje | null>(null);
  const [nivelEdit, setNivelEdit] = useState(5);

  // Estados para colapsables
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isAuthenticated || !isCandidato) {
      navigate("/login");
      return;
    }
    fetchData();
  }, [isAuthenticated, isCandidato, navigate]);

  const fetchData = async () => {
    try {
      const [profile, habilidadesDB, lenguajesDB] = await Promise.all([
        api.get('/candidatos/profile').then(res => res.data),
        api.get('/habilidades').then(res => res.data),
        api.get('/lenguajes').then(res => res.data),
      ]);

      setHabilidades(profile.habilidadesCandidato || []);
      setLenguajes(profile.lenguajesCandidato || []);
      setHabilidadesDisponibles(habilidadesDB);
      setLenguajesDisponibles(lenguajesDB);
    } catch (error) {
      toast.error("No se pudieron cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarHabilidad = async () => {
    if (!habilidadSeleccionada) return;

    try {
      await api.post('/candidatos/profile/habilidades', {
        habilidadId: habilidadSeleccionada,
        nivel: nivelHabilidad,
      });

      toast.success("¡Habilidad agregada!", {
        description: "La habilidad se agregó correctamente",
      });

      setDialogAgregarHabilidad(false);
      setHabilidadSeleccionada("");
      setNivelHabilidad(5);
      fetchData();
    } catch (error) {
      toast.error("No se pudo agregar la habilidad");
    }
  };

  const openEditSkillDialog = (habilidad: Habilidad) => {
  setHabilidadEditando(habilidad)
  setNivelEdit(habilidad.nivel)
  setDialogEditarHabilidad(true)
}

const openEditLanguageDialog = (lenguaje: Lenguaje) => {
  setLenguajeEditando(lenguaje)
  setNivelEdit(lenguaje.nivel)
  setDialogEditarLenguaje(true)
}

const handleActualizarHabilidad = async (habilidadId: string) => {
    try {
      await api.put(
        `/candidatos/profile/habilidades/${habilidadId}`,
        { nivel: nivelEdit }
      );

      toast.success("¡Habilidad actualizada!");

      setDialogEditarHabilidad(false);
      setHabilidadEditando(null);
      fetchData();
    } catch (error) {
      toast.error("No se pudo actualizar la habilidad");
    }
  };

  const handleEliminarHabilidad = async (habilidadId: string) => {
    if (!confirm("¿Seguro que deseas eliminar esta habilidad?")) return;

    try {
      await api.delete(`/candidatos/profile/habilidades/${habilidadId}`);

      toast.success("Habilidad eliminada");

      fetchData();
    } catch (error) {
      toast.error("No se pudo eliminar la habilidad");
    }
  };

  const handleAgregarLenguaje = async () => {
    if (!lenguajeSeleccionado) return;

    try {
      await api.post('/candidatos/profile/lenguajes', {
        lenguajeId: lenguajeSeleccionado,
        nivel: nivelLenguaje,
      });

      toast.success("¡Lenguaje agregado!", {
        description: "El lenguaje se agregó correctamente",
      });

      setDialogAgregarLenguaje(false);
      setLenguajeSeleccionado("");
      setNivelLenguaje(5);
      fetchData();
    } catch (error) {
      toast.error("No se pudo agregar el lenguaje");
    }
  };

  const handleActualizarLenguaje = async (lenguajeId: string) => {
    try {
      await api.put(
        `/candidatos/profile/lenguajes/${lenguajeId}`,
        { nivel: nivelEdit }
      );

      toast.success("¡Lenguaje actualizado!");

      setDialogEditarLenguaje(false);
      setLenguajeEditando(null);
      fetchData();
    } catch (error) {
      toast.error("No se pudo actualizar el lenguaje");
    }
  };

  const handleEliminarLenguaje = async (lenguajeId: string) => {
    if (!confirm("¿Seguro que deseas eliminar este lenguaje?")) return;

    try {
      await api.delete(`/candidatos/profile/lenguajes/${lenguajeId}`);

      toast.success("Lenguaje eliminado");

      fetchData();
    } catch (error) {
      toast.error("No se pudo eliminar el lenguaje");
    }
  };

  const getNivelLabel = (nivel: number) => {
    if (nivel >= 9) return "Experto";
    if (nivel >= 7) return "Avanzado";
    if (nivel >= 5) return "Intermedio";
    if (nivel >= 3) return "Básico";
    return "Principiante";
  };

  if (loading) {
    return (
      <>
        <CandidatoNavbar />
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </>
    );
  }

  return (
    <>
      <CandidatoNavbar />
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/dashboard-candidato")}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestionar Habilidades y Lenguajes</h1>
                <p className="mt-1 text-base text-muted-foreground">
                  Administra tus competencias técnicas y lingüísticas
                </p>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/dashboard-candidato")} className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Volver
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Lightbulb className="h-5 w-5" />
                    Habilidades Técnicas
                  </CardTitle>
                  <CardDescription>Gestiona tus competencias profesionales</CardDescription>
                </div>
                <Button size="sm" onClick={() => setDialogAgregarHabilidad(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Agregar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {habilidades.length === 0 ? (
                  <div className="text-center py-8">
                    <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">
                      No tienes habilidades agregadas
                    </p>
                  </div>
                ) : (
                  Object.entries(
                    habilidades.reduce((acc, h) => {
                      const category = h.habilidad.categoria.nombre || 'Otras'
                      if (!acc[category]) acc[category] = []
                      acc[category].push(h)
                      return acc
                    }, {} as Record<string, typeof habilidades>)
                  ).map(([category, categorySkills]) => {
                    const CategoryIcon = {
                      'Frontend': Code,
                      'Backend': Database,
                      'Cloud': Cloud,
                      'Mobile': Smartphone,
                    }[category] || Lightbulb
                    const iconColor = {
                      'Frontend': 'text-purple-600 dark:text-purple-400',
                      'Backend': 'text-emerald-600 dark:text-emerald-400',
                      'Cloud': 'text-blue-600 dark:text-blue-400',
                      'Mobile': 'text-orange-600 dark:text-orange-400',
                    }[category] || 'text-primary'

                    return (
                      <Collapsible
                        key={category}
                        open={openCategories[category] || false}
                        onOpenChange={(open) => 
                          setOpenCategories(prev => ({ ...prev, [category]: open }))
                        }
                      >
                        <CollapsibleTrigger className="w-full">
                          <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 hover:bg-muted/30 transition-colors">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                              <CategoryIcon className={`h-4 w-4 ${iconColor}`} />
                              {category}
                              <span className="text-xs font-normal text-muted-foreground">
                                ({categorySkills.length})
                              </span>
                            </div>
                            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${
                              openCategories[category] ? 'rotate-180' : ''
                            }`} />
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-2 mt-2">
                          {categorySkills.map((h) => (
                            <div
                              key={h.id}
                              className="group flex items-center justify-between gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
                            >
                              <div className="flex min-w-0 flex-1 items-center gap-3">
                                <div className="min-w-0 flex-1">
                                  <p className="font-semibold text-foreground">{h.habilidad.nombre}</p>
                                  <p className="mt-0.5 text-sm text-muted-foreground">{getNivelLabel(h.nivel)}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <div className="flex w-32 items-center gap-2">
                                  <Progress value={h.nivel * 10} className="h-2 flex-1" />
                                  <span className="w-10 text-right text-sm font-bold tabular-nums text-foreground">
                                    {h.nivel}/10
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => openEditSkillDialog(h)}
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    onClick={() => handleEliminarHabilidad(h.habilidad.id)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Lenguajes */}
          <Card>
            <CardHeader className="border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Globe className="h-5 w-5" />
                    Lenguajes
                  </CardTitle>
                  <CardDescription>Gestiona los idiomas que dominas</CardDescription>
                </div>
                <Button size="sm" onClick={() => setDialogAgregarLenguaje(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Agregar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-2">
                {lenguajes.length === 0 ? (
                  <div className="text-center py-8">
                    <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">
                      No tienes lenguajes agregados
                    </p>
                  </div>
                ) : (
                  lenguajes.map((l) => (
                    <div
                      key={l.id}
                      className="group flex items-center justify-between gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-foreground">{l.lenguaje.nombre}</p>
                          <p className="mt-0.5 text-sm text-muted-foreground">{getNivelLabel(l.nivel)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex w-32 items-center gap-2">
                          <Progress value={l.nivel * 10} className="h-2 flex-1" />
                          <span className="w-10 text-right text-sm font-bold tabular-nums text-foreground">
                            {l.nivel}/10
                          </span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEditLanguageDialog(l)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleEliminarLenguaje(l.lenguaje.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Dialog for Adding Skills */}
      <Dialog open={dialogAgregarHabilidad} onOpenChange={setDialogAgregarHabilidad}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Agregar Habilidad</DialogTitle>
            <DialogDescription>Selecciona una habilidad y define tu nivel de dominio</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="skill">Habilidad</Label>
              <Select value={habilidadSeleccionada} onValueChange={setHabilidadSeleccionada}>
                <SelectTrigger id="skill">
                  <SelectValue placeholder="Selecciona una habilidad" />
                </SelectTrigger>
                <SelectContent>
                  {habilidadesDisponibles
                    .filter((h) => !habilidades.some((hc) => hc.habilidad.id === h.id))
                    .map((h) => (
                      <SelectItem key={h.id} value={h.id}>
                        {h.nombre}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>
                  Nivel: {nivelHabilidad}/10 - {getNivelLabel(nivelHabilidad)}
                </Label>
              </div>
              <div className="space-y-2">
                <Input
                  type="range"
                  min="1"
                  max="10"
                  value={nivelHabilidad}
                  onChange={(e) => setNivelHabilidad(parseInt(e.target.value))}
                  className="w-full"
                />
                <Progress value={nivelHabilidad * 10} className="h-2 w-full" />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Básico</span>
                <span>Intermedio</span>
                <span>Avanzado</span>
                <span>Experto</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAgregarHabilidad(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAgregarHabilidad} disabled={!habilidadSeleccionada}>
              Agregar Habilidad
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for Adding Languages */}
      <Dialog open={dialogAgregarLenguaje} onOpenChange={setDialogAgregarLenguaje}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Agregar Lenguaje</DialogTitle>
            <DialogDescription>Selecciona un idioma y define tu nivel de dominio</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="language">Lenguaje</Label>
              <Select value={lenguajeSeleccionado} onValueChange={setLenguajeSeleccionado}>
                <SelectTrigger id="language">
                  <SelectValue placeholder="Selecciona un lenguaje" />
                </SelectTrigger>
                <SelectContent>
                  {lenguajesDisponibles
                    .filter((l) => !lenguajes.some((lc) => lc.lenguaje.id === l.id))
                    .map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.nombre}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>
                  Nivel: {nivelLenguaje}/10 - {getNivelLabel(nivelLenguaje)}
                </Label>
              </div>
              <div className="space-y-2">
                <Input
                  type="range"
                  min="1"
                  max="10"
                  value={nivelLenguaje}
                  onChange={(e) => setNivelLenguaje(parseInt(e.target.value))}
                  className="w-full"
                />
                <Progress value={nivelLenguaje * 10} className="h-2 w-full" />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Básico</span>
                <span>Intermedio</span>
                <span>Avanzado</span>
                <span>Experto</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAgregarLenguaje(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAgregarLenguaje} disabled={!lenguajeSeleccionado}>
              Agregar Lenguaje
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for Editing Skills */}
      <Dialog open={dialogEditarHabilidad} onOpenChange={setDialogEditarHabilidad}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Habilidad</DialogTitle>
            <DialogDescription>Ajusta el nivel de dominio de tu habilidad</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-skill">Habilidad</Label>
              <div className="px-3 py-2 border rounded-md bg-muted/50">
                <p className="text-sm font-medium">{habilidadEditando?.habilidad.nombre}</p>
                <p className="text-xs text-muted-foreground">{habilidadEditando?.habilidad.categoria.nombre}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>
                  Nivel: {nivelEdit}/10 - {getNivelLabel(nivelEdit)}
                </Label>
              </div>
              <div className="space-y-2">
                <Input
                  type="range"
                  min="1"
                  max="10"
                  value={nivelEdit}
                  onChange={(e) => setNivelEdit(parseInt(e.target.value))}
                  className="w-full"
                />
                <Progress value={nivelEdit * 10} className="h-2 w-full" />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Básico</span>
                <span>Intermedio</span>
                <span>Avanzado</span>
                <span>Experto</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogEditarHabilidad(false)}>
              Cancelar
            </Button>
            <Button onClick={() => habilidadEditando && handleActualizarHabilidad(habilidadEditando.habilidad.id)}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for Editing Languages */}
      <Dialog open={dialogEditarLenguaje} onOpenChange={setDialogEditarLenguaje}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Lenguaje</DialogTitle>
            <DialogDescription>Ajusta el nivel de dominio de tu idioma</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-language">Lenguaje</Label>
              <div className="px-3 py-2 border rounded-md bg-muted/50">
                <p className="text-sm font-medium">{lenguajeEditando?.lenguaje.nombre}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>
                  Nivel: {nivelEdit}/10 - {getNivelLabel(nivelEdit)}
                </Label>
              </div>
              <div className="space-y-2">
                <Input
                  type="range"
                  min="1"
                  max="10"
                  value={nivelEdit}
                  onChange={(e) => setNivelEdit(parseInt(e.target.value))}
                  className="w-full"
                />
                <Progress value={nivelEdit * 10} className="h-2 w-full" />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Básico</span>
                <span>Intermedio</span>
                <span>Avanzado</span>
                <span>Experto</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogEditarLenguaje(false)}>
              Cancelar
            </Button>
            <Button onClick={() => lenguajeEditando && handleActualizarLenguaje(lenguajeEditando.lenguaje.id)}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
