import api from '@/lib/axios'

export interface Vacante {
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
  _count?: {
    postulaciones: number
    habilidadesVacante?: number
  }
}

// Obtener todas las vacantes con filtros opcionales
export const getVacantes = async (filtros?: { 
  estado?: string
  empresaId?: string
  modalidadId?: string 
}) => {
  const params = new URLSearchParams()
  if (filtros?.estado) params.append('estado', filtros.estado)
  if (filtros?.empresaId) params.append('empresaId', filtros.empresaId)
  if (filtros?.modalidadId) params.append('modalidadId', filtros.modalidadId)
  
  const response = await api.get(`/vacantes?${params.toString()}`)
  return response.data
}

// Obtener una vacante por ID
export const getVacante = async (id: string) => {
  const response = await api.get(`/vacantes/${id}`)
  return response.data
}

// Crear una nueva vacante
export const createVacante = async (data: {
  titulo: string
  descripcion: string
  salario_minimo?: number
  salario_maximo?: number
  empresaId: string
  modalidadId: string
  horarioId: string
}) => {
  const response = await api.post('/vacantes', data)
  return response.data
}

// Actualizar una vacante
export const updateVacante = async (id: string, data: Partial<Vacante>) => {
  const response = await api.patch(`/vacantes/${id}`, data)
  return response.data
}

// Eliminar una vacante
export const deleteVacante = async (id: string) => {
  const response = await api.delete(`/vacantes/${id}`)
  return response.data
}

// Cambiar estado de una vacante
export const updateEstadoVacante = async (id: string, estado: string) => {
  const response = await api.patch(`/vacantes/${id}/estado`, { estado })
  return response.data
}

// Obtener todas las modalidades
export const getModalidades = async () => {
  const response = await api.get('/modalidades')
  return response.data
}

// Obtener todos los horarios
export const getHorarios = async () => {
  const response = await api.get('/horarios')
  return response.data
}

// Agregar habilidad a una vacante
export const addHabilidadVacante = async (
  vacanteId: string,
  data: { habilidadId: string; nivel: number; requerido: "SI" | "NO" }
) => {
  const response = await api.post(`/vacantes/${vacanteId}/habilidades`, data)
  return response.data
}

// Eliminar habilidad de una vacante
export const removeHabilidadVacante = async (vacanteId: string, habilidadId: string) => {
  const response = await api.delete(`/vacantes/${vacanteId}/habilidades/${habilidadId}`)
  return response.data
}

// Agregar lenguaje a una vacante
export const addLenguajeVacante = async (
  vacanteId: string,
  data: { lenguajeId: string; nivel: number }
) => {
  const response = await api.post(`/vacantes/${vacanteId}/lenguajes`, data)
  return response.data
}

// Eliminar lenguaje de una vacante
export const removeLenguajeVacante = async (vacanteId: string, lenguajeId: string) => {
  const response = await api.delete(`/vacantes/${vacanteId}/lenguajes/${lenguajeId}`)
  return response.data
}
