import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { toast } from "sonner"
import { X, Plus, Award, Languages, Loader2, Check, ChevronsUpDown } from "lucide-react"
import { createVacante, updateVacante, getModalidades, getHorarios, addHabilidadVacante, addLenguajeVacante, type Vacante } from "@/services/vacante"
import { getHabilidades, type Habilidad } from "@/services/habilidad"
import { getLenguajes, type Lenguaje } from "@/services/lenguaje"
import { cn } from "@/lib/utils"

interface VacanteFormData {
  titulo: string
  descripcion: string
  salario_minimo: string
  salario_maximo: string
  empresaId: string
  modalidadId: string
  horarioId: string
}

interface HabilidadSeleccionada {
  habilidadId: string
  habilidad: Habilidad
  nivel: number
  requerido: "SI" | "NO"
}

interface LenguajeSeleccionado {
  lenguajeId: string
  lenguaje: Lenguaje
  nivel: number
}

interface VacanteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vacanteToEdit?: Vacante | null
  empresaId: string
  onSuccess: () => void
}

export function VacanteDialog({ open, onOpenChange, vacanteToEdit, empresaId, onSuccess }: VacanteDialogProps) {
  const [loading, setLoading] = useState(false)
  const [loadingCatalogos, setLoadingCatalogos] = useState(true)
  
  // Form data
  const [formData, setFormData] = useState<VacanteFormData>({
    titulo: "",
    descripcion: "",
    salario_minimo: "",
    salario_maximo: "",
    empresaId: empresaId,
    modalidadId: "",
    horarioId: "",
  })

  // Catálogos
  const [modalidades, setModalidades] = useState<any[]>([])
  const [horarios, setHorarios] = useState<any[]>([])
  const [habilidades, setHabilidades] = useState<Habilidad[]>([])
  const [lenguajes, setLenguajes] = useState<Lenguaje[]>([])

  // Habilidades y lenguajes seleccionados
  const [habilidadesSeleccionadas, setHabilidadesSeleccionadas] = useState<HabilidadSeleccionada[]>([])
  const [lenguajesSeleccionados, setLenguajesSeleccionados] = useState<LenguajeSeleccionado[]>([])

  // Para agregar nueva habilidad
  const [nuevaHabilidad, setNuevaHabilidad] = useState({
    habilidadId: "",
    nivel: 5,
    requerido: "NO" as "SI" | "NO"
  })

  // Para agregar nuevo lenguaje
  const [nuevoLenguaje, setNuevoLenguaje] = useState({
    lenguajeId: "",
    nivel: 5
  })

  // Estados para los popovers
  const [habilidadPopoverOpen, setHabilidadPopoverOpen] = useState(false)
  const [lenguajePopoverOpen, setLenguajePopoverOpen] = useState(false)

  // Cargar catálogos
  useEffect(() => {
    if (open) {
      loadCatalogos()
      if (vacanteToEdit) {
        loadVacanteData()
      }
    }
  }, [open, vacanteToEdit])

  const loadCatalogos = async () => {
    try {
      setLoadingCatalogos(true)
      const [modalidadesData, horariosData, habilidadesData, lenguajesData] = await Promise.all([
        getModalidades(),
        getHorarios(),
        getHabilidades(),
        getLenguajes()
      ])
      setModalidades(modalidadesData)
      setHorarios(horariosData)
      setHabilidades(habilidadesData)
      setLenguajes(lenguajesData)
    } catch (error) {
      toast.error("Error al cargar catálogos")
    } finally {
      setLoadingCatalogos(false)
    }
  }

  const loadVacanteData = () => {
    if (vacanteToEdit) {
      setFormData({
        titulo: vacanteToEdit.titulo,
        descripcion: vacanteToEdit.descripcion,
        salario_minimo: vacanteToEdit.salario_minimo?.toString() || "",
        salario_maximo: vacanteToEdit.salario_maximo?.toString() || "",
        empresaId: vacanteToEdit.empresaId,
        modalidadId: vacanteToEdit.modalidadId,
        horarioId: vacanteToEdit.horarioId,
      })
    }
  }

  const agregarHabilidad = () => {
    if (!nuevaHabilidad.habilidadId) {
      toast.error("Selecciona una habilidad")
      return
    }

    const habilidadYaAgregada = habilidadesSeleccionadas.find(
      h => h.habilidadId === nuevaHabilidad.habilidadId
    )

    if (habilidadYaAgregada) {
      toast.error("Esta habilidad ya fue agregada")
      return
    }

    const habilidad = habilidades.find(h => h.id === nuevaHabilidad.habilidadId)
    if (!habilidad) return

    setHabilidadesSeleccionadas([
      ...habilidadesSeleccionadas,
      {
        habilidadId: nuevaHabilidad.habilidadId,
        habilidad,
        nivel: nuevaHabilidad.nivel,
        requerido: nuevaHabilidad.requerido
      }
    ])

    setNuevaHabilidad({ habilidadId: "", nivel: 5, requerido: "NO" })
  }

  const agregarLenguaje = () => {
    if (!nuevoLenguaje.lenguajeId) {
      toast.error("Selecciona un idioma")
      return
    }

    const lenguajeYaAgregado = lenguajesSeleccionados.find(
      l => l.lenguajeId === nuevoLenguaje.lenguajeId
    )

    if (lenguajeYaAgregado) {
      toast.error("Este idioma ya fue agregado")
      return
    }

    const lenguaje = lenguajes.find(l => l.id === nuevoLenguaje.lenguajeId)
    if (!lenguaje) return

    setLenguajesSeleccionados([
      ...lenguajesSeleccionados,
      {
        lenguajeId: nuevoLenguaje.lenguajeId,
        lenguaje,
        nivel: nuevoLenguaje.nivel
      }
    ])

    setNuevoLenguaje({ lenguajeId: "", nivel: 5 })
  }

  const eliminarHabilidad = (habilidadId: string) => {
    setHabilidadesSeleccionadas(habilidadesSeleccionadas.filter(h => h.habilidadId !== habilidadId))
  }

  const eliminarLenguaje = (lenguajeId: string) => {
    setLenguajesSeleccionados(lenguajesSeleccionados.filter(l => l.lenguajeId !== lenguajeId))
  }

  const handleSubmit = async () => {
    // Validaciones
    if (!formData.titulo.trim()) {
      toast.error("El título es requerido")
      return
    }
    if (!formData.descripcion.trim()) {
      toast.error("La descripción es requerida")
      return
    }
    if (!formData.modalidadId) {
      toast.error("Selecciona una modalidad")
      return
    }
    if (!formData.horarioId) {
      toast.error("Selecciona un horario")
      return
    }

    setLoading(true)
    try {
      const vacanteData = {
        ...formData,
        salario_minimo: formData.salario_minimo ? parseFloat(formData.salario_minimo) : undefined,
        salario_maximo: formData.salario_maximo ? parseFloat(formData.salario_maximo) : undefined,
      }

      let vacanteId: string

      if (vacanteToEdit) {
        // Actualizar vacante existente
        const { empresaId, ...updateData } = vacanteData
        await updateVacante(vacanteToEdit.id, updateData)
        vacanteId = vacanteToEdit.id
        toast.success("Vacante actualizada correctamente")
      } else {
        // Crear nueva vacante
        const nuevaVacante = await createVacante(vacanteData)
        vacanteId = nuevaVacante.id
        toast.success("Vacante creada correctamente")
      }

      // Agregar habilidades
      for (const hab of habilidadesSeleccionadas) {
        await addHabilidadVacante(vacanteId, {
          habilidadId: hab.habilidadId,
          nivel: hab.nivel,
          requerido: hab.requerido
        })
      }

      // Agregar lenguajes
      for (const len of lenguajesSeleccionados) {
        await addLenguajeVacante(vacanteId, {
          lenguajeId: len.lenguajeId,
          nivel: len.nivel
        })
      }

      onSuccess()
      handleClose()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al guardar la vacante")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      titulo: "",
      descripcion: "",
      salario_minimo: "",
      salario_maximo: "",
      empresaId: empresaId,
      modalidadId: "",
      horarioId: "",
    })
    setHabilidadesSeleccionadas([])
    setLenguajesSeleccionados([])
    setNuevaHabilidad({ habilidadId: "", nivel: 5, requerido: "NO" })
    setNuevoLenguaje({ lenguajeId: "", nivel: 5 })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {vacanteToEdit ? "Editar Vacante" : "Nueva Vacante"}
          </DialogTitle>
          <DialogDescription>
            {vacanteToEdit 
              ? "Actualiza la información de la vacante" 
              : "Crea una nueva vacante para tu empresa"}
          </DialogDescription>
        </DialogHeader>

        {loadingCatalogos ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ScrollArea className="max-h-[calc(90vh-200px)]">
            <div className="space-y-6 pr-4">
              {/* Información Básica */}
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <h3 className="font-semibold text-lg">Información Básica</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="titulo">Título de la Vacante *</Label>
                    <Input
                      id="titulo"
                      placeholder="ej. Desarrollador Full Stack Senior"
                      value={formData.titulo}
                      onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descripcion">Descripción *</Label>
                    <Textarea
                      id="descripcion"
                      placeholder="Describe las responsabilidades, requisitos y beneficios del puesto..."
                      rows={5}
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="salario_minimo">Salario Mínimo</Label>
                      <Input
                        id="salario_minimo"
                        type="number"
                        placeholder="0"
                        value={formData.salario_minimo}
                        onChange={(e) => setFormData({ ...formData, salario_minimo: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="salario_maximo">Salario Máximo</Label>
                      <Input
                        id="salario_maximo"
                        type="number"
                        placeholder="0"
                        value={formData.salario_maximo}
                        onChange={(e) => setFormData({ ...formData, salario_maximo: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="modalidad">Modalidad *</Label>
                      <Select
                        value={formData.modalidadId}
                        onValueChange={(value) => setFormData({ ...formData, modalidadId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona modalidad" />
                        </SelectTrigger>
                        <SelectContent>
                          {modalidades.map((modalidad) => (
                            <SelectItem key={modalidad.id} value={modalidad.id}>
                              {modalidad.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="horario">Horario *</Label>
                      <Select
                        value={formData.horarioId}
                        onValueChange={(value) => setFormData({ ...formData, horarioId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona horario" />
                        </SelectTrigger>
                        <SelectContent>
                          {horarios.map((horario) => (
                            <SelectItem key={horario.id} value={horario.id}>
                              {horario.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Habilidades Requeridas */}
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    <h3 className="font-semibold text-lg">Habilidades Técnicas</h3>
                  </div>

                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-5">
                      <Popover open={habilidadPopoverOpen} onOpenChange={setHabilidadPopoverOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={habilidadPopoverOpen}
                            className="w-full justify-between"
                          >
                            {nuevaHabilidad.habilidadId
                              ? habilidades.find((h) => h.id === nuevaHabilidad.habilidadId)?.nombre
                              : "Selecciona habilidad..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Buscar habilidad..." />
                            <CommandList>
                              <CommandEmpty>No se encontraron habilidades.</CommandEmpty>
                              <CommandGroup>
                                {habilidades.map((hab) => (
                                  <CommandItem
                                    key={hab.id}
                                    value={hab.nombre}
                                    onSelect={() => {
                                      setNuevaHabilidad({ ...nuevaHabilidad, habilidadId: hab.id })
                                      setHabilidadPopoverOpen(false)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        nuevaHabilidad.habilidadId === hab.id ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {hab.nombre}
                                    {hab.categoria && (
                                      <span className="ml-auto text-xs text-muted-foreground">
                                        {hab.categoria.nombre}
                                      </span>
                                    )}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        min="0"
                        max="10"
                        placeholder="Nivel (0-10)"
                        value={nuevaHabilidad.nivel}
                        onChange={(e) => setNuevaHabilidad({ ...nuevaHabilidad, nivel: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="col-span-3">
                      <Select
                        value={nuevaHabilidad.requerido}
                        onValueChange={(value: "SI" | "NO") => setNuevaHabilidad({ ...nuevaHabilidad, requerido: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SI">Requerida</SelectItem>
                          <SelectItem value="NO">Deseable</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="button"
                      onClick={agregarHabilidad}
                      size="icon"
                      className="col-span-1"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {habilidadesSeleccionadas.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        {habilidadesSeleccionadas.map((hab) => (
                          <div key={hab.habilidadId} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div>
                                <p className="font-medium">{hab.habilidad.nombre}</p>
                                {hab.habilidad.categoria && (
                                  <p className="text-xs text-muted-foreground">{hab.habilidad.categoria.nombre}</p>
                                )}
                              </div>
                              <Badge variant="secondary">Nivel {hab.nivel}</Badge>
                              <Badge variant={hab.requerido === "SI" ? "default" : "outline"}>
                                {hab.requerido === "SI" ? "Requerida" : "Deseable"}
                              </Badge>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => eliminarHabilidad(hab.habilidadId)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Idiomas Requeridos */}
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Languages className="h-5 w-5" />
                    <h3 className="font-semibold text-lg">Idiomas</h3>
                  </div>

                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-7">
                      <Popover open={lenguajePopoverOpen} onOpenChange={setLenguajePopoverOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={lenguajePopoverOpen}
                            className="w-full justify-between"
                          >
                            {nuevoLenguaje.lenguajeId
                              ? lenguajes.find((l) => l.id === nuevoLenguaje.lenguajeId)?.nombre
                              : "Selecciona idioma..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Buscar idioma..." />
                            <CommandList>
                              <CommandEmpty>No se encontraron idiomas.</CommandEmpty>
                              <CommandGroup>
                                {lenguajes.map((len) => (
                                  <CommandItem
                                    key={len.id}
                                    value={len.nombre}
                                    onSelect={() => {
                                      setNuevoLenguaje({ ...nuevoLenguaje, lenguajeId: len.id })
                                      setLenguajePopoverOpen(false)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        nuevoLenguaje.lenguajeId === len.id ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {len.nombre}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="col-span-4">
                      <Input
                        type="number"
                        min="0"
                        max="10"
                        placeholder="Nivel (0-10)"
                        value={nuevoLenguaje.nivel}
                        onChange={(e) => setNuevoLenguaje({ ...nuevoLenguaje, nivel: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={agregarLenguaje}
                      size="icon"
                      className="col-span-1"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {lenguajesSeleccionados.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        {lenguajesSeleccionados.map((len) => (
                          <div key={len.lenguajeId} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <p className="font-medium">{len.lenguaje.nombre}</p>
                              <Badge variant="secondary">Nivel {len.nivel}</Badge>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => eliminarLenguaje(len.lenguajeId)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading || loadingCatalogos}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              vacanteToEdit ? "Actualizar Vacante" : "Crear Vacante"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
