import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CandidatoNavbar } from "../components/CandidatoNavbar";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Trash2, Edit, ArrowLeft, Globe } from "lucide-react";
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
  const [editandoHabilidad, setEditandoHabilidad] = useState<string | null>(null);
  const [editandoLenguaje, setEditandoLenguaje] = useState<string | null>(null);
  const [nivelEdit, setNivelEdit] = useState(5);

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

  const handleActualizarHabilidad = async (habilidadId: string) => {
    try {
      await api.put(
        `/candidatos/profile/habilidades/${habilidadId}`,
        { nivel: nivelEdit }
      );

      toast.success("¡Habilidad actualizada!");

      setEditandoHabilidad(null);
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

      setEditandoLenguaje(null);
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
      <main className="container mx-auto p-6 max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gestionar Habilidades y Lenguajes</h1>
            <p className="text-muted-foreground mt-1">
              Administra tus competencias técnicas y lingüísticas
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/dashboard-candidato")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Habilidades */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Habilidades Técnicas</CardTitle>
                  <CardDescription>Gestiona tus competencias profesionales</CardDescription>
                </div>
                <Dialog open={dialogAgregarHabilidad} onOpenChange={setDialogAgregarHabilidad}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Agregar Habilidad</DialogTitle>
                      <DialogDescription>
                        Selecciona una habilidad y define tu nivel de dominio
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label>Habilidad</Label>
                        <Select value={habilidadSeleccionada} onValueChange={setHabilidadSeleccionada}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una habilidad" />
                          </SelectTrigger>
                          <SelectContent>
                            {habilidadesDisponibles
                              .filter(
                                (h) => !habilidades.some((hc) => hc.habilidad.id === h.id)
                              )
                              .map((h) => (
                                <SelectItem key={h.id} value={h.id}>
                                  {h.nombre}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Nivel: {nivelHabilidad}/10 - {getNivelLabel(nivelHabilidad)}</Label>
                        <Input
                          type="range"
                          min="1"
                          max="10"
                          value={nivelHabilidad}
                          onChange={(e) => setNivelHabilidad(parseInt(e.target.value))}
                        />
                      </div>

                      <Button onClick={handleAgregarHabilidad} className="w-full">
                        Agregar Habilidad
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {habilidades.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No tienes habilidades agregadas
                  </p>
                ) : (
                  habilidades.map((h) => (
                    <div key={h.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{h.habilidad.nombre}</span>
                            <Badge variant="outline" className="text-xs">
                              {h.habilidad.categoria.nombre}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditandoHabilidad(h.habilidad.id);
                              setNivelEdit(h.nivel);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEliminarHabilidad(h.habilidad.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>

                      {editandoHabilidad === h.habilidad.id ? (
                        <div className="space-y-2">
                          <Label className="text-xs">
                            Nivel: {nivelEdit}/10 - {getNivelLabel(nivelEdit)}
                          </Label>
                          <Input
                            type="range"
                            min="1"
                            max="10"
                            value={nivelEdit}
                            onChange={(e) => setNivelEdit(parseInt(e.target.value))}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleActualizarHabilidad(h.habilidad.id)}
                            >
                              Guardar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditandoHabilidad(null)}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-muted-foreground">{getNivelLabel(h.nivel)}</span>
                            <span className="font-medium">{h.nivel}/10</span>
                          </div>
                          <Progress value={h.nivel * 10} />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Lenguajes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    <div className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Lenguajes
                    </div>
                  </CardTitle>
                  <CardDescription>Gestiona los idiomas que dominas</CardDescription>
                </div>
                <Dialog open={dialogAgregarLenguaje} onOpenChange={setDialogAgregarLenguaje}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Agregar Lenguaje</DialogTitle>
                      <DialogDescription>
                        Selecciona un idioma y define tu nivel de dominio
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label>Lenguaje</Label>
                        <Select value={lenguajeSeleccionado} onValueChange={setLenguajeSeleccionado}>
                          <SelectTrigger>
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

                      <div className="space-y-2">
                        <Label>Nivel: {nivelLenguaje}/10 - {getNivelLabel(nivelLenguaje)}</Label>
                        <Input
                          type="range"
                          min="1"
                          max="10"
                          value={nivelLenguaje}
                          onChange={(e) => setNivelLenguaje(parseInt(e.target.value))}
                        />
                      </div>

                      <Button onClick={handleAgregarLenguaje} className="w-full">
                        Agregar Lenguaje
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lenguajes.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No tienes lenguajes agregados
                  </p>
                ) : (
                  lenguajes.map((l) => (
                    <div key={l.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{l.lenguaje.nombre}</span>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditandoLenguaje(l.lenguaje.id);
                              setNivelEdit(l.nivel);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEliminarLenguaje(l.lenguaje.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>

                      {editandoLenguaje === l.lenguaje.id ? (
                        <div className="space-y-2">
                          <Label className="text-xs">
                            Nivel: {nivelEdit}/10 - {getNivelLabel(nivelEdit)}
                          </Label>
                          <Input
                            type="range"
                            min="1"
                            max="10"
                            value={nivelEdit}
                            onChange={(e) => setNivelEdit(parseInt(e.target.value))}
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleActualizarLenguaje(l.lenguaje.id)}>
                              Guardar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditandoLenguaje(null)}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-muted-foreground">{getNivelLabel(l.nivel)}</span>
                            <span className="font-medium">{l.nivel}/10</span>
                          </div>
                          <Progress value={l.nivel * 10} />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
