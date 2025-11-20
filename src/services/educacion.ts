import api from '@/lib/axios'

export interface Educacion {
  id: string
  titulo: string
  institucion: string
  descripcion: string | null
  estado: 'COMPLETADO' | 'EN_CURSO' | 'INCOMPLETO'
  fecha_comienzo: string | null
  fecha_final: string | null
  candidatoId: string
}

export interface CreateEducacionDto {
  titulo: string
  institucion: string
  descripcion?: string
  estado: 'COMPLETADO' | 'EN_CURSO' | 'INCOMPLETO'
  fecha_comienzo?: string
  fecha_final?: string | null
}

export interface UpdateEducacionDto {
  titulo?: string
  institucion?: string
  descripcion?: string
  estado?: 'COMPLETADO' | 'EN_CURSO' | 'INCOMPLETO'
  fecha_comienzo?: string
  fecha_final?: string | null
}

// Crear educación
export const createEducacion = async (data: CreateEducacionDto): Promise<Educacion> => {
  const response = await api.post('/educacion', data)
  return response.data
}

// Listar toda mi educación
export const getEducaciones = async (): Promise<Educacion[]> => {
  const response = await api.get('/educacion')
  return response.data
}

// Obtener una educación específica
export const getEducacion = async (id: string): Promise<Educacion> => {
  const response = await api.get(`/educacion/${id}`)
  return response.data
}

// Actualizar educación
export const updateEducacion = async (id: string, data: UpdateEducacionDto): Promise<Educacion> => {
  const response = await api.patch(`/educacion/${id}`, data)
  return response.data
}

// Eliminar educación
export const deleteEducacion = async (id: string): Promise<void> => {
  await api.delete(`/educacion/${id}`)
}
