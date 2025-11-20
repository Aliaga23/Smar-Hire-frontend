import api from '@/lib/axios'

// Tipos
export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationMeta
}

export interface Postulacion {
  id: string
  candidatoId: string
  vacanteId: string
  creado_en: string
  puntuacion_compatibilidad?: number
  candidato?: {
    id: string
    titulo?: string
    bio?: string
    ubicacion?: string
    foto_perfil_url?: string
    usuarioId: string
    usuario: {
      name: string
      lastname: string
      correo: string
      telefono?: string
    }
    habilidadesCandidato?: Array<{
      nivel: number
      habilidad: {
        id: string
        nombre: string
        categoria?: {
          nombre: string
        }
      }
    }>
    lenguajesCandidato?: Array<{
      nivel: number
      lenguaje: {
        id: string
        nombre: string
      }
    }>
    experiencias?: Array<{
      id: string
      titulo: string
      empresa: string
      ubicacion?: string
      fecha_comienzo?: string
      fecha_final?: string
      descripcion?: string
    }>
    educaciones?: Array<{
      id: string
      titulo: string
      institucion: string
      estado: string
      fecha_comienzo?: string
      fecha_final?: string
      descripcion?: string
    }>
  }
  vacante?: {
    id: string
    titulo: string
    descripcion: string
    salario_minimo?: number
    salario_maximo?: number
    creado_en: string
    estado: 'ABIERTA' | 'CERRADA' | 'PAUSADA'
    empresaId: string
    reclutadorId: string
    modalidadId: string
    horarioId: string
    empresa?: {
      id: string
      name: string
      descripcion?: string
      area?: string
    }
    modalidad?: {
      id: string
      nombre: string
    }
    horario?: {
      id: string
      nombre: string
    }
  }
}

export interface CreatePostulacionDto {
  vacanteId: string
}

// Funciones del servicio

// Crear postulación (solo candidatos)
export const createPostulacion = async (data: CreatePostulacionDto): Promise<Postulacion> => {
  const response = await api.post('/postulaciones', data)
  return response.data
}

// Ver mis postulaciones (solo candidatos)
export const getMisPostulaciones = async (page: number = 1, limit: number = 10): Promise<PaginatedResponse<Postulacion>> => {
  const response = await api.get('/postulaciones/mis-postulaciones', {
    params: { page, limit }
  })
  return response.data
}

// Ver postulaciones de una vacante (solo reclutadores)
export const getPostulacionesByVacante = async (vacanteId: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Postulacion>> => {
  const response = await api.get(`/postulaciones/vacante/${vacanteId}`, {
    params: { page, limit }
  })
  return response.data
}

// Ver postulación específica
export const getPostulacion = async (id: string): Promise<Postulacion> => {
  const response = await api.get(`/postulaciones/${id}`)
  return response.data
}

// Eliminar postulación (solo candidatos)
export const deletePostulacion = async (id: string): Promise<void> => {
  await api.delete(`/postulaciones/${id}`)
}
