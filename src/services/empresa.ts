import api from '@/lib/axios'

export const getEmpresaAnalytics = async (empresaId: string) => {
  const response = await api.get(`/empresas/${empresaId}/analytics`)
  return response.data
}

export const getEmpresaDashboard = async (empresaId: string) => {
  const response = await api.get(`/empresas/${empresaId}/dashboard`)
  return response.data
}

export const getEmpresaById = async (empresaId: string) => {
  const response = await api.get(`/empresas/${empresaId}`)
  return response.data
}

export const updateEmpresa = async (empresaId: string, data: any) => {
  const response = await api.patch(`/empresas/${empresaId}`, data)
  return response.data
}

// Obtener reclutadores de la empresa
export const getReclutadores = async (empresaId: string) => {
  const response = await api.get(`/empresas/${empresaId}/reclutadores`)
  return response.data
}

// Editar un reclutador
export const updateReclutador = async (reclutadorId: string, data: any) => {
  const response = await api.patch(`/empresas/reclutadores/${reclutadorId}`, data)
  return response.data
}

// Editar información de la empresa
export const updateEmpresaInfo = async (empresaId: string, data: any) => {
  const response = await api.patch(`/empresas/${empresaId}/info`, data)
  return response.data
}

// Activar/Desactivar reclutador
export const toggleReclutadorEstado = async (reclutadorId: string) => {
  const response = await api.patch(`/empresas/reclutadores/${reclutadorId}/toggle-estado`)
  return response.data
}
