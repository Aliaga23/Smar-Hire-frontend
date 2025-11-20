import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CandidatoNavbar } from "../components/CandidatoNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, FileText, Save, ArrowLeft, Upload, Plus, Trash2, Briefcase, GraduationCap, MapPin, Calendar, Building } from "lucide-react";
import { useCurrentUser } from "../utils/auth";
import { getCandidatoProfile, updateCandidatoProfile, parseCvWithAI, uploadProfilePhoto } from "@/services/candidato";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfile } from "@/contexts/ProfileContext";
import { 
  getExperiencias, 
  createExperiencia, 
  deleteExperiencia,
  type Experiencia,
  type CreateExperienciaDto 
} from "@/services/experiencia";
import {
  getEducaciones,
  createEducacion,
  deleteEducacion,
  type Educacion,
  type CreateEducacionDto
} from "@/services/educacion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProfileData {
  titulo: string;
  bio: string;
  ubicacion: string;
  foto_perfil_url: string;
}

export default function EditarPerfilCandidato() {
  const navigate = useNavigate();
  const { isAuthenticated, isCandidato } = useCurrentUser();
  const { updateFotoPerfil } = useProfile();

  const [loading, setLoading] = useState(false);
  const [processingCV, setProcessingCV] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    titulo: "",
    bio: "",
    ubicacion: "",
    foto_perfil_url: "",
  });

  // Estados para experiencia
  const [experiencias, setExperiencias] = useState<Experiencia[]>([]);
  const [loadingExperiencias, setLoadingExperiencias] = useState(false);
  const [showAddExperiencia, setShowAddExperiencia] = useState(false);
  const [newExperiencia, setNewExperiencia] = useState<CreateExperienciaDto>({
    titulo: "",
    empresa: "",
    descripcion: "",
    ubicacion: "",
    fecha_comienzo: "",
    fecha_final: null,
  });

  // Estados para educación
  const [educaciones, setEducaciones] = useState<Educacion[]>([]);
  const [loadingEducaciones, setLoadingEducaciones] = useState(false);
  const [showAddEducacion, setShowAddEducacion] = useState(false);
  const [newEducacion, setNewEducacion] = useState<CreateEducacionDto>({
    titulo: "",
    institucion: "",
    descripcion: "",
    estado: "EN_CURSO",
    fecha_comienzo: "",
    fecha_final: null,
  });

  useEffect(() => {
    if (!isAuthenticated || !isCandidato) {
      navigate("/login");
      return;
    }
    fetchProfile();
  }, [isAuthenticated, isCandidato, navigate]);

  const fetchProfile = async () => {
    try {
      const data = await getCandidatoProfile();
      setProfileData({
        titulo: data.titulo || "",
        bio: data.bio || "",
        ubicacion: data.ubicacion || "",
        foto_perfil_url: data.foto_perfil_url || "",
      });
      
      // Cargar experiencias y educaciones
      await Promise.all([
        fetchExperiencias(),
        fetchEducaciones()
      ]);
    } catch (error) {
      toast.error("No se pudo cargar el perfil");
    }
  };

  const fetchExperiencias = async () => {
    try {
      setLoadingExperiencias(true);
      const data = await getExperiencias();
      setExperiencias(data);
    } catch (error) {
      console.error("Error loading experiencias:", error);
    } finally {
      setLoadingExperiencias(false);
    }
  };

  const fetchEducaciones = async () => {
    try {
      setLoadingEducaciones(true);
      const data = await getEducaciones();
      setEducaciones(data);
    } catch (error) {
      console.error("Error loading educaciones:", error);
    } finally {
      setLoadingEducaciones(false);
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // Crear objeto solo con campos que tienen valor
      const dataToSend: Partial<ProfileData> = {};
      if (profileData.titulo?.trim()) dataToSend.titulo = profileData.titulo.trim();
      if (profileData.bio?.trim()) dataToSend.bio = profileData.bio.trim();
      if (profileData.ubicacion?.trim()) dataToSend.ubicacion = profileData.ubicacion.trim();
      if (profileData.foto_perfil_url?.trim()) dataToSend.foto_perfil_url = profileData.foto_perfil_url.trim();

      await updateCandidatoProfile(dataToSend);

      toast.success("¡Perfil actualizado!", {
        description: "Tus cambios se han guardado correctamente",
      });

      navigate("/dashboard-candidato");
    } catch (error) {
      toast.error("No se pudo actualizar el perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleCVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo (imagen)
    if (!file.type.startsWith("image/")) {
      toast.error("Archivo no válido", {
        description: "Por favor sube una imagen de tu CV (JPG, PNG, etc.)",
      });
      return;
    }

    setProcessingCV(true);

    try {
      // Convertir imagen a base64
      const reader = new FileReader();
      
      const imageDataPromise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const imageData = await imageDataPromise;

      const updatedProfile = await parseCvWithAI(imageData);

      // Actualizar estado con datos extraídos
      setProfileData({
        titulo: updatedProfile.titulo || profileData.titulo,
        bio: updatedProfile.bio || profileData.bio,
        ubicacion: updatedProfile.ubicacion || profileData.ubicacion,
        foto_perfil_url: updatedProfile.foto_perfil_url || profileData.foto_perfil_url,
      });

      toast.success("¡CV procesado con éxito!", {
        description: "Tu perfil se ha completado automáticamente con la información del CV",
      });
    } catch (error) {
      toast.error("Error al procesar CV", {
        description: "No se pudo analizar el archivo. Verifica que contenga información válida.",
      });
    } finally {
      setProcessingCV(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor selecciona un archivo de imagen válido");
      return;
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen no debe superar los 5MB");
      return;
    }

    try {
      setUploadingPhoto(true);
      
      const reader = new FileReader();
      
      const imageDataPromise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const imageData = await imageDataPromise;

      const response = await uploadProfilePhoto(imageData);

      // Actualizar estado local con nueva URL de foto
      setProfileData(prev => ({
        ...prev,
        foto_perfil_url: response.foto_perfil_url
      }));

      // Actualizar contexto global para que se refleje en navbar
      updateFotoPerfil(response.foto_perfil_url);

      toast.success("¡Foto de perfil actualizada!", {
        description: "Tu foto ha sido subida exitosamente",
      });
    } catch (error) {
      console.error("Error al subir foto:", error);
      toast.error("Error al subir foto", {
        description: "No se pudo subir la imagen. Intenta nuevamente.",
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  // ==================== FUNCIONES EXPERIENCIA ====================
  const handleAddExperiencia = async () => {
    if (!newExperiencia.titulo || !newExperiencia.empresa || !newExperiencia.fecha_comienzo) {
      toast.error("Campos requeridos", {
        description: "Completa título, empresa y fecha de inicio",
      });
      return;
    }

    try {
      await createExperiencia(newExperiencia);
      toast.success("Experiencia agregada");
      await fetchExperiencias();
      setShowAddExperiencia(false);
      setNewExperiencia({
        titulo: "",
        empresa: "",
        descripcion: "",
        ubicacion: "",
        fecha_comienzo: "",
        fecha_final: null,
      });
    } catch (error) {
      toast.error("No se pudo agregar la experiencia");
    }
  };

  const handleDeleteExperiencia = async (id: string) => {
    try {
      await deleteExperiencia(id);
      toast.success("Experiencia eliminada");
      await fetchExperiencias();
    } catch (error) {
      toast.error("No se pudo eliminar la experiencia");
    }
  };

  // ==================== FUNCIONES EDUCACIÓN ====================
  const handleAddEducacion = async () => {
    if (!newEducacion.titulo || !newEducacion.institucion || !newEducacion.estado) {
      toast.error("Campos requeridos", {
        description: "Completa título, institución y estado",
      });
      return;
    }

    try {
      await createEducacion(newEducacion);
      toast.success("Educación agregada");
      await fetchEducaciones();
      setShowAddEducacion(false);
      setNewEducacion({
        titulo: "",
        institucion: "",
        descripcion: "",
        estado: "EN_CURSO",
        fecha_comienzo: "",
        fecha_final: null,
      });
    } catch (error) {
      toast.error("No se pudo agregar la educación");
    }
  };

  const handleDeleteEducacion = async (id: string) => {
    try {
      await deleteEducacion(id);
      toast.success("Educación eliminada");
      await fetchEducaciones();
    } catch (error) {
      toast.error("No se pudo eliminar la educación");
    }
  };

  return (
    <>
      <CandidatoNavbar />
      <main className="container mx-auto p-6 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Editar Perfil Profesional</h1>
            <p className="text-muted-foreground mt-1">
              Actualiza tu información y mantén tu perfil al día
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/dashboard-candidato")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>

        {/* Single Professional Card */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Información del Perfil</CardTitle>
                <CardDescription className="mt-1">
                  Completa tu perfil manualmente o usa IA para extraer información de tu CV
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="cv-upload">
                  <Button variant="outline" size="sm" disabled={processingCV} asChild>
                    <span className="cursor-pointer">
                      <FileText className="h-4 w-4 mr-2" />
                      {processingCV ? "Procesando..." : "Cargar CV con IA"}
                    </span>
                  </Button>
                </label>
                <Input
                  id="cv-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleCVUpload}
                  disabled={processingCV}
                  className="hidden"
                />
              </div>
            </div>
            {processingCV && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-3 bg-muted/50 p-3 rounded-md">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>GPT-4 Vision está analizando tu CV...</span>
              </div>
            )}
          </CardHeader>

          <CardContent className="p-6">
            <div className="grid gap-6">
              {/* Row 1: Título y Ubicación */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="titulo" className="text-sm font-medium">
                    Título Profesional <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="titulo"
                    placeholder="Ej: Full Stack Developer"
                    value={profileData.titulo}
                    onChange={(e) => handleInputChange("titulo", e.target.value)}
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ubicacion" className="text-sm font-medium">
                    Ubicación <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="ubicacion"
                    placeholder="Ej: Ciudad de México, CDMX"
                    value={profileData.ubicacion}
                    onChange={(e) => handleInputChange("ubicacion", e.target.value)}
                    className="h-10"
                  />
                </div>
              </div>

              {/* Row 2: Biografía */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm font-medium">
                  Biografía Profesional
                </Label>
                <Textarea
                  id="bio"
                  placeholder="Describe tu experiencia, habilidades y logros profesionales..."
                  rows={6}
                  value={profileData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Máximo 200 palabras. Destaca tu experiencia más relevante.
                </p>
              </div>

              {/* Row 3: Foto de Perfil */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Foto de Perfil
                </Label>
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24">
                    {profileData.foto_perfil_url ? (
                      <AvatarImage src={profileData.foto_perfil_url} alt="Foto de perfil" />
                    ) : (
                      <AvatarFallback className="text-2xl bg-primary/10">
                        {profileData.titulo?.charAt(0) || "?"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1">
                    <label htmlFor="photo-upload">
                      <Button 
                        variant="outline" 
                        disabled={uploadingPhoto}
                        asChild
                      >
                        <span className="cursor-pointer gap-2">
                          {uploadingPhoto ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Subiendo...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4" />
                              Cambiar Foto
                            </>
                          )}
                        </span>
                      </Button>
                    </label>
                    <Input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={uploadingPhoto}
                      className="hidden"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      JPG, PNG o GIF. Máximo 5MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Row 3: Foto de Perfil */}
              <div className="space-y-2">
                <Label htmlFor="foto" className="text-sm font-medium">
                  URL de Foto de Perfil
                </Label>
                <Input
                  id="foto"
                  type="url"
                  placeholder="https://ejemplo.com/mi-foto.jpg"
                  value={profileData.foto_perfil_url}
                  onChange={(e) => handleInputChange("foto_perfil_url", e.target.value)}
                  className="h-10"
                />
                <p className="text-xs text-muted-foreground">
                  Ingresa la URL de tu foto profesional. Recomendado: 400x400px, formato JPG o PNG.
                </p>
              </div>
            </div>
          </CardContent>

          <CardContent className="border-t bg-muted/20 p-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                <span className="text-destructive">*</span> Campos requeridos
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate("/dashboard-candidato")}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSaveProfile} disabled={loading}>
                  {loading ? (
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
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
