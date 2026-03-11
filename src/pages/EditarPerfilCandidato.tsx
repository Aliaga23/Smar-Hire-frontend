import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CandidatoNavbar } from "../components/CandidatoNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, FileText, Save, Upload, Trash2, MapPin, User, Star, Eye, RefreshCw } from "lucide-react";
import { useCurrentUser } from "../utils/auth";
import { getCandidatoProfile, updateCandidatoProfile, parseCvWithAI, uploadCV, deleteProfile } from "@/services/candidato";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ProfileData {
  titulo: string;
  bio: string;
  ubicacion: string;
  foto_perfil_url: string;
  cv_url: string;
}

export default function EditarPerfilCandidato() {
  const navigate = useNavigate();
  const { isAuthenticated, isCandidato, logout } = useCurrentUser();

  const [loading, setLoading] = useState(false);
  const [processingCV, setProcessingCV] = useState(false);
  const [uploadingCV, setUploadingCV] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    titulo: "",
    bio: "",
    ubicacion: "",
    foto_perfil_url: "",
    cv_url: "",
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
        cv_url: data.cv_url || "",
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

  const handleDeleteProfile = async () => {
    setDeleting(true);
    try {
      await deleteProfile();
      toast.success("Cuenta eliminada", {
        description: "Tu perfil y todos tus datos han sido eliminados",
      });
      logout();
      navigate("/");
    } catch (error) {
      toast.error("No se pudo eliminar la cuenta");
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleCVParse = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo (imagen o PDF)
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error("Archivo no válido", {
        description: "Por favor sube una imagen (JPG, PNG) o PDF de tu CV",
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
        cv_url: profileData.cv_url,
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

  const handleCVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      toast.error("Formato no válido", {
        description: "Solo se permiten archivos PDF, DOC o DOCX",
      });
      return;
    }

    // Validar tamaño (máx 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Archivo muy grande", {
        description: "El CV no debe superar los 10MB",
      });
      return;
    }

    try {
      setUploadingCV(true);

      const reader = new FileReader();
      const fileDataPromise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const fileData = await fileDataPromise;

      const response = await uploadCV(fileData);

      // Actualizar estado local con nueva URL de CV
      setProfileData(prev => ({
        ...prev,
        cv_url: response.cv_url
      }));

      toast.success("¡CV subido exitosamente!", {
        description: "Tu curriculum ha sido guardado",
      });
    } catch (error) {
      console.error("Error al subir CV:", error);
      toast.error("Error al subir CV", {
        description: "No se pudo subir el archivo. Intenta nuevamente.",
      });
    } finally {
      setUploadingCV(false);
    }
  };

  return (
    <>
      <CandidatoNavbar />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-10 max-w-5xl">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl font-bold tracking-tight">Editar Perfil Profesional</h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Actualiza tu información y mantén tu perfil al día
            </p>
          </div>

          <div className="space-y-8">
            {/* Profile Preview Card */}
            <Card className="border-none shadow-md overflow-hidden">
              <div className="border-b p-8">
                <div className="flex items-start gap-5">
                  <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                    {profileData.foto_perfil_url ? (
                      <AvatarImage src={profileData.foto_perfil_url} alt="Foto de perfil" />
                    ) : (
                      <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                        {profileData.titulo?.charAt(0) || "?"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-bold text-foreground">
                          {profileData.titulo || "Tu Título Profesional"}
                        </h2>
                        <div className="flex items-center gap-1.5 text-muted-foreground mt-1">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm">{profileData.ubicacion || "Tu ubicación"}</span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="gap-1 shrink-0">
                        <Star className="h-3 w-3" />
                        4.9
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                      {profileData.bio || "Tu biografía profesional aparecerá aquí..."}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Profile Information Card */}
            <Card className="border-none shadow-md">
              <CardHeader className="border-b bg-muted/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Información del Perfil</CardTitle>
                      <CardDescription>
                        Completa tu perfil manualmente o usa IA para extraer información de tu CV
                      </CardDescription>
                    </div>
                  </div>
                  <label htmlFor="cv-upload">
                    <Button variant="outline" size="sm" disabled={processingCV} asChild>
                      <span className="cursor-pointer gap-2">
                        {processingCV ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Procesando...
                          </>
                        ) : (
                          <>
                            <FileText className="h-4 w-4" />
                            Cargar CV con IA
                          </>
                        )}
                      </span>
                    </Button>
                  </label>
                  <Input
                    id="cv-upload"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleCVParse}
                    disabled={processingCV}
                    className="hidden"
                  />
                </div>
                {processingCV && (
                  <div className="flex items-center gap-2 text-sm text-primary mt-4 bg-primary/5 p-3 rounded-lg border border-primary/20">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Nuestro OCR está analizando tu CV...</span>
                  </div>
                )}
              </CardHeader>

              <CardContent className="p-8 space-y-8">
                {/* Título Profesional */}
                <div className="space-y-2">
                  <Label htmlFor="titulo" className="text-sm font-medium">
                    Título Profesional <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="titulo"
                    placeholder="Ej: Full Stack Developer"
                    value={profileData.titulo}
                    onChange={(e) => handleInputChange("titulo", e.target.value)}
                    className="h-12 text-base"
                  />
                </div>

                {/* Ubicación */}
                <div className="space-y-2">
                  <Label htmlFor="ubicacion" className="text-sm font-medium">
                    Ubicación <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="ubicacion"
                    placeholder="Ej: Santa Cruz de la Sierra, Bolivia"
                    value={profileData.ubicacion}
                    onChange={(e) => handleInputChange("ubicacion", e.target.value)}
                    className="h-12 text-base"
                  />
                </div>

                {/* Biografía */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="bio" className="text-sm font-medium">
                      Biografía Profesional
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      {profileData.bio?.split(/\s+/).filter(Boolean).length || 0} / 200 palabras
                    </span>
                  </div>
                  <Textarea
                    id="bio"
                    placeholder="Desarrollador Full Stack especializado en aplicaciones web y móviles utilizando tecnologías como React, Angular y Node.js..."
                    rows={6}
                    value={profileData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    className="resize-none text-base leading-relaxed"
                  />
                  <p className="text-xs text-muted-foreground">
                    Máximo 200 palabras. Destaca tu experiencia más relevante.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* CV Upload Card */}
            <Card className="border-none shadow-md">
              <CardHeader className="border-b bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Curriculum Vitae (CV)</CardTitle>
                    <CardDescription>
                      Formatos: PDF, DOC o DOCX. Máximo 10MB
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-8">
                {/* Upload Zone */}
                <label htmlFor="cv-file-upload" className="block">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-2xl p-10 text-center hover:border-primary/50 hover:bg-muted/30 transition-all duration-200 cursor-pointer">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                      <Upload className="h-8 w-8 text-primary" />
                    </div>
                    <p className="font-semibold text-lg text-foreground">Arrastra tu CV aquí</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      o haz <span className="text-primary">clic</span> para seleccionar un archivo
                    </p>
                    <Button variant="default" size="sm" className="mt-4" disabled={uploadingCV} asChild>
                      <span>
                        {uploadingCV ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Subiendo...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Seleccionar Archivo
                          </>
                        )}
                      </span>
                    </Button>
                  </div>
                </label>
                <Input
                  id="cv-file-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleCVUpload}
                  disabled={uploadingCV}
                  className="hidden"
                />

                {/* Current CV */}
                {profileData.cv_url && (
                  <div className="mt-4 p-4 bg-muted/30 rounded-lg border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-background border flex items-center justify-center">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">CV actual disponible</p>
                        <p className="text-xs text-muted-foreground">PDF, DOC o DOCX. Máximo 10MB</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(profileData.cv_url, '_blank')}
                        className="gap-1.5"
                      >
                        <Eye className="h-4 w-4" />
                        Ver CV
                      </Button>
                      <label htmlFor="cv-file-upload">
                        <Button variant="outline" size="sm" asChild className="gap-1.5 cursor-pointer">
                          <span>
                            <RefreshCw className="h-4 w-4" />
                            Reemplazar
                          </span>
                        </Button>
                      </label>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-3 py-4">
              <Button onClick={handleSaveProfile} disabled={loading} size="lg" className="px-8">
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
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/dashboard-candidato")}
                disabled={loading}
              >
                Cancelar
              </Button>
            </div>

            {/* Danger Zone */}
            <Card className="border-none shadow-md bg-destructive/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                    <Trash2 className="h-5 w-5 text-destructive" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-destructive">Zona de Peligro</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Acciones irreversibles para tu cuenta
                    </p>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteDialogOpen(true)}
                      className="mt-3"
                    >
                      Eliminar cuenta
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Required Fields Note */}
            <p className="text-center text-sm text-muted-foreground">
              <span className="text-destructive">*</span> Campos requeridos
            </p>
          </div>
        </div>
      </main>

      {/* Dialog de confirmación para eliminar cuenta */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de eliminar tu cuenta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán permanentemente:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Tu perfil y datos personales</li>
                <li>Todas tus postulaciones</li>
                <li>Tu historial de educación y experiencia</li>
                <li>Tus habilidades e idiomas registrados</li>
                <li>Tu CV y foto de perfil</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProfile}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Sí, eliminar mi cuenta
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
