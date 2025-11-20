import api from '@/lib/axios'

export interface CandidatoProfile {
  id: string
  titulo: string
  bio: string
  ubicacion: string
  foto_perfil_url: string | null
  usuario: {
    name: string
    lastname: string
    correo: string
    telefono: string
    fecha_nacimiento: string
  }
  habilidadesCandidato: Array<{
    id: string
    nivel: number
    habilidad: {
      id: string
      nombre: string
      categoria: {
        id: string
        nombre: string
      }
    }
  }>
  lenguajesCandidato: Array<{
    id: string
    nivel: number
    lenguaje: {
      id: string
      nombre: string
    }
  }>
  _count: {
    postulaciones: number
  }
}

export interface UpdateCandidatoDto {
  titulo?: string
  bio?: string
  ubicacion?: string
  foto_perfil_url?: string
}

export interface ParseCvDto {
  imageData: string
}

// Recomendaciones
export interface Recomendacion {
  id: string
  mensaje: string
  candidatoId: string
  vacanteId: string
  creado_en: string
  vacante: {
    id: string
    titulo: string
    empresa: {
      id: string
      name: string
    }
  }
  habilidadesDiferencia: {
    id: string
    diferencia: number
    habilidad: {
      id: string
      nombre: string
    }
  }
  cursos: Array<{
    id: string
    estado: string
    curso: {
      id: string
      nombre: string
      url: string
      nivel: number
    }
  }>
}

// Obtener perfil del candidato autenticado
export const getCandidatoProfile = async (): Promise<CandidatoProfile> => {
  const response = await api.get('/candidatos/profile')
  return response.data
}

// Actualizar perfil del candidato
export const updateCandidatoProfile = async (data: UpdateCandidatoDto): Promise<CandidatoProfile> => {
  const response = await api.patch('/candidatos/profile', data)
  return response.data
}

// Procesar CV con GPT-4 Vision
export const parseCvWithAI = async (imageData: string): Promise<CandidatoProfile> => {
  const response = await api.post('/candidatos/profile/parse-cv', { imageData })
  return response.data
}

// Agregar habilidad
export const addHabilidad = async (habilidadId: string, nivel: number) => {
  const response = await api.post('/candidatos/profile/habilidades', { habilidadId, nivel })
  return response.data
}

// Actualizar habilidad
export const updateHabilidad = async (habilidadId: string, nivel: number) => {
  const response = await api.put(`/candidatos/profile/habilidades/${habilidadId}`, { nivel })
  return response.data
}

// Eliminar habilidad
export const deleteHabilidad = async (habilidadId: string) => {
  const response = await api.delete(`/candidatos/profile/habilidades/${habilidadId}`)
  return response.data
}

// Agregar lenguaje
export const addLenguaje = async (lenguajeId: string, nivel: number) => {
  const response = await api.post('/candidatos/profile/lenguajes', { lenguajeId, nivel })
  return response.data
}

// Actualizar lenguaje
export const updateLenguaje = async (lenguajeId: string, nivel: number) => {
  const response = await api.put(`/candidatos/profile/lenguajes/${lenguajeId}`, { nivel })
  return response.data
}

// Eliminar lenguaje
export const deleteLenguaje = async (lenguajeId: string) => {
  const response = await api.delete(`/candidatos/profile/lenguajes/${lenguajeId}`)
  return response.data
}

// Obtener recomendaciones personalizadas con cursos
export const getRecomendaciones = async () => {
  const response = await api.get('/candidatos/recomendaciones')
  return response.data
}

// Subir foto de perfil
export const uploadProfilePhoto = async (imageData: string) => {
  const response = await api.post('/candidatos/profile/upload-photo', { imageData })
  return response.data
}