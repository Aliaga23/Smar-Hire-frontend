import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CandidatoNavbar } from "../components/CandidatoNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, FileText, Save, ArrowLeft } from "lucide-react";
import { useCurrentUser } from "../utils/auth";
import { getCandidatoProfile, updateCandidatoProfile, parseCvWithAI } from "@/services/candidato";

interface ProfileData {
  titulo: string;
  bio: string;
  ubicacion: string;
  foto_perfil_url: string;
}

export default function EditarPerfilCandidato() {
  const navigate = useNavigate();
  const { isAuthenticated, isCandidato } = useCurrentUser();

  const [loading, setLoading] = useState(false);
  const [processingCV, setProcessingCV] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    titulo: "",
    bio: "",
    ubicacion: "",
    foto_perfil_url: "",
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
    } catch (error) {
      toast.error("No se pudo cargar el perfil");
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
