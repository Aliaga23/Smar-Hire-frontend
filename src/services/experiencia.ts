import api from '@/lib/axios'

export interface Experiencia {
  id: string
  titulo: string
  empresa: string
  descripcion: string | null
  ubicacion: string | null
  fecha_comienzo: string
  fecha_final: string | null
  candidatoId: string
}

export interface CreateExperienciaDto {
  titulo: string
  empresa: string
  descripcion?: string
  ubicacion?: string
  fecha_comienzo: string
  fecha_final?: string | null
}

export interface UpdateExperienciaDto {
  titulo?: string
  empresa?: string
  descripcion?: string
  ubicacion?: string
  fecha_comienzo?: string
  fecha_final?: string | null
}

// Crear experiencia
export const createExperiencia = async (data: CreateExperienciaDto): Promise<Experiencia> => {
  const response = await api.post('/experiencia', data)
  return response.data
}

// Listar todas mis experiencias
export const getExperiencias = async (): Promise<Experiencia[]> => {
  const response = await api.get('/experiencia')
  return response.data
}

// Obtener una experiencia específica
export const getExperiencia = async (id: string): Promise<Experiencia> => {
  const response = await api.get(`/experiencia/${id}`)
  return response.data
}

// Actualizar experiencia
export const updateExperiencia = async (id: string, data: UpdateExperienciaDto): Promise<Experiencia> => {
  const response = await api.patch(`/experiencia/${id}`, data)
  return response.data
}

// Eliminar experiencia
export const deleteExperiencia = async (id: string): Promise<void> => {
  await api.delete(`/experiencia/${id}`)
}
